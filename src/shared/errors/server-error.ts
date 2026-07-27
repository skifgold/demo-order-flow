import { ApplicationError } from './application-error'

export class ServerError extends ApplicationError {
  readonly type = 'server'

  constructor(readonly status: number) {
    super(`The server could not process the request: ${status}`)
    this.name = 'ServerError'
  }
}
