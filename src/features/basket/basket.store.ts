import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { z } from 'zod'

export type BasketLine = {
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
const BASKET_STORAGE_VERSION = 1

function hasUniqueProductIds(lines: readonly BasketLine[]): boolean {
  return new Set(lines.map((line) => line.productId)).size === lines.length
}

const PersistedBasketSchema = z
  .object({
    version: z.literal(BASKET_STORAGE_VERSION),
    lines: z.array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
      }),
    ),
  })
  .strict()
  .refine((basket) => hasUniqueProductIds(basket.lines), {
    message: 'A basket cannot contain duplicate product lines.',
  })

function getStorage(): Storage | undefined {
  if (typeof window === 'undefined') {
    return undefined
  }

  return window.localStorage
}

export const useBasketStore = defineStore('basket', () => {
  const lines = ref<BasketLine[]>([])
  const hasDiscardedPersistedBasket = ref(false)
  const hasHydrated = ref(false)

  const itemCount = computed(() => lines.value.reduce((total, line) => total + line.quantity, 0))
  const isEmpty = computed(() => lines.value.length === 0)

  function persist(): void {
    const storage = getStorage()

    if (storage === undefined) {
      return
    }

    try {
      if (lines.value.length === 0) {
        storage.removeItem(BASKET_STORAGE_KEY)
        return
      }

      storage.setItem(
        BASKET_STORAGE_KEY,
        JSON.stringify({ version: BASKET_STORAGE_VERSION, lines: lines.value }),
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

      const persistedBasket = PersistedBasketSchema.safeParse(JSON.parse(serializedBasket))

      if (persistedBasket.success) {
        lines.value = persistedBasket.data.lines
        return
      }
    } catch {
      // Invalid persisted state is handled below.
    }

    lines.value = []
    hasDiscardedPersistedBasket.value = true

    try {
      storage.removeItem(BASKET_STORAGE_KEY)
    } catch {
      // The storage entry may be inaccessible; the in-memory basket remains safe.
    }
  }

  function quantityFor(productId: string): number {
    return lines.value.find((line) => line.productId === productId)?.quantity ?? 0
  }

  function add(productId: string, availableQuantity: number): void {
    setQuantity({ productId, quantity: quantityFor(productId) + 1, availableQuantity })
  }

  function setQuantity({ productId, quantity, availableQuantity }: SetBasketQuantityInput): void {
    const lineIndex = lines.value.findIndex((line) => line.productId === productId)

    if (
      !Number.isInteger(quantity) ||
      !Number.isInteger(availableQuantity) ||
      availableQuantity < 0
    ) {
      return
    }

    if (quantity <= 0) {
      if (lineIndex !== -1) {
        lines.value.splice(lineIndex, 1)
        persist()
      }
      return
    }

    const permittedQuantity = Math.min(quantity, availableQuantity)

    if (permittedQuantity === 0) {
      if (lineIndex !== -1) {
        lines.value.splice(lineIndex, 1)
        persist()
      }
      return
    }

    if (lineIndex === -1) {
      lines.value.push({ productId, quantity: permittedQuantity })
    } else {
      lines.value[lineIndex]!.quantity = permittedQuantity
    }

    persist()
  }

  function remove(productId: string): void {
    const lineIndex = lines.value.findIndex((line) => line.productId === productId)

    if (lineIndex === -1) {
      return
    }

    lines.value.splice(lineIndex, 1)
    persist()
  }

  function clear(): void {
    if (lines.value.length === 0) {
      return
    }

    lines.value = []
    persist()
  }

  function reconcile(products: readonly BasketProductAvailability[]): void {
    const availableQuantityByProductId = new Map(
      products.map((product) => [product.id, product.availableQuantity]),
    )
    const reconciledLines = lines.value.flatMap((line) => {
      const availableQuantity = availableQuantityByProductId.get(line.productId)

      if (availableQuantity === undefined || availableQuantity <= 0) {
        return []
      }

      return [{ productId: line.productId, quantity: Math.min(line.quantity, availableQuantity) }]
    })

    if (JSON.stringify(lines.value) === JSON.stringify(reconciledLines)) {
      return
    }

    lines.value = reconciledLines
    persist()
  }

  return {
    lines,
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
