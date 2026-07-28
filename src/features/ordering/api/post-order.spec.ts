import { afterEach, describe, expect, it, vi } from 'vitest'

import type { OrderPayload } from '../domain/order-configuration.types'
import { ServerError } from '@/shared/errors/server-error'

import { postOrder } from './post-order'

const payload: OrderPayload = {
  lines: [
    {
      productId: 'coastal-light',
      quantity: 1,
      configuration: { presentation: 'print-only', size: 'A4', finish: 'matte' },
      unitPrice: 3500,
      lineTotal: 3500,
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

    await expect(postOrder(payload)).resolves.toEqual({ kind: 'accepted', order: acceptedOrder })
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

  it('returns field errors as a validation result', async () => {
    const errors = [{ field: 'customer.email', message: 'Use a different email address.' }]
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ type: 'validation', errors }, 422)),
    )

    await expect(postOrder(payload)).resolves.toEqual({ kind: 'validation', errors })
  })

  it('returns a conflict result when the order changed before submission', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(
          jsonResponse({ type: 'conflict', message: 'Availability changed.' }, 409),
        ),
    )

    await expect(postOrder(payload)).resolves.toEqual({ kind: 'conflict' })
  })
})

function jsonResponse(body: unknown, status = 201): Response {
  return new Response(JSON.stringify(body), { status })
}
