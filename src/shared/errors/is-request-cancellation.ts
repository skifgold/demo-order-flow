export function isRequestCancellation(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}
