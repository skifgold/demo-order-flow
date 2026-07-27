import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { basketStorageKey, useBasketStore } from './basket.store'

describe('Basket store', () => {
  beforeEach(() => {
    window.localStorage.clear()
    setActivePinia(createPinia())
  })

  afterEach(() => {
    window.localStorage.clear()
  })

  it('adds, updates, removes, and clears Basket Lines without persisting Product metadata', () => {
    const basket = useBasketStore()

    basket.add('modern-geometry-07', 8)
    basket.setQuantity({ productId: 'modern-geometry-07', quantity: 3, availableQuantity: 8 })

    expect(basket.lines).toEqual([{ productId: 'modern-geometry-07', quantity: 3 }])
    expect(basket.itemCount).toBe(3)
    expect(JSON.parse(window.localStorage.getItem(basketStorageKey) ?? '{}')).toEqual({
      version: 1,
      lines: [{ productId: 'modern-geometry-07', quantity: 3 }],
    })

    basket.remove('modern-geometry-07')
    expect(basket.isEmpty).toBe(true)

    basket.add('coastal-light', 4)
    basket.clear()

    expect(basket.lines).toEqual([])
    expect(window.localStorage.getItem(basketStorageKey)).toBeNull()
  })

  it('hydrates a supported version of persisted Basket Lines once', () => {
    window.localStorage.setItem(
      basketStorageKey,
      JSON.stringify({
        version: 1,
        lines: [{ productId: 'coastal-light', quantity: 2 }],
      }),
    )
    const basket = useBasketStore()

    basket.hydrate()
    basket.hydrate()

    expect(basket.lines).toEqual([{ productId: 'coastal-light', quantity: 2 }])
    expect(basket.hasDiscardedPersistedBasket).toBe(false)
  })

  it('discards malformed or unsupported persisted state safely', () => {
    window.localStorage.setItem(basketStorageKey, '{not valid JSON')
    const malformedBasket = useBasketStore()

    malformedBasket.hydrate()

    expect(malformedBasket.lines).toEqual([])
    expect(malformedBasket.hasDiscardedPersistedBasket).toBe(true)
    expect(window.localStorage.getItem(basketStorageKey)).toBeNull()

    setActivePinia(createPinia())
    window.localStorage.setItem(basketStorageKey, JSON.stringify({ version: 2, lines: [] }))
    const unsupportedBasket = useBasketStore()

    unsupportedBasket.hydrate()

    expect(unsupportedBasket.lines).toEqual([])
    expect(unsupportedBasket.hasDiscardedPersistedBasket).toBe(true)
  })

  it('reconciles restored lines against current Products and their availability', () => {
    const basket = useBasketStore()
    basket.add('modern-geometry-07', 8)
    basket.setQuantity({ productId: 'modern-geometry-07', quantity: 7, availableQuantity: 8 })
    basket.add('coastal-light', 4)

    basket.reconcile([
      { id: 'modern-geometry-07', availableQuantity: 2 },
      { id: 'night-reflections', availableQuantity: 3 },
    ])

    expect(basket.lines).toEqual([{ productId: 'modern-geometry-07', quantity: 2 }])
    expect(JSON.parse(window.localStorage.getItem(basketStorageKey) ?? '{}')).toEqual({
      version: 1,
      lines: [{ productId: 'modern-geometry-07', quantity: 2 }],
    })
  })

  it('never allows a quantity above current availability', () => {
    const basket = useBasketStore()

    basket.setQuantity({ productId: 'night-reflections', quantity: 9, availableQuantity: 3 })
    basket.add('night-reflections', 3)

    expect(basket.lines).toEqual([{ productId: 'night-reflections', quantity: 3 }])

    basket.setQuantity({ productId: 'night-reflections', quantity: 1, availableQuantity: 0 })

    expect(basket.lines).toEqual([])
  })
})
