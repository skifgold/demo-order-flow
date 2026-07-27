import { describe, expect, it } from 'vitest'

import { ProductSchema } from './product.contract'

describe('ProductSchema', () => {
  it('accepts an Artwork response with integer minor-unit prices', () => {
    const response = {
      id: 'modern-geometry-07',
      name: 'Modern Geometry No. 7',
      category: 'Abstract',
      imagePath: '/artwork/modern-geometry-07.jpg',
      pricesBySize: {
        A4: 3500,
        A3: 5500,
        A2: 8000,
      },
      availableQuantity: 8,
    }

    expect(ProductSchema.parse(response)).toEqual(response)
  })

  it('rejects a response with a fractional price', () => {
    const response = {
      id: 'modern-geometry-07',
      name: 'Modern Geometry No. 7',
      category: 'Abstract',
      imagePath: '/artwork/modern-geometry-07.jpg',
      pricesBySize: {
        A4: 35.5,
      },
      availableQuantity: 8,
    }

    expect(ProductSchema.safeParse(response).success).toBe(false)
  })
})
