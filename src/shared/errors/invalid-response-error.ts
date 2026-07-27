import { ApplicationError } from './application-error'

export class InvalidResponseError extends ApplicationError {
  readonly type = 'invalid-response'

  constructor() {
    super('The server returned an invalid response.')
    this.name = 'InvalidResponseError'
  }
}
