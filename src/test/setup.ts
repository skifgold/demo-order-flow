import { afterAll, afterEach, beforeAll } from 'vitest'

import { InMemoryStorage } from './in-memory-storage'
import { server } from './msw-server'
import { resetDemoScenarios } from '@/mocks/demo-scenarios'

if (window.localStorage === undefined) {
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: new InMemoryStorage(),
  })
}

if (window.matchMedia === undefined) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  })
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  resetDemoScenarios()
})
afterAll(() => server.close())
