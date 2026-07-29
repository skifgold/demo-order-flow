import { z } from 'zod'

import type { BasketItem } from '@/features/basket'
import type { Product } from '@/features/catalogue'

import { isExpressEligible, normalizePrintConfiguration } from './configuration'
import { getCompletePrintConfiguration } from './order-summary'

const PrintConfigurationSchema = z.object({
  presentation: z.enum(['print-only', 'framed']).optional(),
  size: z.enum(['A4', 'A3', 'A2']).optional(),
  finish: z.enum(['matte', 'lustre']).optional(),
  frame: z.enum(['black', 'white', 'natural-oak']).optional(),
  glazing: z.enum(['glass', 'acrylic']).optional(),
})

const OrderConfigurationSchema = z.object({
  items: z.record(z.string(), PrintConfigurationSchema),
  shipping: z.enum(['standard', 'express']),
  giftOptions: z.object({
    message: z.string(),
    hidePricesOnPackingSlip: z.boolean(),
  }),
})

function getProductById(products: readonly Product[], productId: string): Product | undefined {
  return products.find((product) => product.id === productId)
}

export function createOrderConfigurationSchema({
  products,
  basketItems,
}: {
  products: readonly Product[]
  basketItems: readonly BasketItem[]
}) {
  return OrderConfigurationSchema.superRefine((configuration, context) => {
    const completeConfigurations = []

    for (const basketItem of basketItems) {
      const product = getProductById(products, basketItem.productId)
      const fieldPath = ['items', basketItem.productId]

      if (product === undefined) {
        context.addIssue({
          code: 'custom',
          path: fieldPath,
          message: 'This Artwork is no longer available.',
        })
        continue
      }

      const normalized = normalizePrintConfiguration({
        product,
        configuration: configuration.items[basketItem.productId] ?? {},
      })

      if (normalized.presentation === undefined) {
        context.addIssue({
          code: 'custom',
          path: [...fieldPath, 'presentation'],
          message: 'Choose a presentation.',
        })
      }
      if (normalized.size === undefined) {
        context.addIssue({
          code: 'custom',
          path: [...fieldPath, 'size'],
          message: 'Choose a size.',
        })
      }
      if (normalized.finish === undefined) {
        context.addIssue({
          code: 'custom',
          path: [...fieldPath, 'finish'],
          message: 'Choose a paper finish.',
        })
      }
      if (normalized.presentation === 'framed' && normalized.frame === undefined) {
        context.addIssue({
          code: 'custom',
          path: [...fieldPath, 'frame'],
          message: 'Choose a frame style.',
        })
      }
      if (normalized.presentation === 'framed' && normalized.glazing === undefined) {
        context.addIssue({
          code: 'custom',
          path: [...fieldPath, 'glazing'],
          message: 'Choose a glazing option.',
        })
      }

      completeConfigurations.push(getCompletePrintConfiguration(product, normalized))
    }

    if (configuration.shipping === 'express' && !isExpressEligible(completeConfigurations)) {
      context.addIssue({
        code: 'custom',
        path: ['shipping'],
        message: 'Express shipping is not available for this order.',
      })
    }
    if (configuration.giftOptions.message.length > 200) {
      context.addIssue({
        code: 'custom',
        path: ['giftOptions', 'message'],
        message: 'Gift message must be 200 characters or fewer.',
      })
    }
  })
}
