import type { OrderPayload } from '../domain/order-configuration.types'
import { InvalidResponseError } from '@/shared/errors/invalid-response-error'
import { NetworkError } from '@/shared/errors/network-error'
import { ServerError } from '@/shared/errors/server-error'

import {
  OrderConflictErrorResponseSchema,
  OrderResponseSchema,
  OrderValidationErrorResponseSchema,
  type AcceptedOrder,
  type OrderFieldError,
} from './post-order.contract'

const ordersUrl = new URL('/orders', window.location.origin)

export type PostOrderResult =
  | { kind: 'accepted'; order: AcceptedOrder }
  | { kind: 'validation'; errors: readonly OrderFieldError[] }
  | { kind: 'conflict' }

export async function postOrder(
  payload: OrderPayload,
  signal?: AbortSignal,
): Promise<PostOrderResult> {
  let response: Response

  try {
    response = await fetch(ordersUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal,
    })
  } catch (error) {
    if (signal?.aborted) {
      throw new DOMException('The request was cancelled.', 'AbortError')
    }

    if (isRequestCancellation(error)) {
      throw error
    }

    throw new NetworkError()
  }

  const body = await readJson(response)

  return toPostOrderResult(response.status, body)
}

function toPostOrderResult(status: number, body: unknown): PostOrderResult {
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

function toAcceptedOrderResult(body: unknown): PostOrderResult {
  const acceptedOrder = OrderResponseSchema.safeParse(body)

  if (!acceptedOrder.success) {
    throw new InvalidResponseError()
  }

  return { kind: 'accepted', order: acceptedOrder.data }
}

function toValidationResult(body: unknown): PostOrderResult {
  const validationError = OrderValidationErrorResponseSchema.safeParse(body)

  if (!validationError.success) {
    throw new InvalidResponseError()
  }

  return { kind: 'validation', errors: validationError.data.errors }
}

function toConflictResult(body: unknown): PostOrderResult {
  const conflictError = OrderConflictErrorResponseSchema.safeParse(body)

  if (!conflictError.success) {
    throw new InvalidResponseError()
  }

  return { kind: 'conflict' }
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    throw new InvalidResponseError()
  }
}

function isRequestCancellation(error: unknown): error is DOMException {
  return error instanceof DOMException && error.name === 'AbortError'
}
