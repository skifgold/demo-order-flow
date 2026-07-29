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

export type UpdateConfigurationItem = {
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
      basketItems: basket.items,
      configuration: draft.configuration,
    }),
  )
  const issues = ref<readonly ConfigurationIssue[]>([])

  function reconcileWithBasket(): void {
    if (products.value.length > 0 && basket.items.length > 0) {
      draft.reconcileWithBasket({ products: products.value, basketItems: basket.items })
    }
  }

  watch([products, () => basket.items], reconcileWithBasket, { immediate: true, deep: true })

  function clearIssues(): void {
    issues.value = []
  }

  function updateItem({ productId, field, value }: UpdateConfigurationItem): void {
    const product = products.value.find((candidate) => candidate.id === productId)

    if (product === undefined) {
      return
    }

    draft.setItemConfiguration({
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

  function removeItem(productId: string): void {
    basket.remove(productId)
    reconcileWithBasket()
    clearIssues()
  }

  function checkpointConfiguration(): void {
    draft.checkpointConfiguration({ products: products.value, basketItems: basket.items })
  }

  function continueToCustomerDetails(): void {
    issues.value = draft.advanceToCustomerDetails({
      products: products.value,
      basketItems: basket.items,
    }).issues
  }

  return {
    continueToCustomerDetails,
    checkpointConfiguration,
    issues,
    reconcileWithBasket,
    removeItem,
    summary,
    updateGiftOptions,
    updateItem,
    updateShipping,
  }
}
