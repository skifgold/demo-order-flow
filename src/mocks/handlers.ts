import { HttpResponse, delay, http } from 'msw'

import { catalogueProducts } from './catalogue.data'

export const handlers = [
  http.get('*/products', async () => {
    await delay(250)

    return HttpResponse.json(catalogueProducts)
  }),
]
