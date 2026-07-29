import type { Product } from '@/features/catalogue'

import { isAllowedConfigurationOption } from './configuration-option'
import type { PrintSize } from '../order-configuration.types'

const PRINT_SIZES: readonly PrintSize[] = ['A4', 'A3', 'A2']

export function isSupportedPrintSize(product: Product, size: unknown): size is PrintSize {
  return isAllowedConfigurationOption(PRINT_SIZES, size) && product.pricesBySize[size] !== undefined
}

export function getSupportedSizes(product: Product): PrintSize[] {
  return PRINT_SIZES.filter((size) => isSupportedPrintSize(product, size))
}
