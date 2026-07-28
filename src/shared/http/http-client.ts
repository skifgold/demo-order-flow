import { InvalidResponseError } from '@/shared/errors/invalid-response-error'
import { NetworkError } from '@/shared/errors/network-error'

type HttpRequest = {
  url: URL | string
  signal?: AbortSignal
}

type HttpPostRequest<TBody> = HttpRequest & {
  body: TBody
}

export const httpClient = {
  get,
  post,
  readJson,
}

async function get({ url, signal }: HttpRequest): Promise<Response> {
  return send({ url, signal })
}

async function post<TBody>({ url, body, signal }: HttpPostRequest<TBody>): Promise<Response> {
  return send({
    url,
    signal,
    requestInit: {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    },
  })
}

async function send({
  url,
  signal,
  requestInit,
}: HttpRequest & { requestInit?: RequestInit }): Promise<Response> {
  let response: Response

  try {
    response = await fetch(url, { ...requestInit, signal })
  } catch (error) {
    if (signal?.aborted) {
      throw new DOMException('The request was cancelled.', 'AbortError')
    }

    if (isRequestCancellation(error)) {
      throw error
    }

    throw new NetworkError()
  }

  return response
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    throw new InvalidResponseError()
  }
}

function isRequestCancellation(error: unknown): error is DOMException {
  return error instanceof DOMException && error.name === 'AbortError'
}
