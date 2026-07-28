import type { OrderConfiguration } from '../order-configuration.types'

export { getSupportedGlazings } from './framing-rules'
export { normalizePrintConfiguration } from './print-configuration-normalizer'
export { isExpressEligible } from './shipping-rules'
export { getSupportedSizes } from './size-rules'

export function createEmptyOrderConfiguration(): OrderConfiguration {
  return {
    lines: {},
    shipping: 'standard',
    giftOptions: { message: '', hidePricesOnPackingSlip: false },
  }
}
