import { useMutation } from '@tanstack/vue-query'

import type { OrderPayload } from '../domain/order-configuration.types'
import type { AcceptedOrder } from '../api/post-order.contract'

import { postOrder } from '../api/post-order'

export function useSubmitOrder() {
  return useMutation<AcceptedOrder, Error, OrderPayload>({
    mutationFn: (payload: OrderPayload) => postOrder(payload),
    retry: false,
  })
}
