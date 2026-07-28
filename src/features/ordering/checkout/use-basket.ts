import { computed } from 'vue'

import { useBasketStore } from '@/features/basket'
import { useProductsQuery } from '@/features/catalogue'

import type { CheckoutLine } from '../ui/checkout/checkout-line'

export function useCheckoutBasket() {
  const basket = useBasketStore()
  const { data: productData, isError, isPending, refetch } = useProductsQuery()
  const products = computed(() => productData.value ?? [])
  const lines = computed<readonly CheckoutLine[]>(() =>
    basket.lines.flatMap((basketLine) => {
      const product = products.value.find((candidate) => candidate.id === basketLine.productId)
      return product === undefined ? [] : [{ product, quantity: basketLine.quantity }]
    }),
  )

  return { basket, products, lines, isError, isPending, refetch }
}
