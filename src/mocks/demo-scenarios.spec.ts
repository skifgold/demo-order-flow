import { describe, expect, it } from 'vitest'

import {
  consumeCatalogueScenario,
  consumeOrderScenario,
  resetDemoScenarios,
  scheduleDemoScenario,
} from './demo-scenarios'

describe('demo scenarios', () => {
  it('returns to normal catalogue behavior after one failure scenario and its automatic retry', () => {
    scheduleDemoScenario('catalogue-failure')

    expect(consumeCatalogueScenario()).toBe('failure')
    expect(consumeCatalogueScenario()).toBe('failure')
    expect(consumeCatalogueScenario()).toBeUndefined()
  })

  it('consumes an order scenario once', () => {
    scheduleDemoScenario('order-conflict')

    expect(consumeOrderScenario()).toBe('conflict')
    expect(consumeOrderScenario()).toBeUndefined()
  })

  it('resets a prepared scenario explicitly', () => {
    scheduleDemoScenario('catalogue-delay')
    resetDemoScenarios()

    expect(consumeCatalogueScenario()).toBeUndefined()
  })
})
