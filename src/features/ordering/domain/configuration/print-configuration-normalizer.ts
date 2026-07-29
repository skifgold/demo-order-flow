import type { Product } from '@/features/catalogue/api/product.contract'

import { isAllowedConfigurationOption } from './configuration-option'
import { isAllowedFrameStyle, isSupportedGlazing } from './framing-rules'
import { isSupportedPrintSize } from './size-rules'
import type { PaperFinish, Presentation, PrintConfiguration } from '../order-configuration.types'

const PRESENTATIONS: readonly Presentation[] = ['print-only', 'framed']
const PAPER_FINISHES: readonly PaperFinish[] = ['matte', 'lustre']

export function normalizePrintConfiguration({
  product,
  configuration,
}: {
  product: Product
  configuration: PrintConfiguration
}): PrintConfiguration {
  const presentation = isAllowedConfigurationOption(PRESENTATIONS, configuration.presentation)
    ? configuration.presentation
    : undefined

  const size = isSupportedPrintSize(product, configuration.size) ? configuration.size : undefined

  const finish = isAllowedConfigurationOption(PAPER_FINISHES, configuration.finish)
    ? configuration.finish
    : undefined

  if (presentation !== 'framed') {
    return { presentation, size, finish }
  }

  const frame = isAllowedFrameStyle(configuration.frame) ? configuration.frame : undefined

  const glazing = isSupportedGlazing({ presentation, size }, configuration.glazing)
    ? configuration.glazing
    : undefined

  return { presentation, size, finish, frame, glazing }
}
