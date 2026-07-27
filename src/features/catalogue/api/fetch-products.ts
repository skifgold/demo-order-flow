import { ServerError } from '@/shared/errors/server-error'

import { ProductSchema, type Product } from './product.contract'

const productsUrl = new URL('/products', window.location.origin)

export async function fetchProducts(signal?: AbortSignal): Promise<Product[]> {
  const response = await fetch(productsUrl, { signal })

  if (!response.ok) {
    throw new ServerError(response.status)
  }

  return ProductSchema.array().parse(await response.json())
}
