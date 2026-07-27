import { useQuery } from '@tanstack/vue-query'

import { NetworkError } from '@/shared/errors/network-error'
import { ServerError } from '@/shared/errors/server-error'

import { fetchProducts } from './fetch-products'
import { productKeys } from './product-keys'

export function useProductsQuery() {
  return useQuery({
    queryKey: productKeys.all,
    queryFn: ({ signal }) => fetchProducts(signal),
    retry: (failureCount, error) =>
      failureCount < 1 && (error instanceof NetworkError || error instanceof ServerError),
  })
}
