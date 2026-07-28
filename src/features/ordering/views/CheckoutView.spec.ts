import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import PresentationChoice from '../ui/configuration/PresentationChoice.vue'
import {
  choosePrintOnlyA4Matte,
  expectFocusOn,
  mountCheckout,
  selectConfigurationValue,
  waitForConfiguration,
} from '../test-support/checkout-view'

describe('CheckoutView', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    document.body.innerHTML = ''
    window.localStorage.clear()
  })

  it('blocks invalid progression with a linked error summary and moves focus to it', async () => {
    const { wrapper } = await mountCheckout()

    await waitForConfiguration(wrapper)
    await wrapper.get('[data-testid="continue-to-details"]').trigger('click')

    await vi.waitFor(() => {
      expect(wrapper.get('[aria-label="Configuration errors"]').text()).toContain(
        'Complete the highlighted fields',
      )
    })

    const summary = wrapper.get('[aria-label="Configuration errors"]')
    expect(summary.findAll('a')).toHaveLength(3)
    expect(summary.find('a').attributes('href')).toBe(
      '#configuration-lines-modern-geometry-07-presentation',
    )
    await expectFocusOn(summary.element)
    expect(wrapper.find('#customer-details-title').exists()).toBe(false)
  })

  it('focuses a sole invalid field and advances only after every required choice is selected', async () => {
    const { wrapper } = await mountCheckout()

    await waitForConfiguration(wrapper)
    await selectConfigurationValue(
      wrapper,
      'configuration-lines-modern-geometry-07-presentation',
      'print-only',
    )
    await selectConfigurationValue(wrapper, 'configuration-lines-modern-geometry-07-size', 'A4')
    await wrapper.get('[data-testid="continue-to-details"]').trigger('click')

    await expectFocusOn(wrapper.get('#configuration-lines-modern-geometry-07-finish').element)

    await choosePrintOnlyA4Matte(wrapper)
    await wrapper.get('[data-testid="continue-to-details"]').trigger('click')

    await vi.waitFor(() => {
      expect(wrapper.get('#customer-details-title').text()).toBe('Your details')
    })
  })

  it('keeps optional gift controls compact until the customer chooses to add them', async () => {
    const { wrapper } = await mountCheckout()

    await waitForConfiguration(wrapper)
    expect(wrapper.get('.order-options__shipping-hint').text()).toContain(
      'Express is available for Print only in A4 or A3.',
    )
    expect(wrapper.find('[data-testid="gift-options-fields"]').exists()).toBe(false)

    await wrapper.get('[data-testid="toggle-gift-options"]').trigger('click')

    expect(wrapper.get('[data-testid="gift-options-fields"]').text()).toContain('Gift message')
  })

  it('removes one Artwork while retaining the other configured items', async () => {
    const { basket, wrapper } = await mountCheckout()

    await waitForConfiguration(wrapper)
    basket.add('coastal-light', 6)

    await vi.waitFor(() => {
      expect(wrapper.findAll('[data-testid^="remove-artwork-"]')).toHaveLength(2)
    })

    await wrapper.get('[data-testid="remove-artwork-modern-geometry-07"]').trigger('click')

    await vi.waitFor(() => {
      expect(basket.lines).toEqual([{ productId: 'coastal-light', quantity: 1 }])
    })
    expect(wrapper.find('[data-testid="remove-artwork-coastal-light"]').exists()).toBe(true)
    expect(wrapper.find('#empty-basket-title').exists()).toBe(false)
  })

  it('returns to the empty Basket state after removing the final Artwork', async () => {
    const { wrapper } = await mountCheckout()

    await waitForConfiguration(wrapper)
    await wrapper.get('[data-testid="remove-artwork-modern-geometry-07"]').trigger('click')

    await vi.waitFor(() => {
      expect(wrapper.get('#empty-basket-title').text()).toBe('Your Basket is empty')
    })
  })

  it('checkpoints configuration before reviewing the Basket and restores it on return', async () => {
    const { wrapper, router } = await mountCheckout({ throughApp: true })

    await waitForConfiguration(wrapper)
    await choosePrintOnlyA4Matte(wrapper)
    await wrapper.get('[data-testid="review-basket"]').trigger('click')

    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('catalogue'))

    await router.push('/checkout')
    await vi.waitFor(() => {
      const presentation = wrapper
        .findAllComponents(PresentationChoice)
        .find(
          (candidate) =>
            candidate.props('inputId') === 'configuration-lines-modern-geometry-07-presentation',
        )

      expect(presentation?.props('modelValue')).toBe('print-only')
    })
  })
})
