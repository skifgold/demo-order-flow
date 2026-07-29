import type { Product } from '@/features/catalogue'

export type CheckoutItem = {
  product: Product
  quantity: number
}
