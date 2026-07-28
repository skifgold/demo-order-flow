import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { delay, HttpResponse, http } from 'msw'

import { server } from '@/test/msw-server'

import {
  choosePrintOnlyA4Matte,
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

    server.use(
      http.post('*/orders', async () => {
        requestCount += 1
        await delay(80)
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
    await wrapper.get('[data-testid="submit-order"]').trigger('click')

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

    expect(wrapper.find('#order-confirmation-title').exists()).toBe(false)
    expect(basket.isEmpty).toBe(false)
    expect(draft.customerDetails.email).toBe('maya@example.com')
  })

  it('shows safe form-level feedback for an unrecognised 422 field', async () => {
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
  })

  it('keeps the draft available when the server reports an order conflict', async () => {
    server.use(
      http.post('*/orders', () =>
        HttpResponse.json({ type: 'conflict', message: 'Availability changed.' }, { status: 409 }),
      ),
    )

    const { basket, draft, wrapper } = await submitValidOrder()

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain(
        'This order needs review because availability or pricing may have changed.',
      )
    })

    expect(basket.isEmpty).toBe(false)
    expect(draft.customerDetails.fullName).toBe('Maya Chen')
  })

  it.each([
    ['a network failure', () => HttpResponse.error()],
    ['a server failure', () => HttpResponse.json({}, { status: 500 })],
  ])('preserves work after %s', async (_description, response) => {
    server.use(http.post('*/orders', response))

    const { basket, draft, wrapper } = await submitValidOrder()

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('We could not place your order.')
    })

    expect(wrapper.find('#order-confirmation-title').exists()).toBe(false)
    expect(basket.isEmpty).toBe(false)
    expect(draft.customerDetails.fullName).toBe('Maya Chen')
  })
})
