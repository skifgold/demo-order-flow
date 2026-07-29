import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { catalogueProducts } from '@/mocks/catalogue.data'

import { useOrderDraftStore } from './order-draft.store'

describe('Order Draft store', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('keeps valid configurations when a Basket quantity changes and adds empty new items', () => {
    const draft = useOrderDraftStore()
    const [firstProduct, secondProduct] = catalogueProducts

    draft.setItemConfiguration({
      product: firstProduct!,
      productId: firstProduct!.id,
      patch: { presentation: 'print-only', size: 'A4', finish: 'matte' },
    })
    draft.reconcileWithBasket({
      products: [firstProduct!, secondProduct!],
      basketItems: [
        { productId: firstProduct!.id, quantity: 4 },
        { productId: secondProduct!.id, quantity: 1 },
      ],
    })

    expect(draft.configuration.items).toEqual({
      [firstProduct!.id]: { presentation: 'print-only', size: 'A4', finish: 'matte' },
      [secondProduct!.id]: {},
    })
  })

  it('advances only after configuration is valid and can explicitly return to configuration', () => {
    const draft = useOrderDraftStore()
    const product = catalogueProducts[0]!
    const basketItems = [{ productId: product.id, quantity: 1 }]

    expect(
      draft.advanceToCustomerDetails({ products: [product], basketItems }).issues,
    ).toHaveLength(3)
    expect(draft.step).toBe('configuration')

    draft.setItemConfiguration({
      product,
      productId: product.id,
      patch: { presentation: 'print-only', size: 'A4', finish: 'matte' },
    })

    expect(draft.advanceToCustomerDetails({ products: [product], basketItems }).issues).toEqual([])
    expect(draft.step).toBe('customer-details')

    draft.returnToConfiguration()
    expect(draft.step).toBe('configuration')
  })

  it('checkpoints Gift Options and clears the in-memory draft through cancel', () => {
    const draft = useOrderDraftStore()
    const product = catalogueProducts[0]!

    draft.setGiftOptions({ message: 'For Maya', hidePricesOnPackingSlip: true })
    draft.setItemConfiguration({
      product,
      productId: product.id,
      patch: {
        presentation: 'framed',
        size: 'A3',
        finish: 'matte',
        frame: 'black',
        glazing: 'glass',
      },
    })
    draft.checkpointConfiguration({
      products: [product],
      basketItems: [{ productId: product.id, quantity: 1 }],
    })

    expect(draft.configuration.giftOptions).toEqual({
      message: 'For Maya',
      hidePricesOnPackingSlip: true,
    })
    expect(draft.configuration.items[product.id]).toMatchObject({ presentation: 'framed' })

    draft.cancelDraft()
    expect(draft.step).toBe('configuration')
    expect(draft.configuration).toEqual({
      items: {},
      shipping: 'standard',
      giftOptions: { message: '', hidePricesOnPackingSlip: false },
    })
    expect(draft.customerDetails).toEqual({
      fullName: '',
      email: '',
      phone: '',
      addressLine1: '',
      city: '',
      postcode: '',
      termsAccepted: false,
    })
  })

  it('preserves customer details but clears terms when the Basket materially changes', () => {
    const draft = useOrderDraftStore()
    const [firstProduct, secondProduct] = catalogueProducts

    draft.setCustomerDetails({
      fullName: 'Maya Chen',
      email: 'maya@example.com',
      phone: '',
      addressLine1: '1 Market Street',
      city: 'London',
      postcode: 'E1 6AN',
      termsAccepted: true,
    })
    draft.reconcileWithBasket({
      products: [firstProduct!, secondProduct!],
      basketItems: [
        { productId: firstProduct!.id, quantity: 1 },
        { productId: secondProduct!.id, quantity: 1 },
      ],
    })

    expect(draft.customerDetails).toMatchObject({
      fullName: 'Maya Chen',
      email: 'maya@example.com',
      addressLine1: '1 Market Street',
      termsAccepted: false,
    })
  })
})
