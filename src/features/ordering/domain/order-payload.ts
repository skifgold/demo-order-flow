import type { BasketLine } from '@/features/basket'
import type { Product } from '@/features/catalogue/api/product.contract'

import { getCompletePrintConfiguration, calculateOrderSummary } from './order-summary'
import { validateOrderConfiguration } from './order-validation'
import type { OrderConfiguration, OrderPayload } from './order-configuration.types'

export function createOrderPayload({
  products,
  basketLines,
  configuration,
}: {
  products: readonly Product[]
  basketLines: readonly BasketLine[]
  configuration: OrderConfiguration
}): OrderPayload {
  const validation = validateOrderConfiguration({ products, basketLines, configuration })

  if (validation.issues.length > 0) {
    throw new Error('Cannot create an order payload from an invalid configuration.')
  }

  const summary = calculateOrderSummary({ products, basketLines, configuration })
  const lines = basketLines.map((basketLine) => {
    const product = products.find((candidate) => candidate.id === basketLine.productId)!
    const completeConfiguration = getCompletePrintConfiguration(
      product,
      configuration.lines[product.id],
    )!
    const summaryLine = summary.lines.find((line) => line.productId === product.id)!

    return {
      productId: product.id,
      quantity: basketLine.quantity,
      configuration: { ...completeConfiguration },
      unitPrice: summaryLine.unitPrice!,
      lineTotal: summaryLine.lineTotal!,
    }
  })

  return {
    lines,
    shipping: configuration.shipping,
    giftOptions: { ...configuration.giftOptions },
    totals: {
      subtotal: summary.subtotal,
      shippingCost: summary.shippingCost,
      total: summary.total,
    },
  }
}
