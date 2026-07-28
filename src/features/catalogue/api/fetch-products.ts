import { InvalidResponseError } from '@/shared/errors/invalid-response-error'
import { ServerError } from '@/shared/errors/server-error'
import { httpClient } from '@/shared/http/http-client'

import { ProductSchema, type Product } from './product.contract'

const productsUrl = new URL('/products', window.location.origin)

export async function fetchProducts(signal?: AbortSignal): Promise<Product[]> {
  const response = await httpClient.get({ url: productsUrl, signal })

  if (!response.ok) {
    throw new ServerError(response.status)
  }

  const parsedProducts = ProductSchema.array().safeParse(await httpClient.readJson(response))

  if (!parsedProducts.success) {
    throw new InvalidResponseError()
  }

  return parsedProducts.data
}
