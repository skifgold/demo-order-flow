import { computed, ref, watch, type ComputedRef } from 'vue'

import type { useBasketStore } from '@/features/basket'
import type { Product } from '@/features/catalogue'

import {
  calculateOrderSummary,
  type ConfigurationIssue,
  type GiftOptions,
  type PrintConfiguration,
  type ShippingMethod,
} from '../domain/order-configuration'
import { useOrderDraftStore } from '../draft/order-draft.store'

export type UpdateConfigurationLine = {
  productId: string
  field: keyof PrintConfiguration
  value: string
}

export function useCheckoutConfiguration({
  basket,
  products,
  draft,
}: {
  basket: ReturnType<typeof useBasketStore>
  products: ComputedRef<readonly Product[]>
  draft: ReturnType<typeof useOrderDraftStore>
}) {
  const summary = computed(() =>
    calculateOrderSummary({
      products: products.value,
      basketLines: basket.lines,
      configuration: draft.configuration,
    }),
  )
  const issues = ref<readonly ConfigurationIssue[]>([])

  function reconcileWithBasket(): void {
    if (products.value.length > 0 && basket.lines.length > 0) {
      draft.reconcileWithBasket({ products: products.value, basketLines: basket.lines })
    }
  }

  watch([products, () => basket.lines], reconcileWithBasket, { immediate: true, deep: true })

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
    checkpointConfiguration()
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
    reconcileWithBasket()
    clearIssues()
  }

  function checkpointConfiguration(): void {
    draft.checkpointConfiguration({ products: products.value, basketLines: basket.lines })
  }

  function continueToCustomerDetails(): void {
    issues.value = draft.advanceToCustomerDetails({
      products: products.value,
      basketLines: basket.lines,
    }).issues
  }

  return {
    continueToCustomerDetails,
    checkpointConfiguration,
    issues,
    reconcileWithBasket,
    removeLine,
    summary,
    updateGiftOptions,
    updateLine,
    updateShipping,
  }
}
