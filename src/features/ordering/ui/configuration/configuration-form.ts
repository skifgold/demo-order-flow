import { computed, ref, watch, type Ref } from 'vue'
import { zodResolver } from '@primevue/forms/resolvers/zod'

import {
  createOrderConfigurationSchema,
  type ConfigurationIssue,
  type OrderConfiguration,
  type PrintConfiguration,
} from '../../domain/order-configuration'
import type { CheckoutItem } from '../checkout/checkout-item'
import { createFormFieldIds } from '../form/use-form-issues'

type ResolverIssue = {
  message: string
}

export function configurationFieldName(productId: string, field: keyof PrintConfiguration): string {
  return configurationItemField(productId, field)
}

const configurationFieldIds = createFormFieldIds('configuration')

export const configurationFieldId = configurationFieldIds.fieldId
export const configurationFieldErrorId = configurationFieldIds.errorId

export function configurationItemField(productId: string, field: keyof PrintConfiguration): string {
  return `items.${productId}.${field}`
}

export function configurationItemFieldId(
  productId: string,
  field: keyof PrintConfiguration,
): string {
  return configurationFieldId(configurationItemField(productId, field))
}

export function useConfigurationForm(
  items: Ref<readonly CheckoutItem[]>,
  configuration: Ref<OrderConfiguration>,
) {
  const issues = ref<readonly ConfigurationIssue[]>([])

  const resolver = computed(() => {
    const schema = createOrderConfigurationSchema({
      products: items.value.map((item) => item.product),
      basketItems: items.value.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
    })
    const resolve = zodResolver(schema)

    return async (options: Parameters<typeof resolve>[0]) => {
      const result = await resolve({ ...options, values: configuration.value })
      const errors = result.errors as Record<string, ResolverIssue[]>
      issues.value = Object.entries(errors).flatMap(([field, errors]) =>
        errors.map((error) => ({ field, message: error.message })),
      )

      return result
    }
  })

  const initialValues = computed(() => configuration.value)

  watch(
    configuration,
    () => {
      issues.value = []
    },
    { deep: true },
  )

  return { initialValues, issues, resolver }
}
