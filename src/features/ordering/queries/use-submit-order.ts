import { useMutation } from '@tanstack/vue-query'

import type { OrderPayload } from '../domain/order-configuration.types'

import { postOrder } from '../api/post-order'

export function useSubmitOrder() {
  return useMutation({
    mutationFn: (payload: OrderPayload) => postOrder(payload),
    retry: false,
  })
}
