import { computed, ref, watch } from 'vue'
import type { Router } from 'vue-router'

import {
  calculateOrderSummary,
  type ConfigurationIssue,
  type GiftOptions,
  type PrintConfiguration,
  type ShippingMethod,
} from '../domain/order-configuration'
import { useOrderDraftStore } from '../draft/order-draft.store'

import { useCheckoutBasket } from './use-basket'

export type UpdateConfigurationLine = {
  productId: string
  field: keyof PrintConfiguration
  value: string
}

export function useCheckoutConfiguration(router: Router) {
  const { basket, products, lines, isError, isPending, refetch } = useCheckoutBasket()
  const draft = useOrderDraftStore()
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

  function removeLine(productId: string): void {
    basket.remove(productId)
    draft.reconcileWithBasket({ products: products.value, basketLines: basket.lines })
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

  async function recoverOrderConflict(affectedProductIds: readonly string[]): Promise<void> {
    draft.recordOrderConflict({
      affectedProductIds:
        affectedProductIds.length > 0
          ? affectedProductIds
          : basket.lines.map((line) => line.productId),
    })
    await refetch()
    basket.reconcile(products.value)
    draft.reconcileWithBasket({ products: products.value, basketLines: basket.lines })
  }

  function reviewBasketAfterConflict(): void {
    draft.resolveOrderConflict()
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
    products,
    refetch,
    removeLine,
    recoverOrderConflict,
    reviewBasket,
    reviewBasketAfterConflict,
    summary,
    updateGiftOptions,
    updateLine,
    updateShipping,
  }
}
