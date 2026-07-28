import { ref } from 'vue'
import { defineStore } from 'pinia'

import type { BasketLine } from '@/features/basket'
import type { Product } from '@/features/catalogue/api/product.contract'

import {
  createEmptyOrderConfiguration,
  normalizePrintConfiguration,
  reconcileOrderConfiguration,
  validateOrderConfiguration,
  type ConfigurationIssue,
  type GiftOptions,
  type OrderConfiguration,
  type PrintConfiguration,
  type ShippingMethod,
} from '../domain/order-configuration'

export type CheckoutStep = 'configuration' | 'customer-details'

function cloneOrderConfiguration(configuration: OrderConfiguration): OrderConfiguration {
  return {
    lines: Object.fromEntries(
      Object.entries(configuration.lines).map(([productId, line]) => [productId, { ...line }]),
    ),
    shipping: configuration.shipping,
    giftOptions: { ...configuration.giftOptions },
  }
}

export const useOrderDraftStore = defineStore('order-draft', () => {
  const step = ref<CheckoutStep>('configuration')
  const configuration = ref<OrderConfiguration>(createEmptyOrderConfiguration())

  function setLineConfiguration({
    product,
    productId,
    patch,
  }: {
    product: Product
    productId: string
    patch: Partial<PrintConfiguration>
  }): void {
    configuration.value.lines[productId] = normalizePrintConfiguration({
      product,
      configuration: { ...configuration.value.lines[productId], ...patch },
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
    basketLines,
  }: {
    products: readonly Product[]
    basketLines: readonly BasketLine[]
  }): void {
    configuration.value = reconcileOrderConfiguration({
      products,
      basketLines,
      configuration: configuration.value,
    })

    if (basketLines.length === 0) {
      cancelDraft()
      return
    }

    step.value = 'configuration'
  }

  function checkpointConfiguration({
    products,
    basketLines,
  }: {
    products: readonly Product[]
    basketLines: readonly BasketLine[]
  }): void {
    configuration.value = reconcileOrderConfiguration({
      products,
      basketLines,
      configuration: configuration.value,
    })
  }

  function advanceToCustomerDetails({
    products,
    basketLines,
  }: {
    products: readonly Product[]
    basketLines: readonly BasketLine[]
  }): { issues: ConfigurationIssue[] } {
    checkpointConfiguration({ products, basketLines })
    const validation = validateOrderConfiguration({
      products,
      basketLines,
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

  function cancelDraft(): void {
    step.value = 'configuration'
    configuration.value = createEmptyOrderConfiguration()
  }

  function completeDraft(): void {
    cancelDraft()
  }

  return {
    step,
    configuration,
    setLineConfiguration,
    setShipping,
    setGiftOptions,
    reconcileWithBasket,
    checkpointConfiguration,
    advanceToCustomerDetails,
    returnToConfiguration,
    cancelDraft,
    completeDraft,
    cloneOrderConfiguration: () => cloneOrderConfiguration(configuration.value),
  }
})
