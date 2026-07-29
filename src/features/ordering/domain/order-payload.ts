import type { BasketItem } from '@/features/basket'
import type { Product } from '@/features/catalogue'

import { CustomerDetailsSchema } from './customer-details'
import { getCompletePrintConfiguration, calculateOrderSummary } from './order-summary'
import { validateOrderConfiguration } from './order-validation'
import type { CustomerDetails, OrderConfiguration, OrderPayload } from './order-configuration.types'

export function createOrderPayload({
  products,
  basketItems,
  configuration,
  customerDetails,
}: {
  products: readonly Product[]
  basketItems: readonly BasketItem[]
  configuration: OrderConfiguration
  customerDetails: CustomerDetails
}): OrderPayload {
  const validation = validateOrderConfiguration({ products, basketItems, configuration })
  const customerDetailsValidation = CustomerDetailsSchema.safeParse(customerDetails)

  if (validation.issues.length > 0 || !customerDetailsValidation.success) {
    throw new Error('Cannot create an order payload from an invalid configuration.')
  }

  const summary = calculateOrderSummary({ products, basketItems, configuration })
  const items = basketItems.map((basketItem) => {
    const product = products.find((candidate) => candidate.id === basketItem.productId)!
    const completeConfiguration = getCompletePrintConfiguration(
      product,
      configuration.items[product.id],
    )!
    const summaryItem = summary.items.find((item) => item.productId === product.id)!

    return {
      productId: product.id,
      quantity: basketItem.quantity,
      configuration: { ...completeConfiguration },
      unitPrice: summaryItem.unitPrice!,
      itemTotal: summaryItem.itemTotal!,
    }
  })

  return {
    items,
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
