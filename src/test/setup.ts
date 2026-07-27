import { afterAll, afterEach, beforeAll } from 'vitest'

import { InMemoryStorage } from './in-memory-storage'
import { server } from './msw-server'

if (window.localStorage === undefined) {
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: new InMemoryStorage(),
  })
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
