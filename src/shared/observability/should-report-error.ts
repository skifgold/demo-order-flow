import { ApplicationError } from '@/shared/errors/application-error'
import { isRequestCancellation } from '@/shared/errors/is-request-cancellation'
import { OrderConflictError } from '@/shared/errors/order-conflict-error'
import { OrderValidationError } from '@/shared/errors/order-validation-error'

import type { UnexpectedErrorContext } from './report-unexpected-error'

export function unexpectedErrorContext(
  error: unknown,
  operation: UnexpectedErrorContext['operation'],
): UnexpectedErrorContext | undefined {
  if (
    isRequestCancellation(error) ||
    error instanceof OrderConflictError ||
    error instanceof OrderValidationError
  ) {
    return undefined
  }

  return {
    operation,
    errorType: error instanceof ApplicationError ? error.type : 'unknown',
  }
}
