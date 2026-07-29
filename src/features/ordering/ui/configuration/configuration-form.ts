import { computed, type Ref } from 'vue'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { z } from 'zod'

import type { OrderConfiguration, PrintConfiguration } from '../../domain/order-configuration'
import type { CheckoutItem } from '../checkout/checkout-item'
import { createFormFieldIds } from '../form/use-form-issues'

export function configurationFieldName(productId: string, field: keyof PrintConfiguration): string {
  return `item-${productId}-${field}`
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
  const resolver = computed(() => {
    const schemaShape = Object.fromEntries(
      items.value.flatMap((item) => {
        const itemConfiguration = configuration.value.items[item.product.id] ?? {}
        const fields: [string, z.ZodType<string>][] = [
          [
            configurationFieldName(item.product.id, 'presentation'),
            z.string().min(1, 'Choose a presentation.'),
          ],
          [configurationFieldName(item.product.id, 'size'), z.string().min(1, 'Choose a size.')],
          [
            configurationFieldName(item.product.id, 'finish'),
            z.string().min(1, 'Choose a paper finish.'),
          ],
        ]

        if (itemConfiguration.presentation === 'framed') {
          fields.push(
            [
              configurationFieldName(item.product.id, 'frame'),
              z.string().min(1, 'Choose a frame style.'),
            ],
            [
              configurationFieldName(item.product.id, 'glazing'),
              z.string().min(1, 'Choose a glazing option.'),
            ],
          )
        }

        return fields
      }),
    )

    return zodResolver(z.object(schemaShape))
  })

  const initialValues = computed(() =>
    Object.fromEntries(
      items.value.flatMap((item) => {
        const itemConfiguration = configuration.value.items[item.product.id] ?? {}
        return [
          [
            configurationFieldName(item.product.id, 'presentation'),
            itemConfiguration.presentation ?? '',
          ],
          [configurationFieldName(item.product.id, 'size'), itemConfiguration.size ?? ''],
          [configurationFieldName(item.product.id, 'finish'), itemConfiguration.finish ?? ''],
          [configurationFieldName(item.product.id, 'frame'), itemConfiguration.frame ?? ''],
          [configurationFieldName(item.product.id, 'glazing'), itemConfiguration.glazing ?? ''],
        ]
      }),
    ),
  )

  return { initialValues, resolver }
}
