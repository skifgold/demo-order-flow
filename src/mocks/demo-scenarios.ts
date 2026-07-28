export type DemoScenario =
  | 'catalogue-delay'
  | 'catalogue-failure'
  | 'order-conflict'
  | 'order-server-failure'

type CatalogueScenario = 'delay' | 'failure' | undefined
type OrderScenario = 'conflict' | 'server-failure' | undefined

let nextCatalogueScenario: CatalogueScenario
let catalogueFailureAttemptsRemaining = 0
let nextOrderScenario: OrderScenario

export function scheduleDemoScenario(scenario: DemoScenario): void {
  switch (scenario) {
    case 'catalogue-delay':
      nextCatalogueScenario = 'delay'
      return
    case 'catalogue-failure':
      nextCatalogueScenario = 'failure'
      // The catalogue makes one automatic retry, so both attempts belong to one demo action.
      catalogueFailureAttemptsRemaining = 2
      return
    case 'order-conflict':
      nextOrderScenario = 'conflict'
      return
    case 'order-server-failure':
      nextOrderScenario = 'server-failure'
  }
}

export function consumeCatalogueScenario(): CatalogueScenario {
  if (nextCatalogueScenario === 'delay') {
    nextCatalogueScenario = undefined
    return 'delay'
  }

  if (nextCatalogueScenario !== 'failure') {
    return undefined
  }

  catalogueFailureAttemptsRemaining -= 1

  if (catalogueFailureAttemptsRemaining === 0) {
    nextCatalogueScenario = undefined
  }

  return 'failure'
}

export function consumeOrderScenario(): OrderScenario {
  const scenario = nextOrderScenario
  nextOrderScenario = undefined
  return scenario
}

export function resetDemoScenarios(): void {
  nextCatalogueScenario = undefined
  catalogueFailureAttemptsRemaining = 0
  nextOrderScenario = undefined
}
