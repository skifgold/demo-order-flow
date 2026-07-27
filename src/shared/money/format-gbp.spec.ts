import { describe, expect, it } from 'vitest'

import { formatGbp } from './format-gbp'

describe('formatGbp', () => {
  it.each([
    [0, '£0'],
    [3500, '£35'],
    [695, '£6.95'],
    [123456, '£1,234.56'],
  ])('formats %i minor units as %s', (amount, formattedAmount) => {
    expect(formatGbp(amount)).toBe(formattedAmount)
  })
})
