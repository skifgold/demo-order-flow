import { afterEach, describe, expect, it, vi } from 'vitest'

import { httpClient } from './http-client'

afterEach(() => vi.unstubAllGlobals())

describe('httpClient', () => {
  it('serializes a POST body and returns its JSON response', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(JSON.stringify({ id: 'ord-1' }), { status: 201 }))
    vi.stubGlobal('fetch', fetchMock)

    const response = await httpClient.post({ url: '/orders', body: { quantity: 1 } })

    expect(response.status).toBe(201)
    await expect(httpClient.readJson(response)).resolves.toEqual({ id: 'ord-1' })
    expect(fetchMock).toHaveBeenCalledWith(
      '/orders',
      expect.objectContaining({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ quantity: 1 }),
      }),
    )
  })

  it('maps a network failure to NetworkError', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockRejectedValue(new TypeError('Network failed')))

    await expect(httpClient.get({ url: '/products' })).rejects.toMatchObject({
      name: 'NetworkError',
    })
  })

  it('rejects a response that does not contain JSON', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(new Response('not JSON')))

    const response = await httpClient.get({ url: '/products' })

    await expect(httpClient.readJson(response)).rejects.toMatchObject({
      name: 'InvalidResponseError',
    })
  })
})
