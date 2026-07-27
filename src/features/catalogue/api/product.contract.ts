import { z } from 'zod'

const PriceBySizeSchema = z
  .object({
    A4: z.number().int().positive().optional(),
    A3: z.number().int().positive().optional(),
    A2: z.number().int().positive().optional(),
  })
  .refine((pricesBySize) => Object.values(pricesBySize).some((price) => price !== undefined), {
    message: 'At least one size must have a price.',
  })

export const ProductSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  imagePath: z.string().startsWith('/'),
  pricesBySize: PriceBySizeSchema,
  availableQuantity: z.number().int().nonnegative(),
})

export type Product = z.infer<typeof ProductSchema>
