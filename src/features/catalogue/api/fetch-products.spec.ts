import { HttpResponse, delay, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '@/test/msw-server'

import { fetchProducts } from './fetch-products'

describe('fetchProducts', () => {
  it('returns the agreed Artworks from the catalogue endpoint', async () => {
    const products = await fetchProducts()

    expect(products.map((product) => product.id)).toEqual([
      'modern-geometry-07',
      'botanical-study-01',
      'coastal-light',
      'concrete-angles',
      'night-reflections',
      'cote-d-azur',
    ])
  })

  it('maps an unsuccessful response to a server error', async () => {
    server.use(
      http.get('*/products', () => {
        return HttpResponse.json({ message: 'Service unavailable' }, { status: 503 })
      }),
    )

    await expect(fetchProducts()).rejects.toMatchObject({
      name: 'ServerError',
      status: 503,
    })
  })

  it('maps an invalid Product response to an invalid response error', async () => {
    server.use(
      http.get('*/products', () => {
        return HttpResponse.json([
          {
            id: 'invalid-artwork',
            name: 'Invalid Artwork',
            category: 'Abstract',
            imagePath: '/artwork/invalid-artwork.jpg',
            pricesBySize: { A4: 35.5 },
            availableQuantity: 1,
          },
        ])
      }),
    )

    await expect(fetchProducts()).rejects.toMatchObject({
      name: 'InvalidResponseError',
    })
  })

  it('maps a network failure to a network error', async () => {
    server.use(
      http.get('*/products', () => {
        return HttpResponse.error()
      }),
    )

    await expect(fetchProducts()).rejects.toMatchObject({
      name: 'NetworkError',
    })
  })

  it('preserves a request cancellation', async () => {
    server.use(
      http.get('*/products', async () => {
        await delay(1000)

        return HttpResponse.json([])
      }),
    )
    const controller = new AbortController()
    const request = fetchProducts(controller.signal)

    controller.abort()

    await expect(request).rejects.toMatchObject({ name: 'AbortError' })
  })
})
