import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import { definePreset } from '@primeuix/themes'
import { VueQueryPlugin } from '@tanstack/vue-query'

import App from './app/App.vue'
import { queryClient } from './app/query-client/queryClient'
import router from './app/router'
import './app/styles/theme.css'

const OrderFlowTheme = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#faf6f0',
      100: '#f1e7db',
      200: '#dfcbb7',
      300: '#c6a485',
      400: '#a87a58',
      500: '#865c40',
      600: '#6b4935',
      700: '#563927',
      800: '#422a1d',
      900: '#2e1d14',
      950: '#1c100a',
    },
  },
})

async function startApplication() {
  if (import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser')
    await worker.start({ onUnhandledRequest: 'bypass' })
  }

  const app = createApp(App)

  app.use(createPinia())
  app.use(router)
  app.use(VueQueryPlugin, { queryClient })
  app.use(PrimeVue, {
    theme: {
      preset: OrderFlowTheme,
      options: {
        darkModeSelector: false,
      },
    },
  })

  app.mount('#app')
}

void startApplication()
