import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { z } from 'zod'

export type BasketItem = {
  productId: string
  quantity: number
}

export type BasketProductAvailability = {
  id: string
  availableQuantity: number
}

export type SetBasketQuantityInput = {
  productId: string
  quantity: number
  availableQuantity: number
}

const BASKET_STORAGE_KEY = 'demo-order-flow:basket'
const BASKET_STORAGE_VERSION = 2

function hasUniqueProductIds(items: readonly BasketItem[]): boolean {
  return new Set(items.map((item) => item.productId)).size === items.length
}

const BasketItemsSchema = z.array(
  z.object({
    productId: z.string().min(1),
    quantity: z.number().int().positive(),
  }),
)

const PersistedBasketSchema = z
  .object({
    version: z.literal(BASKET_STORAGE_VERSION),
    items: BasketItemsSchema,
  })
  .strict()
  .refine((basket) => hasUniqueProductIds(basket.items), {
    message: 'A basket cannot contain duplicate product items.',
  })

function getStorage(): Storage | undefined {
  if (typeof window === 'undefined') {
    return undefined
  }

  return window.localStorage
}

export const useBasketStore = defineStore('basket', () => {
  const items = ref<BasketItem[]>([])
  const hasDiscardedPersistedBasket = ref(false)
  const hasHydrated = ref(false)

  const itemCount = computed(() => items.value.reduce((total, item) => total + item.quantity, 0))
  const isEmpty = computed(() => items.value.length === 0)

  function persist(): void {
    const storage = getStorage()

    if (storage === undefined) {
      return
    }

    try {
      if (items.value.length === 0) {
        storage.removeItem(BASKET_STORAGE_KEY)
        return
      }

      storage.setItem(
        BASKET_STORAGE_KEY,
        JSON.stringify({ version: BASKET_STORAGE_VERSION, items: items.value }),
      )
    } catch {
      // A private browsing or quota failure must not prevent selecting Artworks.
    }
  }

  function hydrate(): void {
    if (hasHydrated.value) {
      return
    }

    hasHydrated.value = true
    const storage = getStorage()

    if (storage === undefined) {
      return
    }

    try {
      const serializedBasket = storage.getItem(BASKET_STORAGE_KEY)

      if (serializedBasket === null) {
        return
      }

      const persistedState = JSON.parse(serializedBasket)
      const persistedBasket = PersistedBasketSchema.safeParse(persistedState)

      if (persistedBasket.success) {
        items.value = persistedBasket.data.items
        return
      }
    } catch {
      // Invalid persisted state is handled below.
    }

    items.value = []
    hasDiscardedPersistedBasket.value = true

    try {
      storage.removeItem(BASKET_STORAGE_KEY)
    } catch {
      // The storage entry may be inaccessible; the in-memory basket remains safe.
    }
  }

  function quantityFor(productId: string): number {
    return items.value.find((item) => item.productId === productId)?.quantity ?? 0
  }

  function add(productId: string, availableQuantity: number): void {
    setQuantity({ productId, quantity: quantityFor(productId) + 1, availableQuantity })
  }

  function setQuantity({ productId, quantity, availableQuantity }: SetBasketQuantityInput): void {
    const itemIndex = items.value.findIndex((item) => item.productId === productId)

    if (
      !Number.isInteger(quantity) ||
      !Number.isInteger(availableQuantity) ||
      availableQuantity < 0
    ) {
      return
    }

    if (quantity <= 0) {
      if (itemIndex !== -1) {
        items.value.splice(itemIndex, 1)
        persist()
      }
      return
    }

    const permittedQuantity = Math.min(quantity, availableQuantity)

    if (permittedQuantity === 0) {
      if (itemIndex !== -1) {
        items.value.splice(itemIndex, 1)
        persist()
      }
      return
    }

    if (itemIndex === -1) {
      items.value.push({ productId, quantity: permittedQuantity })
    } else {
      items.value[itemIndex]!.quantity = permittedQuantity
    }

    persist()
  }

  function remove(productId: string): void {
    const itemIndex = items.value.findIndex((item) => item.productId === productId)

    if (itemIndex === -1) {
      return
    }

    items.value.splice(itemIndex, 1)
    persist()
  }

  function clear(): void {
    if (items.value.length === 0) {
      return
    }

    items.value = []
    persist()
  }

  function reconcile(products: readonly BasketProductAvailability[]): void {
    const availableQuantityByProductId = new Map(
      products.map((product) => [product.id, product.availableQuantity]),
    )
    const reconciledItems = items.value.flatMap((item) => {
      const availableQuantity = availableQuantityByProductId.get(item.productId)

      if (availableQuantity === undefined || availableQuantity <= 0) {
        return []
      }

      return [{ productId: item.productId, quantity: Math.min(item.quantity, availableQuantity) }]
    })

    if (JSON.stringify(items.value) === JSON.stringify(reconciledItems)) {
      return
    }

    items.value = reconciledItems
    persist()
  }

  return {
    items,
    hasDiscardedPersistedBasket,
    itemCount,
    isEmpty,
    hydrate,
    quantityFor,
    add,
    setQuantity,
    remove,
    clear,
    reconcile,
  }
})

export const basketStorageKey = BASKET_STORAGE_KEY
