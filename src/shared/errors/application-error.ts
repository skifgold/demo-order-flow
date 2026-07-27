export abstract class ApplicationError extends Error {
  abstract readonly type: string
}
