import { HttpResponse, delay, http } from 'msw'

import { catalogueProducts } from './catalogue.data'
import { consumeCatalogueScenario, consumeOrderScenario } from './demo-scenarios'
import { OrderRequestSchema } from '@/features/ordering/api/post-order.contract'

export const handlers = [
  http.get('*/products', async () => {
    const scenario = consumeCatalogueScenario()

    if (scenario === 'failure') {
      return HttpResponse.json({ message: 'Demo catalogue failure.' }, { status: 503 })
    }

    if (scenario === 'delay') {
      await delay(2500)
    }

    await delay(250)

    return HttpResponse.json(catalogueProducts)
  }),
  http.post('*/orders', async ({ request }) => {
    const scenario = consumeOrderScenario()

    if (scenario === 'conflict') {
      return HttpResponse.json(
        {
          type: 'conflict',
          message: 'Demo availability changed.',
          affectedProductIds: ['modern-geometry-07'],
        },
        { status: 409 },
      )
    }

    if (scenario === 'server-failure') {
      return HttpResponse.json({ message: 'Demo server failure.' }, { status: 500 })
    }

    await delay(250)

    const order = OrderRequestSchema.safeParse(await request.json())

    if (!order.success) {
      return HttpResponse.json(
        {
          type: 'validation',
          errors: [{ field: 'form', message: 'Review the order details and try again.' }],
        },
        { status: 422 },
      )
    }

    return HttpResponse.json(
      {
        orderNumber: 'ORD-2026-1001',
        acceptedAt: '2026-07-28T10:00:00.000Z',
        estimatedDeliveryDate: '2026-08-03',
        total: order.data.totals.total,
      },
      { status: 201 },
    )
  }),
]
