import type { BasketItem } from '@/features/basket'
import type { Product } from '@/features/catalogue'

import { isExpressEligible, normalizePrintConfiguration } from './configuration'
import { getCompletePrintConfiguration } from './order-summary'
import type { OrderConfiguration, PrintConfiguration } from './order-configuration.types'

function getProductById(products: readonly Product[], productId: string): Product | undefined {
  return products.find((product) => product.id === productId)
}

export function reconcileOrderConfiguration({
  products,
  basketItems,
  configuration,
}: {
  products: readonly Product[]
  basketItems: readonly BasketItem[]
  configuration: OrderConfiguration
}): OrderConfiguration {
  const items = Object.fromEntries(
    basketItems.flatMap((basketItem) => {
      const product = getProductById(products, basketItem.productId)

      if (product === undefined) {
        return []
      }

      return [
        [
          basketItem.productId,
          normalizePrintConfiguration({
            product,
            configuration: configuration.items[basketItem.productId] ?? {},
          }),
        ],
      ]
    }),
  ) as Record<string, PrintConfiguration>

  const completeConfigurations = basketItems
    .map((item) => getProductById(products, item.productId))
    .filter((product): product is Product => product !== undefined)
    .map((product) => getCompletePrintConfiguration(product, items[product.id]))

  return {
    items,
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
