import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { mount } from '@vue/test-utils'
import { HttpResponse, delay, http } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { catalogueProducts } from '@/mocks/catalogue.data'
import { server } from '@/test/msw-server'

import CatalogueView from './CatalogueView.vue'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      retryDelay: 1,
    },
  },
})

afterEach(() => {
  queryClient.clear()
})

describe('CatalogueView', () => {
  it('shows loading Skeletons while the catalogue request is pending', () => {
    server.use(
      http.get('*/products', async () => {
        await delay(100)

        return HttpResponse.json(catalogueProducts)
      }),
    )
    const wrapper = mount(CatalogueView, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
      },
    })

    expect(wrapper.get('[aria-label="Loading catalogue"]').attributes('aria-busy')).toBe('true')
  })

  it('shows an empty state when no Artworks are available', async () => {
    server.use(
      http.get('*/products', () => {
        return HttpResponse.json([])
      }),
    )
    const wrapper = mount(CatalogueView, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
      },
    })

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('No Artworks are currently available.')
    })
  })

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
      expect(artworkList.findAll('img')).toHaveLength(availableProducts.length)
    })
  })

  it('retries an initial failure once and lets the customer retry manually', async () => {
    let requestCount = 0
    server.use(
      http.get('*/products', () => {
        requestCount += 1

        if (requestCount <= 2) {
          return HttpResponse.json({ message: 'Service unavailable' }, { status: 503 })
        }

        return HttpResponse.json(catalogueProducts)
      }),
    )
    const wrapper = mount(CatalogueView, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
      },
    })

    await vi.waitFor(() => {
      expect(wrapper.get('[role="alert"]').text()).toContain('We could not load the catalogue')
    })
    expect(requestCount).toBe(2)

    await wrapper.get('button').trigger('click')

    await vi.waitFor(() => {
      expect(wrapper.get('[aria-label="Available Artworks"]').findAll('li')).toHaveLength(
        catalogueProducts.length,
      )
    })
    expect(requestCount).toBe(3)
  })
})
