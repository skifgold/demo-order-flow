export type ApplicationErrorType =
  | 'invalid-response'
  | 'network'
  | 'server'
  | 'order-conflict'
  | 'order-validation'

export abstract class ApplicationError extends Error {
  abstract readonly type: ApplicationErrorType
}
