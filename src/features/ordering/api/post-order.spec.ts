import { afterEach, describe, expect, it, vi } from 'vitest'

import type { OrderPayload } from '../domain/order-configuration.types'
import { ServerError } from '@/shared/errors/server-error'

import { postOrder } from './post-order'

const payload: OrderPayload = {
  items: [
    {
      productId: 'coastal-light',
      quantity: 1,
      configuration: { presentation: 'print-only', size: 'A4', finish: 'matte' },
      unitPrice: 3500,
      itemTotal: 3500,
    },
  ],
  shipping: 'standard',
  giftOptions: { message: '', hidePricesOnPackingSlip: false },
  customer: { fullName: 'Maya Chen', email: 'maya@example.com' },
  deliveryAddress: { addressLine1: '1 Market Street', city: 'London', postcode: 'E1 6AN' },
  termsAccepted: true,
  totals: { subtotal: 3500, shippingCost: 695, total: 4195 },
}

afterEach(() => vi.unstubAllGlobals())

describe('postOrder', () => {
  it('returns an accepted result for a valid successful response', async () => {
    const acceptedOrder = {
      orderNumber: 'ORD-77',
      acceptedAt: '2026-07-28T10:00:00.000Z',
      estimatedDeliveryDate: '2026-08-03',
      total: 4195,
    }
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(acceptedOrder))
    vi.stubGlobal('fetch', fetchMock)

    await expect(postOrder(payload)).resolves.toEqual(acceptedOrder)
    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('rejects 200 because creating an order requires 201 Created', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue(
        jsonResponse(
          {
            orderNumber: 'ORD-77',
            acceptedAt: '2026-07-28T10:00:00.000Z',
            estimatedDeliveryDate: '2026-08-03',
            total: 4195,
          },
          200,
        ),
      ),
    )

    await expect(postOrder(payload)).rejects.toBeInstanceOf(ServerError)
  })

  it('throws typed field errors for the checkout recovery flow', async () => {
    const errors = [{ field: 'customer.email', message: 'Use a different email address.' }]
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ type: 'validation', errors }, 422)),
    )

    await expect(postOrder(payload)).rejects.toMatchObject({
      type: 'order-validation',
      issues: errors,
    })
  })

  it('throws a typed conflict with affected Basket Items', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue(
        jsonResponse(
          {
            type: 'conflict',
            message: 'Availability changed.',
            affectedProductIds: ['coastal-light'],
          },
          409,
        ),
      ),
    )

    await expect(postOrder(payload)).rejects.toMatchObject({
      type: 'order-conflict',
      affectedProductIds: ['coastal-light'],
    })
  })
})

function jsonResponse(body: unknown, status = 201): Response {
  return new Response(JSON.stringify(body), { status })
}
