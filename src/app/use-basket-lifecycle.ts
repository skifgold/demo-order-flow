import { watch } from 'vue'

import { useBasketStore } from '@/features/basket'
import { useProductsQuery } from '@/features/catalogue'

export function useBasketLifecycle(): void {
  const basket = useBasketStore()
  const { data } = useProductsQuery()

  basket.hydrate()

  watch(
    data,
    (products) => {
      if (products === undefined) {
        return
      }

      basket.reconcile(
        products.map((product) => ({
          id: product.id,
          availableQuantity: product.availableQuantity,
        })),
      )
    },
    { immediate: true },
  )
}
