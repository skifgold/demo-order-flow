import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createMemoryHistory } from 'vue-router'

import { basketStorageKey, useBasketStore } from '@/features/basket'

import App from '../App.vue'
import { createAppRouter } from '../router'

describe('App', () => {
  const router = createAppRouter(createMemoryHistory())
  const queryClient = new QueryClient()

  beforeEach(async () => {
    window.localStorage.clear()
    await router.push('/')
    await router.isReady()
  })

  afterEach(() => {
    queryClient.clear()
  })

  it('renders the catalogue at the root route', () => {
    const wrapper = mount(App, {
      global: {
        plugins: [createPinia(), router, [VueQueryPlugin, { queryClient }]],
      },
    })

    expect(wrapper.get('main.app-layout').get('h1').text()).toBe('Artwork catalogue')
  })

  it('guides a customer with an empty Basket back to Artwork selection at the checkout route', async () => {
    await router.push('/checkout')

    const wrapper = mount(App, {
      global: {
        plugins: [createPinia(), router, [VueQueryPlugin, { queryClient }]],
      },
    })

    await vi.waitFor(() => {
      expect(wrapper.get('main.app-layout').get('h1').text()).toBe('Your Basket is empty')
    })
  })

  it('hydrates and reconciles a persisted Basket through app composition', async () => {
    window.localStorage.setItem(
      basketStorageKey,
      JSON.stringify({
        version: 2,
        items: [{ productId: 'modern-geometry-07', quantity: 99 }],
      }),
    )
    const pinia = createPinia()
    mount(App, {
      global: {
        plugins: [pinia, router, [VueQueryPlugin, { queryClient }]],
      },
    })
    const basket = useBasketStore(pinia)

    await vi.waitFor(() => {
      expect(basket.items).toEqual([{ productId: 'modern-geometry-07', quantity: 8 }])
    })
  })
})
