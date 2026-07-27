import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { mount } from '@vue/test-utils'
import { HttpResponse, http } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { catalogueProducts } from '@/mocks/catalogue.data'
import { server } from '@/test/msw-server'

import CatalogueView from './CatalogueView.vue'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

afterEach(() => {
  queryClient.clear()
})

describe('CatalogueView', () => {
  it('renders an Artwork card for each product returned by the catalogue', async () => {
    const availableProducts = catalogueProducts.slice(0, 2)
    server.use(
      http.get('*/products', () => {
        return HttpResponse.json(availableProducts)
      }),
    )

    const wrapper = mount(CatalogueView, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
      },
    })

    await vi.waitFor(() => {
      const artworkList = wrapper.get('[aria-label="Available Artworks"]')

      expect(artworkList.findAll('li')).toHaveLength(availableProducts.length)
    })
  })
})
