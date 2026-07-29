import { ref } from 'vue'
import { defineStore } from 'pinia'

import type { BasketItem } from '@/features/basket'
import type { Product } from '@/features/catalogue'

import {
  createEmptyCustomerDetails,
  createEmptyOrderConfiguration,
  normalizePrintConfiguration,
  reconcileOrderConfiguration,
  validateOrderConfiguration,
  type ConfigurationIssue,
  type CustomerDetails,
  type GiftOptions,
  type OrderConfiguration,
  type PrintConfiguration,
  type ShippingMethod,
} from '../domain/order-configuration'

export type CheckoutStep = 'configuration' | 'customer-details'

export type OrderConflict = {
  affectedProductIds: readonly string[]
}

function cloneOrderConfiguration(configuration: OrderConfiguration): OrderConfiguration {
  return {
    items: Object.fromEntries(
      Object.entries(configuration.items).map(([productId, item]) => [productId, { ...item }]),
    ),
    shipping: configuration.shipping,
    giftOptions: { ...configuration.giftOptions },
  }
}

export const useOrderDraftStore = defineStore('order-draft', () => {
  const step = ref<CheckoutStep>('configuration')
  const configuration = ref<OrderConfiguration>(createEmptyOrderConfiguration())
  const customerDetails = ref<CustomerDetails>(createEmptyCustomerDetails())
  const orderConflict = ref<OrderConflict>()

  function setItemConfiguration({
    product,
    productId,
    patch,
  }: {
    product: Product
    productId: string
    patch: Partial<PrintConfiguration>
  }): void {
    configuration.value.items[productId] = normalizePrintConfiguration({
      product,
      configuration: { ...configuration.value.items[productId], ...patch },
    })
  }

  function setShipping(shipping: ShippingMethod): void {
    configuration.value.shipping = shipping
  }

  function setGiftOptions(giftOptions: GiftOptions): void {
    configuration.value.giftOptions = { ...giftOptions, message: giftOptions.message.slice(0, 200) }
  }

  function reconcileWithBasket({
    products,
    basketItems,
  }: {
    products: readonly Product[]
    basketItems: readonly BasketItem[]
  }): void {
    const reconciledConfiguration = reconcileOrderConfiguration({
      products,
      basketItems,
      configuration: configuration.value,
    })
    const hasMaterialConfigurationChange =
      JSON.stringify(configuration.value) !== JSON.stringify(reconciledConfiguration)

    configuration.value = reconciledConfiguration

    if (hasMaterialConfigurationChange) {
      customerDetails.value.termsAccepted = false
      step.value = 'configuration'
    }

    if (basketItems.length === 0) {
      cancelDraft()
      return
    }
  }

  function checkpointConfiguration({
    products,
    basketItems,
  }: {
    products: readonly Product[]
    basketItems: readonly BasketItem[]
  }): void {
    configuration.value = reconcileOrderConfiguration({
      products,
      basketItems,
      configuration: configuration.value,
    })
  }

  function advanceToCustomerDetails({
    products,
    basketItems,
  }: {
    products: readonly Product[]
    basketItems: readonly BasketItem[]
  }): { issues: ConfigurationIssue[] } {
    checkpointConfiguration({ products, basketItems })
    const validation = validateOrderConfiguration({
      products,
      basketItems,
      configuration: configuration.value,
    })

    if (validation.issues.length === 0) {
      step.value = 'customer-details'
    }

    return validation
  }

  function returnToConfiguration(): void {
    step.value = 'configuration'
  }

  function setCustomerDetails(nextCustomerDetails: CustomerDetails): void {
    customerDetails.value = { ...nextCustomerDetails }
  }

  function recordOrderConflict(conflict: OrderConflict): void {
    orderConflict.value = { affectedProductIds: [...conflict.affectedProductIds] }
  }

  function resolveOrderConflict(): void {
    orderConflict.value = undefined
  }

  function cancelDraft(): void {
    step.value = 'configuration'
    configuration.value = createEmptyOrderConfiguration()
    customerDetails.value = createEmptyCustomerDetails()
    resolveOrderConflict()
  }

  function completeDraft(): void {
    cancelDraft()
  }

  return {
    step,
    configuration,
    customerDetails,
    orderConflict,
    setItemConfiguration,
    setShipping,
    setGiftOptions,
    reconcileWithBasket,
    checkpointConfiguration,
    advanceToCustomerDetails,
    returnToConfiguration,
    setCustomerDetails,
    recordOrderConflict,
    resolveOrderConflict,
    cancelDraft,
    completeDraft,
    cloneOrderConfiguration: () => cloneOrderConfiguration(configuration.value),
  }
})
