import type { BasketLine } from '@/features/basket'
import type { Product } from '@/features/catalogue/api/product.contract'

import { CustomerDetailsSchema } from './customer-details'
import { getCompletePrintConfiguration, calculateOrderSummary } from './order-summary'
import { validateOrderConfiguration } from './order-validation'
import type { CustomerDetails, OrderConfiguration, OrderPayload } from './order-configuration.types'

export function createOrderPayload({
  products,
  basketLines,
  configuration,
  customerDetails,
}: {
  products: readonly Product[]
  basketLines: readonly BasketLine[]
  configuration: OrderConfiguration
  customerDetails: CustomerDetails
}): OrderPayload {
  const validation = validateOrderConfiguration({ products, basketLines, configuration })
  const customerDetailsValidation = CustomerDetailsSchema.safeParse(customerDetails)

  if (validation.issues.length > 0 || !customerDetailsValidation.success) {
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
    customer: {
      fullName: customerDetails.fullName.trim(),
      email: customerDetails.email.trim(),
      ...(customerDetails.phone.trim().length > 0 ? { phone: customerDetails.phone.trim() } : {}),
    },
    deliveryAddress: {
      addressLine1: customerDetails.addressLine1.trim(),
      city: customerDetails.city.trim(),
      postcode: customerDetails.postcode.trim(),
    },
    termsAccepted: true,
    totals: {
      subtotal: summary.subtotal,
      shippingCost: summary.shippingCost,
      total: summary.total,
    },
  }
}
