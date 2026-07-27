import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { mount } from '@vue/test-utils'
import { HttpResponse, delay, http } from 'msw'
import { createPinia } from 'pinia'
import { createMemoryHistory } from 'vue-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { catalogueProducts } from '@/mocks/catalogue.data'
import { server } from '@/test/msw-server'
import { createAppRouter } from '@/app/router'

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

beforeEach(() => {
  window.localStorage.clear()
})

function mountCatalogue() {
  return mount(CatalogueView, {
    global: {
      plugins: [
        createPinia(),
        createAppRouter(createMemoryHistory()),
        [VueQueryPlugin, { queryClient }],
      ],
    },
  })
}

describe('CatalogueView', () => {
  it('shows loading Skeletons while the catalogue request is pending', () => {
    server.use(
      http.get('*/products', async () => {
        await delay(100)

        return HttpResponse.json(catalogueProducts)
      }),
    )
    const wrapper = mountCatalogue()

    expect(wrapper.get('[aria-label="Loading catalogue"]').attributes('aria-busy')).toBe('true')
  })

  it('shows an empty state when no Artworks are available', async () => {
    server.use(
      http.get('*/products', () => {
        return HttpResponse.json([])
      }),
    )
    const wrapper = mountCatalogue()

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

    const wrapper = mountCatalogue()

    await vi.waitFor(() => {
      const artworkList = wrapper.get('[aria-label="Available Artworks"]')

      expect(artworkList.findAll('li')).toHaveLength(availableProducts.length)
      expect(artworkList.findAll('img')).toHaveLength(availableProducts.length)
    })

    expect(wrapper.get('[aria-label="Basket summary"] button').attributes('disabled')).toBeDefined()
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
    const wrapper = mountCatalogue()

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

  it('lets the customer select an Artwork, change its quantity, and begin checkout', async () => {
    const router = createAppRouter(createMemoryHistory())
    await router.push('/')
    const wrapper = mount(CatalogueView, {
      global: {
        plugins: [createPinia(), router, [VueQueryPlugin, { queryClient }]],
      },
    })

    await vi.waitFor(() => {
      expect(wrapper.get('[aria-label="Available Artworks"]')).toBeTruthy()
    })

    const artworkName = catalogueProducts[0]!.name
    await wrapper.get(`[aria-label="Add ${artworkName} to basket"]`).trigger('click')

    expect(wrapper.get('[aria-label="Basket summary"]').text()).toContain('1 Artwork selected')
    expect(wrapper.get(`[aria-label="${artworkName} quantity"]`).text()).toBe('1')
    expect(wrapper.get('.artwork-card--selected').text()).toContain('In your basket · 1 print')
    expect(wrapper.find(`[aria-label="Add ${artworkName} to basket"]`).exists()).toBe(false)

    await wrapper.get(`[aria-label="Increase quantity of ${artworkName}"]`).trigger('click')

    expect(wrapper.get(`[aria-label="${artworkName} quantity"]`).text()).toBe('2')

    await wrapper.get('[aria-label="Basket summary"]').get('button').trigger('click')
    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('checkout'))
  })
})
