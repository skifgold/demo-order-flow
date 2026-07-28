import { computed, ref, watch } from 'vue'
import type { Router } from 'vue-router'

import { useBasketStore } from '@/features/basket'
import { useProductsQuery } from '@/features/catalogue'

import {
  calculateOrderSummary,
  type ConfigurationIssue,
  type GiftOptions,
  type PrintConfiguration,
  type ShippingMethod,
} from '../domain/order-configuration'
import { useOrderDraftStore } from '../draft/order-draft.store'
import type { ConfiguredBasketLine } from '../ui/configuration/configuration-form'

export type UpdateConfigurationLine = {
  productId: string
  field: keyof PrintConfiguration
  value: string
}

export function useCheckoutConfiguration(router: Router) {
  const basket = useBasketStore()
  const draft = useOrderDraftStore()
  const { data: productData, isError, isPending, refetch } = useProductsQuery()
  const products = computed(() => productData.value ?? [])
  const lines = computed<readonly ConfiguredBasketLine[]>(() =>
    basket.lines.flatMap((basketLine) => {
      const product = products.value.find((candidate) => candidate.id === basketLine.productId)
      return product === undefined ? [] : [{ product, quantity: basketLine.quantity }]
    }),
  )
  const summary = computed(() =>
    calculateOrderSummary({
      products: products.value,
      basketLines: basket.lines,
      configuration: draft.configuration,
    }),
  )
  const issues = ref<readonly ConfigurationIssue[]>([])

  watch(
    [products, () => basket.lines],
    ([currentProducts, currentBasketLines]) => {
      if (currentProducts.length > 0 && currentBasketLines.length > 0) {
        draft.reconcileWithBasket({ products: currentProducts, basketLines: currentBasketLines })
      }
    },
    { immediate: true, deep: true },
  )

  function clearIssues(): void {
    issues.value = []
  }

  function updateLine({ productId, field, value }: UpdateConfigurationLine): void {
    const product = products.value.find((candidate) => candidate.id === productId)

    if (product === undefined) {
      return
    }

    draft.setLineConfiguration({
      product,
      productId,
      patch: { [field]: value } as Partial<PrintConfiguration>,
    })
    draft.checkpointConfiguration({ products: products.value, basketLines: basket.lines })
    clearIssues()
  }

  function updateShipping(shipping: ShippingMethod): void {
    draft.setShipping(shipping)
    clearIssues()
  }

  function updateGiftOptions(giftOptions: GiftOptions): void {
    draft.setGiftOptions(giftOptions)
    clearIssues()
  }

  function continueToCustomerDetails(): void {
    issues.value = draft.advanceToCustomerDetails({
      products: products.value,
      basketLines: basket.lines,
    }).issues
  }

  function reviewBasket(): void {
    draft.checkpointConfiguration({ products: products.value, basketLines: basket.lines })
    void router.push({ name: 'catalogue' })
  }

  function browseArtworks(): void {
    void router.push({ name: 'catalogue' })
  }

  return {
    basket,
    browseArtworks,
    continueToCustomerDetails,
    draft,
    isError,
    isPending,
    issues,
    lines,
    refetch,
    reviewBasket,
    summary,
    updateGiftOptions,
    updateLine,
    updateShipping,
  }
}
