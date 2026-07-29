import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { delay, HttpResponse, http } from 'msw'

import { server } from '@/test/msw-server'
import * as observability from '@/shared/observability/report-unexpected-error'
import { catalogueProducts } from '@/mocks/catalogue.data'

import {
  choosePrintOnlyA4Matte,
  expectFocusOn,
  mountCheckout,
  waitForConfiguration,
} from '../test-support/checkout-view'

async function moveToCustomerDetails() {
  const checkout = await mountCheckout()

  await waitForConfiguration(checkout.wrapper)
  await choosePrintOnlyA4Matte(checkout.wrapper)
  await checkout.wrapper.get('[data-testid="continue-to-details"]').trigger('click')
  await vi.waitFor(() =>
    expect(checkout.wrapper.get('#customer-details-title').text()).toBe('Your details'),
  )

  return checkout
}

async function completeCustomerDetailsForm(
  wrapper: Awaited<ReturnType<typeof moveToCustomerDetails>>['wrapper'],
) {
  await wrapper.get('#customer-details-fullName').setValue('Maya Chen')
  await wrapper.get('#customer-details-email').setValue('maya@example.com')
  await wrapper.get('#customer-details-addressLine1').setValue('1 Market Street')
  await wrapper.get('#customer-details-city').setValue('London')
  await wrapper.get('#customer-details-postcode').setValue('E1 6AN')
  await wrapper.get('#customer-details-termsAccepted').setValue(true)
}

async function submitValidOrder() {
  const checkout = await moveToCustomerDetails()
  await completeCustomerDetailsForm(checkout.wrapper)
  await checkout.wrapper.get('[data-testid="submit-order"]').trigger('click')
  return checkout
}

describe('Checkout submission', () => {
  beforeEach(() => window.localStorage.clear())

  afterEach(() => {
    document.body.innerHTML = ''
    window.localStorage.clear()
    vi.restoreAllMocks()
  })

  it('does not submit incomplete customer details', async () => {
    let requestCount = 0

    server.use(
      http.post('*/orders', () => {
        requestCount += 1
        return HttpResponse.json({})
      }),
    )

    const { wrapper } = await moveToCustomerDetails()
    await wrapper.get('[data-testid="submit-order"]').trigger('click')

    await vi.waitFor(() => {
      expect(wrapper.get('#customer-details-fullName-error').text()).toContain(
        'Enter your full name.',
      )
    })

    expect(requestCount).toBe(0)
  })

  it('offers Back to configuration as the only secondary action on the details step', async () => {
    const { wrapper } = await moveToCustomerDetails()

    expect(wrapper.find('[data-testid="review-basket"]').exists()).toBe(false)

    await wrapper.get('[data-testid="back-to-configuration"]').trigger('click')

    await vi.waitFor(() => {
      expect(wrapper.get('#checkout-title').text()).toBe('Configure your prints')
    })
  })

  it('submits a valid immutable snapshot, clears successful state, and renders confirmation', async () => {
    let submittedOrder: unknown

    server.use(
      http.post('*/orders', async ({ request }) => {
        submittedOrder = await request.json()
        await delay(40)
        return HttpResponse.json(
          {
            orderNumber: 'ORD-77',
            acceptedAt: '2026-07-28T10:00:00.000Z',
            estimatedDeliveryDate: '2026-08-03',
            total: 4195,
          },
          { status: 201 },
        )
      }),
    )

    const { basket, draft, wrapper } = await submitValidOrder()

    await vi.waitFor(() =>
      expect(wrapper.get('#order-confirmation-title').text()).toBe('Thank you for your order'),
    )

    expect(submittedOrder).toMatchObject({
      customer: { fullName: 'Maya Chen', email: 'maya@example.com' },
      deliveryAddress: { addressLine1: '1 Market Street', city: 'London', postcode: 'E1 6AN' },
      termsAccepted: true,
    })
    expect(basket.isEmpty).toBe(true)
    expect(window.localStorage.getItem('demo-order-flow:basket')).toBeNull()
    expect(draft.customerDetails.fullName).toBe('')
    expect(wrapper.text()).toContain('ORD-77')
  })

  it('prevents duplicate submissions while the first order is pending', async () => {
    let requestCount = 0
    let resolveOrder: (() => void) | undefined
    const orderResponse = new Promise<void>((resolve) => {
      resolveOrder = resolve
    })

    server.use(
      http.post('*/orders', async () => {
        requestCount += 1
        await orderResponse
        return HttpResponse.json(
          {
            orderNumber: 'ORD-78',
            acceptedAt: '2026-07-28T10:00:00.000Z',
            estimatedDeliveryDate: '2026-08-03',
            total: 4195,
          },
          { status: 201 },
        )
      }),
    )

    const { wrapper } = await submitValidOrder()
    await vi.waitFor(() => expect(requestCount).toBe(1))

    for (const field of [
      'fullName',
      'email',
      'phone',
      'addressLine1',
      'city',
      'postcode',
      'termsAccepted',
    ]) {
      expect(wrapper.get(`#customer-details-${field}`).attributes('disabled')).toBeDefined()
    }
    expect(wrapper.get('form').attributes('aria-busy')).toBe('true')
    expect(wrapper.get('[role="status"]').text()).toContain('Placing your order')
    expect(wrapper.find('.customer-details-step__submission-overlay').exists()).toBe(true)
    expect(
      wrapper.get('[data-testid="back-to-configuration"]').attributes('disabled'),
    ).toBeDefined()
    expect(wrapper.get('[data-testid="submit-order"]').attributes('disabled')).toBeDefined()

    await wrapper.get('[data-testid="submit-order"]').trigger('click')
    resolveOrder?.()

    await vi.waitFor(() =>
      expect(wrapper.get('#order-confirmation-title').text()).toBe('Thank you for your order'),
    )
    expect(requestCount).toBe(1)
  })

  it('maps recognised 422 field errors and preserves the customer input', async () => {
    server.use(
      http.post('*/orders', () =>
        HttpResponse.json(
          {
            type: 'validation',
            errors: [{ field: 'customer.email', message: 'Use a different email address.' }],
          },
          { status: 422 },
        ),
      ),
    )

    const { basket, draft, wrapper } = await submitValidOrder()

    await vi.waitFor(() => {
      expect(wrapper.get('#customer-details-email-error').text()).toContain(
        'Use a different email address.',
      )
    })

    await expectFocusOn(wrapper.get('#customer-details-email').element)
    expect(wrapper.find('#order-confirmation-title').exists()).toBe(false)
    expect(basket.isEmpty).toBe(false)
    expect(draft.customerDetails.email).toBe('maya@example.com')
  })

  it('shows safe form-level feedback for an unrecognised 422 field', async () => {
    const reportUnexpectedError = vi.spyOn(observability, 'reportUnexpectedError')
    server.use(
      http.post('*/orders', () =>
        HttpResponse.json(
          {
            type: 'validation',
            errors: [{ field: 'internal.shippingRule', message: 'Raw backend message.' }],
          },
          { status: 422 },
        ),
      ),
    )

    const { wrapper } = await submitValidOrder()

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('We could not apply one or more order checks.')
    })

    expect(wrapper.text()).not.toContain('Raw backend message.')
    expect(reportUnexpectedError).toHaveBeenCalledOnce()
    expect(reportUnexpectedError).toHaveBeenCalledWith({
      operation: 'order-submission',
      errorType: 'order-validation',
    })
  })

  it('keeps the draft available when the server reports an order conflict', async () => {
    let productRequestCount = 0
    server.use(
      http.get('*/products', () => {
        productRequestCount += 1
        return HttpResponse.json(catalogueProducts)
      }),
      http.post('*/orders', () =>
        HttpResponse.json(
          {
            type: 'conflict',
            message: 'Availability changed.',
            affectedProductIds: ['modern-geometry-07'],
          },
          { status: 409 },
        ),
      ),
    )

    const { basket, draft, router, wrapper } = await submitValidOrder()

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain(
        'Modern Geometry No. 7 may have changed availability or price.',
      )
    })

    expect(basket.isEmpty).toBe(false)
    expect(draft.customerDetails.fullName).toBe('Maya Chen')
    expect(draft.orderConflict?.affectedProductIds).toEqual(['modern-geometry-07'])
    expect(wrapper.get('[role="alert"]').classes()).toContain('submission-recovery')
    await expectFocusOn(wrapper.get('[role="alert"]').element)
    expect(wrapper.get('[data-testid="submit-order"]').attributes('disabled')).toBeDefined()
    expect(wrapper.find('.order-summary-items__item--affected').exists()).toBe(true)
    expect(productRequestCount).toBeGreaterThanOrEqual(2)

    await wrapper.get('[role="alert"] button').trigger('click')
    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('catalogue'))
    expect(draft.orderConflict).toBeUndefined()
  })

  it.each([
    ['a network failure', () => HttpResponse.error(), 'We could not reach the order service.'],
    [
      'a server failure',
      () => HttpResponse.json({}, { status: 500 }),
      'We could not place your order.',
    ],
  ])('preserves work after %s', async (_description, response, message) => {
    const reportUnexpectedError = vi.spyOn(observability, 'reportUnexpectedError')
    server.use(http.post('*/orders', response))

    const { basket, draft, wrapper } = await submitValidOrder()

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain(message)
    })

    expect(wrapper.find('#order-confirmation-title').exists()).toBe(false)
    expect(basket.isEmpty).toBe(false)
    expect(draft.customerDetails.fullName).toBe('Maya Chen')
    expect(reportUnexpectedError).toHaveBeenCalledOnce()
    await expectFocusOn(wrapper.get('[role="alert"]').element)
    expect(wrapper.find('[data-testid="submit-order"]').exists()).toBe(false)
  })

  it('retries a network failure without losing protected customer input', async () => {
    let requestCount = 0
    server.use(
      http.post('*/orders', () => {
        requestCount += 1

        if (requestCount === 1) {
          return HttpResponse.error()
        }

        return HttpResponse.json(
          {
            orderNumber: 'ORD-RETRY',
            acceptedAt: '2026-07-28T10:00:00.000Z',
            estimatedDeliveryDate: '2026-08-03',
            total: 4195,
          },
          { status: 201 },
        )
      }),
    )

    const { wrapper } = await submitValidOrder()

    await vi.waitFor(() => expect(wrapper.get('[role="alert"]').text()).toContain('Try again'))
    await wrapper.get('[role="alert"] button').trigger('click')

    await vi.waitFor(() => {
      expect(wrapper.get('#order-confirmation-title').text()).toBe('Thank you for your order')
    })
    expect(requestCount).toBe(2)
  })
})
