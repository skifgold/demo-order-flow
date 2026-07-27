import { HttpResponse, http } from 'msw'
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
})
