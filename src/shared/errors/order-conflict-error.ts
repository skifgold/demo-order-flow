import { ApplicationError } from './application-error'

export class OrderConflictError extends ApplicationError {
  readonly type = 'order-conflict'

  constructor(readonly affectedProductIds: readonly string[]) {
    super('The order can no longer be placed without review.')
    this.name = 'OrderConflictError'
  }
}
