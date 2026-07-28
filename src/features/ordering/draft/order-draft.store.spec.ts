import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { catalogueProducts } from '@/mocks/catalogue.data'

import { useOrderDraftStore } from './order-draft.store'

describe('Order Draft store', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('keeps valid configurations when a Basket quantity changes and adds empty new lines', () => {
    const draft = useOrderDraftStore()
    const [firstProduct, secondProduct] = catalogueProducts

    draft.setLineConfiguration({
      product: firstProduct!,
      productId: firstProduct!.id,
      patch: { presentation: 'print-only', size: 'A4', finish: 'matte' },
    })
    draft.reconcileWithBasket({
      products: [firstProduct!, secondProduct!],
      basketLines: [
        { productId: firstProduct!.id, quantity: 4 },
        { productId: secondProduct!.id, quantity: 1 },
      ],
    })

    expect(draft.configuration.lines).toEqual({
      [firstProduct!.id]: { presentation: 'print-only', size: 'A4', finish: 'matte' },
      [secondProduct!.id]: {},
    })
  })

  it('advances only after configuration is valid and can explicitly return to configuration', () => {
    const draft = useOrderDraftStore()
    const product = catalogueProducts[0]!
    const basketLines = [{ productId: product.id, quantity: 1 }]

    expect(
      draft.advanceToCustomerDetails({ products: [product], basketLines }).issues,
    ).toHaveLength(3)
    expect(draft.step).toBe('configuration')

    draft.setLineConfiguration({
      product,
      productId: product.id,
      patch: { presentation: 'print-only', size: 'A4', finish: 'matte' },
    })

    expect(draft.advanceToCustomerDetails({ products: [product], basketLines }).issues).toEqual([])
    expect(draft.step).toBe('customer-details')

    draft.returnToConfiguration()
    expect(draft.step).toBe('configuration')
  })

  it('checkpoints Gift Options and clears the in-memory draft through cancel', () => {
    const draft = useOrderDraftStore()
    const product = catalogueProducts[0]!

    draft.setGiftOptions({ message: 'For Maya', hidePricesOnPackingSlip: true })
    draft.setLineConfiguration({
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
      basketLines: [{ productId: product.id, quantity: 1 }],
    })

    expect(draft.configuration.giftOptions).toEqual({
      message: 'For Maya',
      hidePricesOnPackingSlip: true,
    })
    expect(draft.configuration.lines[product.id]).toMatchObject({ presentation: 'framed' })

    draft.cancelDraft()
    expect(draft.step).toBe('configuration')
    expect(draft.configuration).toEqual({
      lines: {},
      shipping: 'standard',
      giftOptions: { message: '', hidePricesOnPackingSlip: false },
    })
  })
})
