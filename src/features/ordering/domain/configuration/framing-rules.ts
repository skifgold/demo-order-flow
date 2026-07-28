import { isAllowedConfigurationOption } from './configuration-option'
import type { FrameStyle, Glazing, PrintConfiguration } from '../order-configuration.types'

const FRAME_STYLES: readonly FrameStyle[] = ['black', 'white', 'natural-oak']
const GLAZINGS: readonly Glazing[] = ['glass', 'acrylic']

export function isAllowedFrameStyle(value: unknown): value is FrameStyle {
  return isAllowedConfigurationOption(FRAME_STYLES, value)
}

export function getSupportedGlazings(
  configuration: Pick<PrintConfiguration, 'presentation' | 'size'>,
): Glazing[] {
  if (configuration.presentation !== 'framed') {
    return []
  }

  return configuration.size === 'A2' ? ['acrylic'] : [...GLAZINGS]
}

export function isSupportedGlazing(
  configuration: Pick<PrintConfiguration, 'presentation' | 'size'>,
  glazing: unknown,
): glazing is Glazing {
  return (
    isAllowedConfigurationOption(GLAZINGS, glazing) &&
    getSupportedGlazings(configuration).includes(glazing)
  )
}
