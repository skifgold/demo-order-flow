import type { OrderPayload } from '../domain/order-configuration.types'
import { InvalidResponseError } from '@/shared/errors/invalid-response-error'
import { OrderConflictError } from '@/shared/errors/order-conflict-error'
import { OrderValidationError } from '@/shared/errors/order-validation-error'
import { ServerError } from '@/shared/errors/server-error'
import { httpClient } from '@/shared/http/http-client'

import {
  OrderConflictErrorResponseSchema,
  OrderResponseSchema,
  OrderValidationErrorResponseSchema,
  type AcceptedOrder,
} from './post-order.contract'

const ordersUrl = new URL('/orders', window.location.origin)

export async function postOrder(
  payload: OrderPayload,
  signal?: AbortSignal,
): Promise<AcceptedOrder> {
  const response = await httpClient.post({ url: ordersUrl, body: payload, signal })

  return toPostOrderResult(response.status, await httpClient.readJson(response))
}

function toPostOrderResult(status: number, body: unknown): AcceptedOrder {
  switch (status) {
    case 201:
      return toAcceptedOrderResult(body)
    case 422:
      return toValidationResult(body)
    case 409:
      return toConflictResult(body)
    default:
      throw new ServerError(status)
  }
}

function toAcceptedOrderResult(body: unknown): AcceptedOrder {
  const acceptedOrder = OrderResponseSchema.safeParse(body)

  if (!acceptedOrder.success) {
    throw new InvalidResponseError()
  }

  return acceptedOrder.data
}

function toValidationResult(body: unknown): never {
  const validationError = OrderValidationErrorResponseSchema.safeParse(body)

  if (!validationError.success) {
    throw new InvalidResponseError()
  }

  throw new OrderValidationError(validationError.data.errors)
}

function toConflictResult(body: unknown): never {
  const conflictError = OrderConflictErrorResponseSchema.safeParse(body)

  if (!conflictError.success) {
    throw new InvalidResponseError()
  }

  throw new OrderConflictError(conflictError.data.affectedProductIds)
}
