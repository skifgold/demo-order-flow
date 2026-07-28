import type { ApplicationErrorType } from '@/shared/errors/application-error'

export type UnexpectedErrorContext = {
  operation: 'catalogue-load' | 'catalogue-refresh' | 'order-submission' | 'view-render'
  errorType: ApplicationErrorType | 'unknown'
}

/**
 * Replace this no-op with a Sentry integration when production observability is funded.
 * Its context deliberately cannot carry customer data, form values, addresses, or payloads.
 */
export function reportUnexpectedError(_context: UnexpectedErrorContext): void {
  // Intentionally empty: this project demonstrates the integration seam without collecting data.
}
