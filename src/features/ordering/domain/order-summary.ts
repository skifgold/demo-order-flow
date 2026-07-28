import type { BasketLine } from '@/features/basket'
import type { Product } from '@/features/catalogue/api/product.contract'

import { normalizePrintConfiguration } from './configuration'
import type {
  CompletePrintConfiguration,
  OrderConfiguration,
  OrderSummary,
  PrintConfiguration,
  PrintSize,
  ShippingMethod,
} from './order-configuration.types'

const LUSTRE_PRICE = 500
const FRAME_PRICE_BY_SIZE: Record<PrintSize, number> = { A4: 4000, A3: 5500, A2: 8000 }
const NATURAL_OAK_PRICE = 1000
const ACRYLIC_PRICE = 800
const SHIPPING_COST: Record<ShippingMethod, number> = { standard: 695, express: 1295 }

function getProductById(products: readonly Product[], productId: string): Product | undefined {
  return products.find((product) => product.id === productId)
}

export function getCompletePrintConfiguration(
  product: Product,
  configuration: PrintConfiguration | undefined,
): CompletePrintConfiguration | undefined {
  const normalized = normalizePrintConfiguration({ product, configuration: configuration ?? {} })

  if (
    normalized.presentation === undefined ||
    normalized.size === undefined ||
    normalized.finish === undefined
  ) {
    return undefined
  }

  if (
    normalized.presentation === 'framed' &&
    (normalized.frame === undefined || normalized.glazing === undefined)
  ) {
    return undefined
  }

  if (normalized.presentation === 'print-only') {
    return {
      presentation: normalized.presentation,
      size: normalized.size,
      finish: normalized.finish,
    }
  }

  return {
    presentation: normalized.presentation,
    size: normalized.size,
    finish: normalized.finish,
    frame: normalized.frame!,
    glazing: normalized.glazing!,
  }
}

function calculateUnitPrice(product: Product, configuration: CompletePrintConfiguration): number {
  const basePrice = product.pricesBySize[configuration.size]

  if (basePrice === undefined) {
    throw new Error(`Unsupported size ${configuration.size} for ${product.id}.`)
  }

  const finishPrice = configuration.finish === 'lustre' ? LUSTRE_PRICE : 0
  const framingPrice =
    configuration.presentation === 'framed'
      ? FRAME_PRICE_BY_SIZE[configuration.size] +
      (configuration.frame === 'natural-oak' ? NATURAL_OAK_PRICE : 0) +
      (configuration.glazing === 'acrylic' ? ACRYLIC_PRICE : 0)
      : 0

  return basePrice + finishPrice + framingPrice
}

export function calculateOrderSummary({
  products,
  basketLines,
  configuration,
}: {
  products: readonly Product[]
  basketLines: readonly BasketLine[]
  configuration: OrderConfiguration
}): OrderSummary {
  const lines = basketLines.flatMap((basketLine) => {
    const product = getProductById(products, basketLine.productId)

    if (product === undefined) {
      return []
    }

    const completeConfiguration = getCompletePrintConfiguration(
      product,
      configuration.lines[product.id],
    )
    const unitPrice =
      completeConfiguration === undefined
        ? undefined
        : calculateUnitPrice(product, completeConfiguration)

    return [
      {
        productId: product.id,
        quantity: basketLine.quantity,
        unitPrice,
        lineTotal: unitPrice === undefined ? undefined : unitPrice * basketLine.quantity,
      },
    ]
  })
  const subtotal = lines.reduce((total, line) => total + (line.lineTotal ?? 0), 0)
  const shippingCost = SHIPPING_COST[configuration.shipping]

  return {
    lines,
    subtotal,
    shippingCost,
    total: subtotal + shippingCost
  }
}
