import { computed } from 'vue'

import { useBasketStore } from '@/features/basket'
import { useProductsQuery } from '@/features/catalogue'

import type { CheckoutItem } from '../ui/checkout/checkout-item'

export function useCheckoutBasket() {
  const basket = useBasketStore()
  const { data: productData, isError, isPending, refetch } = useProductsQuery()
  const products = computed(() => productData.value ?? [])

  const items = computed<readonly CheckoutItem[]>(() =>
    basket.items.flatMap((basketItem) => {
      const product = products.value.find((candidate) => candidate.id === basketItem.productId)
      return product === undefined ? [] : [{ product, quantity: basketItem.quantity }]
    }),
  )

  return { basket, products, items, isError, isPending, refetch }
}
