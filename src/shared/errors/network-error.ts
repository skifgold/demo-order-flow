import { ApplicationError } from './application-error'

export class NetworkError extends ApplicationError {
  readonly type = 'network'

  constructor() {
    super('The network request could not be completed.')
    this.name = 'NetworkError'
  }
}
