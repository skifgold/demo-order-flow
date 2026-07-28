import { describe, expect, it } from 'vitest'

import { NetworkError } from '@/shared/errors/network-error'
import { OrderConflictError } from '@/shared/errors/order-conflict-error'
import { OrderValidationError } from '@/shared/errors/order-validation-error'

import { unexpectedErrorContext } from './should-report-error'

describe('unexpectedErrorContext', () => {
  it('returns only allow-listed technical context for a final network failure', () => {
    expect(unexpectedErrorContext(new NetworkError(), 'order-submission')).toEqual({
      operation: 'order-submission',
      errorType: 'network',
    })
  })

  it.each([
    ['field validation', new OrderValidationError([])],
    ['order conflict', new OrderConflictError([])],
    ['request cancellation', new DOMException('Cancelled.', 'AbortError')],
  ])('does not report expected %s', (_description, error) => {
    expect(unexpectedErrorContext(error, 'order-submission')).toBeUndefined()
  })
})
