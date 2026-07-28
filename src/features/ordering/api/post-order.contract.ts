import { z } from 'zod'

const PrintConfigurationSchema = z.discriminatedUnion('presentation', [
  z.object({
    presentation: z.literal('print-only'),
    size: z.enum(['A4', 'A3', 'A2']),
    finish: z.enum(['matte', 'lustre']),
  }),
  z.object({
    presentation: z.literal('framed'),
    size: z.enum(['A4', 'A3', 'A2']),
    finish: z.enum(['matte', 'lustre']),
    frame: z.enum(['black', 'white', 'natural-oak']),
    glazing: z.enum(['glass', 'acrylic']),
  }),
])

export const OrderRequestSchema = z.object({
  lines: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
        configuration: PrintConfigurationSchema,
        unitPrice: z.number().int().nonnegative(),
        lineTotal: z.number().int().nonnegative(),
      }),
    )
    .min(1),
  shipping: z.enum(['standard', 'express']),
  giftOptions: z.object({
    message: z.string().max(200),
    hidePricesOnPackingSlip: z.boolean(),
  }),
  customer: z.object({
    fullName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1).optional(),
  }),
  deliveryAddress: z.object({
    addressLine1: z.string().min(1),
    city: z.string().min(1),
    postcode: z.string().min(1),
  }),
  termsAccepted: z.literal(true),
  totals: z.object({
    subtotal: z.number().int().nonnegative(),
    shippingCost: z.number().int().nonnegative(),
    total: z.number().int().nonnegative(),
  }),
})

export const OrderResponseSchema = z.object({
  orderNumber: z.string().min(1),
  acceptedAt: z.string().datetime(),
  estimatedDeliveryDate: z.string().date(),
  total: z.number().int().nonnegative(),
})

export const OrderFieldErrorSchema = z.object({
  field: z.string().min(1),
  message: z.string().min(1),
})

export const OrderValidationErrorResponseSchema = z.object({
  type: z.literal('validation'),
  errors: z.array(OrderFieldErrorSchema).min(1),
})

export const OrderConflictErrorResponseSchema = z.object({
  type: z.literal('conflict'),
  message: z.string().min(1),
  affectedProductIds: z.array(z.string().min(1)).default([]),
})

export type AcceptedOrder = z.infer<typeof OrderResponseSchema>
export type OrderFieldError = z.infer<typeof OrderFieldErrorSchema>
