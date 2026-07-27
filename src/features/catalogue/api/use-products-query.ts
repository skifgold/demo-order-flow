import { useQuery } from '@tanstack/vue-query'

import { fetchProducts } from './fetch-products'
import { productKeys } from './product-keys'

export function useProductsQuery() {
  return useQuery({
    queryKey: productKeys.all,
    queryFn: ({ signal }) => fetchProducts(signal),
  })
}
