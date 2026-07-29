import type { BasketLine } from '@/features/basket'
import type { Product } from '@/features/catalogue'

import { isExpressEligible, normalizePrintConfiguration } from './configuration'
import { getCompletePrintConfiguration } from './order-summary'
import type { OrderConfiguration, PrintConfiguration } from './order-configuration.types'

function getProductById(products: readonly Product[], productId: string): Product | undefined {
  return products.find((product) => product.id === productId)
}

export function reconcileOrderConfiguration({
  products,
  basketLines,
  configuration,
}: {
  products: readonly Product[]
  basketLines: readonly BasketLine[]
  configuration: OrderConfiguration
}): OrderConfiguration {
  const lines = Object.fromEntries(
    basketLines.flatMap((basketLine) => {
      const product = getProductById(products, basketLine.productId)

      if (product === undefined) {
        return []
      }

      return [
        [
          basketLine.productId,
          normalizePrintConfiguration({
            product,
            configuration: configuration.lines[basketLine.productId] ?? {},
          }),
        ],
      ]
    }),
  ) as Record<string, PrintConfiguration>

  const completeConfigurations = basketLines
    .map((line) => getProductById(products, line.productId))
    .filter((product): product is Product => product !== undefined)
    .map((product) => getCompletePrintConfiguration(product, lines[product.id]))

  return {
    lines,
    shipping:
      configuration.shipping === 'express' && !isExpressEligible(completeConfigurations)
        ? 'standard'
        : configuration.shipping,
    giftOptions: {
      message: configuration.giftOptions.message.slice(0, 200),
      hidePricesOnPackingSlip: configuration.giftOptions.hidePricesOnPackingSlip,
    },
  }
}
