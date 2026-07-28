import type { CompletePrintConfiguration, PrintConfiguration } from '../order-configuration.types'

export function isExpressEligible(
  configurations: readonly (CompletePrintConfiguration | PrintConfiguration | undefined)[],
): boolean {
  return (
    configurations.length > 0 &&
    configurations.every(
      (configuration) =>
        configuration?.presentation === 'print-only' &&
        (configuration.size === 'A4' || configuration.size === 'A3') &&
        configuration.finish !== undefined,
    )
  )
}
