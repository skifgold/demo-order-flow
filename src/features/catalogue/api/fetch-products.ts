import { InvalidResponseError } from '@/shared/errors/invalid-response-error'
import { NetworkError } from '@/shared/errors/network-error'
import { ServerError } from '@/shared/errors/server-error'

import { ProductSchema, type Product } from './product.contract'

const productsUrl = new URL('/products', window.location.origin)

export async function fetchProducts(signal?: AbortSignal): Promise<Product[]> {
  let response: Response

  try {
    response = await fetch(productsUrl, { signal })
  } catch (error) {
    if (signal?.aborted) {
      throw new DOMException('The request was cancelled.', 'AbortError')
    }

    if (isRequestCancellation(error)) {
      throw error
    }

    throw new NetworkError()
  }

  if (!response.ok) {
    throw new ServerError(response.status)
  }

  let body: unknown

  try {
    body = await response.json()
  } catch {
    throw new InvalidResponseError()
  }

  const parsedProducts = ProductSchema.array().safeParse(body)

  if (!parsedProducts.success) {
    throw new InvalidResponseError()
  }

  return parsedProducts.data
}

function isRequestCancellation(error: unknown): error is DOMException {
  return error instanceof DOMException && error.name === 'AbortError'
}
