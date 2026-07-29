import type { BasketItem } from '@/features/basket'
import type { Product } from '@/features/catalogue'

import { createOrderConfigurationSchema } from './order-configuration-schema'
import type { ConfigurationIssue, OrderConfiguration } from './order-configuration.types'

export function validateOrderConfiguration({
  products,
  basketItems,
  configuration,
}: {
  products: readonly Product[]
  basketItems: readonly BasketItem[]
  configuration: OrderConfiguration
}): { issues: ConfigurationIssue[] } {
  const result = createOrderConfigurationSchema({ products, basketItems }).safeParse(configuration)

  if (result.success) {
    return { issues: [] }
  }

  return {
    issues: result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    })),
  }
}
