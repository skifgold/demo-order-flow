import { ApplicationError } from './application-error'

export type OrderFieldIssue = {
  field: string
  message: string
}

export class OrderValidationError extends ApplicationError {
  readonly type = 'order-validation'

  constructor(readonly issues: readonly OrderFieldIssue[]) {
    super('The order contains validation errors.')
    this.name = 'OrderValidationError'
  }
}
