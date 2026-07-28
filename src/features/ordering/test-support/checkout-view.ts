import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import { createMemoryHistory } from 'vue-router'
import { expect, vi } from 'vitest'

import App from '@/app/App.vue'
import { useBasketStore } from '@/features/basket'
import { createAppRouter } from '@/app/router'

import PresentationChoice from '../ui/configuration/PresentationChoice.vue'
import SelectField from '../ui/form/SelectField.vue'
import CheckoutView from '../views/CheckoutView.vue'

type CheckoutMount = {
  wrapper: VueWrapper
  router: ReturnType<typeof createAppRouter>
}

export async function mountCheckout({
  throughApp = false,
}: { throughApp?: boolean } = {}): Promise<CheckoutMount> {
  const pinia = createPinia()
  const router = createAppRouter(createMemoryHistory())
  const basket = useBasketStore(pinia)
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  basket.add('modern-geometry-07', 8)

  if (throughApp) {
    await router.push('/checkout')
  }

  const wrapper = mount(throughApp ? App : CheckoutView, {
    attachTo: document.body,
    global: {
      plugins: [pinia, router, [VueQueryPlugin, { queryClient }], PrimeVue],
      stubs: {
        transition: false,
      },
    },
  })

  return { wrapper, router }
}

export async function waitForConfiguration(wrapper: VueWrapper): Promise<void> {
  await vi.waitFor(() => {
    expect(wrapper.get('#checkout-title').text()).toBe('Configure your prints')
  })
}

export async function selectConfigurationValue(
  wrapper: VueWrapper,
  inputId: string,
  value: string,
): Promise<void> {
  const configurationSelect = wrapper
    .findAllComponents(SelectField)
    .find((candidate) => candidate.props('inputId') === inputId)
  const presentationChoice = wrapper
    .findAllComponents(PresentationChoice)
    .find((candidate) => candidate.props('inputId') === inputId)
  const select = configurationSelect ?? presentationChoice

  if (select === undefined) {
    throw new Error(`Could not find configuration select ${inputId}.`)
  }

  await select.vm.$emit('update:modelValue', value)
}

export async function choosePrintOnlyA4Matte(wrapper: VueWrapper): Promise<void> {
  await selectConfigurationValue(
    wrapper,
    'configuration-lines-modern-geometry-07-presentation',
    'print-only',
  )
  await selectConfigurationValue(wrapper, 'configuration-lines-modern-geometry-07-size', 'A4')
  await selectConfigurationValue(wrapper, 'configuration-lines-modern-geometry-07-finish', 'matte')
}

export async function expectFocusOn(element: Element): Promise<void> {
  await vi.waitFor(() => expect(document.activeElement).toBe(element))
}
