import type { Product } from '@/features/catalogue'

export type CheckoutLine = {
  product: Product
  quantity: number
}
