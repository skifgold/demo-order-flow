import { definePreset } from '@primeuix/themes'
import type { QueryClient } from '@tanstack/vue-query'
import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'

import { productKeys } from '@/features/catalogue'

export async function mountReviewerDemoControls({
  queryClient,
  theme,
}: {
  queryClient: QueryClient
  theme: ReturnType<typeof definePreset>
}): Promise<void> {
  if (!isReviewerDemoEnabled()) {
    return
  }

  const { default: DemoControls } = await import('@/mocks/DemoControls.vue')
  const target = createDemoControlsTarget()
  const demoApp = createApp(DemoControls, {
    refreshCatalogue: () => void queryClient.refetchQueries({ queryKey: productKeys.all }),
  })

  demoApp.use(ToastService)
  demoApp.use(PrimeVue, {
    theme: {
      preset: theme,
      options: { darkModeSelector: false },
    },
  })
  demoApp.mount(target)
}

function isReviewerDemoEnabled(): boolean {
  return import.meta.env.DEV && new URLSearchParams(window.location.search).get('demo') === 'true'
}

function createDemoControlsTarget(): HTMLDivElement {
  const target = document.createElement('div')
  target.id = 'demo-controls'
  document.body.append(target)

  return target
}
