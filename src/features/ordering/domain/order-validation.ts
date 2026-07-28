import type { BasketLine } from '@/features/basket'
import type { Product } from '@/features/catalogue/api/product.contract'

import { isExpressEligible, normalizePrintConfiguration } from './configuration'
import { getCompletePrintConfiguration } from './order-summary'
import type {
  CompletePrintConfiguration,
  ConfigurationIssue,
  OrderConfiguration,
} from './order-configuration.types'

function getProductById(products: readonly Product[], productId: string): Product | undefined {
  return products.find((product) => product.id === productId)
}

export function validateOrderConfiguration({
  products,
  basketLines,
  configuration,
}: {
  products: readonly Product[]
  basketLines: readonly BasketLine[]
  configuration: OrderConfiguration
}): { issues: ConfigurationIssue[] } {
  const issues: ConfigurationIssue[] = []
  const completeConfigurations: (CompletePrintConfiguration | undefined)[] = []

  for (const basketLine of basketLines) {
    const product = getProductById(products, basketLine.productId)
    const fieldPrefix = `lines.${basketLine.productId}`

    if (product === undefined) {
      issues.push({ field: fieldPrefix, message: 'This Artwork is no longer available.' })
      continue
    }

    const normalized = normalizePrintConfiguration({
      product,
      configuration: configuration.lines[basketLine.productId] ?? {},
    })

    if (normalized.presentation === undefined) {
      issues.push({ field: `${fieldPrefix}.presentation`, message: 'Choose a presentation.' })
    }
    if (normalized.size === undefined) {
      issues.push({ field: `${fieldPrefix}.size`, message: 'Choose a size.' })
    }
    if (normalized.finish === undefined) {
      issues.push({ field: `${fieldPrefix}.finish`, message: 'Choose a paper finish.' })
    }
    if (normalized.presentation === 'framed' && normalized.frame === undefined) {
      issues.push({ field: `${fieldPrefix}.frame`, message: 'Choose a frame style.' })
    }
    if (normalized.presentation === 'framed' && normalized.glazing === undefined) {
      issues.push({ field: `${fieldPrefix}.glazing`, message: 'Choose a glazing option.' })
    }

    completeConfigurations.push(getCompletePrintConfiguration(product, normalized))
  }

  if (configuration.shipping === 'express' && !isExpressEligible(completeConfigurations)) {
    issues.push({ field: 'shipping', message: 'Express shipping is not available for this order.' })
  }
  if (configuration.giftOptions.message.length > 200) {
    issues.push({
      field: 'giftOptions.message',
      message: 'Gift message must be 200 characters or fewer.',
    })
  }

  return { issues }
}
