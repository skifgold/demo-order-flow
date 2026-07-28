import { useQuery } from '@tanstack/vue-query'
import { watch } from 'vue'

import { NetworkError } from '@/shared/errors/network-error'
import { ServerError } from '@/shared/errors/server-error'
import { reportUnexpectedError } from '@/shared/observability/report-unexpected-error'
import { unexpectedErrorContext } from '@/shared/observability/should-report-error'

import { fetchProducts } from './fetch-products'
import { productKeys } from './product-keys'

export function useProductsQuery() {
  const query = useQuery({
    queryKey: productKeys.all,
    queryFn: ({ signal }) => fetchProducts(signal),
    retry: (failureCount, error) =>
      failureCount < 1 && (error instanceof NetworkError || error instanceof ServerError),
  })

  let lastReportedError: unknown

  watch(query.error, (error) => {
    if (error === null) {
      lastReportedError = undefined
      return
    }

    if (error === lastReportedError) {
      return
    }

    lastReportedError = error
    const context = unexpectedErrorContext(
      error,
      query.data.value === undefined ? 'catalogue-load' : 'catalogue-refresh',
    )

    if (context !== undefined) {
      reportUnexpectedError(context)
    }
  })

  return query
}
