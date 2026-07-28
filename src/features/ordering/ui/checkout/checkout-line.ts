import type { Product } from '@/features/catalogue/api/product.contract'

export type CheckoutLine = {
  product: Product
  quantity: number
}
