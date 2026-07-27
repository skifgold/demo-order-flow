import { HttpResponse, http } from 'msw'

import { catalogueProducts } from './catalogue.data'

export const handlers = [
  http.get('*/products', () => {
    return HttpResponse.json(catalogueProducts)
  }),
]
