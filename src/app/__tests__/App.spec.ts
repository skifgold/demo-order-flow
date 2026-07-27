import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createMemoryHistory } from 'vue-router'

import App from '../App.vue'
import { createAppRouter } from '../router'

describe('App', () => {
  const router = createAppRouter(createMemoryHistory())
  const queryClient = new QueryClient()

  beforeEach(async () => {
    await router.push('/')
    await router.isReady()
  })

  afterEach(() => {
    queryClient.clear()
  })

  it('renders the catalogue at the root route', () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router, [VueQueryPlugin, { queryClient }]],
      },
    })

    expect(wrapper.get('main.app-layout').get('h1').text()).toBe('Artwork catalogue')
  })

  it('renders the checkout placeholder at the checkout route', async () => {
    await router.push('/checkout')

    const wrapper = mount(App, {
      global: {
        plugins: [router, [VueQueryPlugin, { queryClient }]],
      },
    })

    expect(wrapper.get('main.app-layout').get('h1').text()).toBe('Checkout')
  })
})
