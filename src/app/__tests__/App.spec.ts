import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createMemoryHistory } from 'vue-router'

import App from '../App.vue'
import { createAppRouter } from '../router'

describe('App', () => {
  const router = createAppRouter(createMemoryHistory())

  beforeEach(async () => {
    await router.push('/')
    await router.isReady()
  })

  it('renders the catalogue placeholder at the root route', () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.get('h1').text()).toBe('Artwork catalogue')
  })

  it('renders the checkout placeholder at the checkout route', async () => {
    await router.push('/checkout')

    const wrapper = mount(App, {
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.get('h1').text()).toBe('Checkout')
  })
})
