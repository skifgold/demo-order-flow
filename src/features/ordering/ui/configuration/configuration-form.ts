import { computed, type Ref } from 'vue'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { z } from 'zod'

import type { Product } from '@/features/catalogue/api/product.contract'

import type { OrderConfiguration, PrintConfiguration } from '../../domain/order-configuration'
import { createFormFieldIds } from '../form/use-form-issues'

export type ConfiguredBasketLine = {
  product: Product
  quantity: number
}

export function configurationFieldName(productId: string, field: keyof PrintConfiguration): string {
  return `line-${productId}-${field}`
}

const configurationFieldIds = createFormFieldIds('configuration')

export const configurationFieldId = configurationFieldIds.fieldId
export const configurationFieldErrorId = configurationFieldIds.errorId

export function configurationLineField(productId: string, field: keyof PrintConfiguration): string {
  return `lines.${productId}.${field}`
}

export function configurationLineFieldId(
  productId: string,
  field: keyof PrintConfiguration,
): string {
  return configurationFieldId(configurationLineField(productId, field))
}

export function useConfigurationForm(
  lines: Ref<readonly ConfiguredBasketLine[]>,
  configuration: Ref<OrderConfiguration>,
) {
  const resolver = computed(() => {
    const schemaShape = Object.fromEntries(
      lines.value.flatMap((line) => {
        const lineConfiguration = configuration.value.lines[line.product.id] ?? {}
        const fields: [string, z.ZodType<string>][] = [
          [
            configurationFieldName(line.product.id, 'presentation'),
            z.string().min(1, 'Choose a presentation.'),
          ],
          [configurationFieldName(line.product.id, 'size'), z.string().min(1, 'Choose a size.')],
          [
            configurationFieldName(line.product.id, 'finish'),
            z.string().min(1, 'Choose a paper finish.'),
          ],
        ]

        if (lineConfiguration.presentation === 'framed') {
          fields.push(
            [
              configurationFieldName(line.product.id, 'frame'),
              z.string().min(1, 'Choose a frame style.'),
            ],
            [
              configurationFieldName(line.product.id, 'glazing'),
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
      lines.value.flatMap((line) => {
        const lineConfiguration = configuration.value.lines[line.product.id] ?? {}
        return [
          [
            configurationFieldName(line.product.id, 'presentation'),
            lineConfiguration.presentation ?? '',
          ],
          [configurationFieldName(line.product.id, 'size'), lineConfiguration.size ?? ''],
          [configurationFieldName(line.product.id, 'finish'), lineConfiguration.finish ?? ''],
          [configurationFieldName(line.product.id, 'frame'), lineConfiguration.frame ?? ''],
          [configurationFieldName(line.product.id, 'glazing'), lineConfiguration.glazing ?? ''],
        ]
      }),
    ),
  )

  return { initialValues, resolver }
}
