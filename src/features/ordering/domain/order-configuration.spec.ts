import { describe, expect, it } from 'vitest'

import type { BasketLine } from '@/features/basket'
import { catalogueProducts } from '@/mocks/catalogue.data'

import {
  calculateOrderSummary,
  createEmptyOrderConfiguration,
  createOrderPayload,
  isExpressEligible,
  normalizePrintConfiguration,
  reconcileOrderConfiguration,
  validateOrderConfiguration,
} from './order-configuration'

const framedA3 = {
  presentation: 'framed' as const,
  size: 'A3' as const,
  finish: 'lustre' as const,
  frame: 'natural-oak' as const,
  glazing: 'acrylic' as const,
}

describe('order configuration', () => {
  it.each([
    [{ presentation: 'print-only', size: 'A4', finish: 'matte' }, 3500],
    [{ presentation: 'print-only', size: 'A4', finish: 'lustre' }, 4000],
    [
      { presentation: 'framed', size: 'A4', finish: 'matte', frame: 'black', glazing: 'glass' },
      7500,
    ],
    [
      { presentation: 'framed', size: 'A4', finish: 'matte', frame: 'white', glazing: 'glass' },
      7500,
    ],
    [
      {
        presentation: 'framed',
        size: 'A4',
        finish: 'matte',
        frame: 'natural-oak',
        glazing: 'glass',
      },
      8500,
    ],
    [
      { presentation: 'framed', size: 'A4', finish: 'matte', frame: 'black', glazing: 'acrylic' },
      8300,
    ],
    [
      { presentation: 'framed', size: 'A3', finish: 'matte', frame: 'black', glazing: 'glass' },
      11000,
    ],
    [
      { presentation: 'framed', size: 'A2', finish: 'matte', frame: 'black', glazing: 'acrylic' },
      16800,
    ],
  ] as const)('applies the correct pricing modifier for %o', (lineConfiguration, unitPrice) => {
    const product = catalogueProducts[0]!
    const summary = calculateOrderSummary({
      products: [product],
      basketLines: [{ productId: product.id, quantity: 1 }],
      configuration: {
        lines: { [product.id]: lineConfiguration },
        shipping: 'standard',
        giftOptions: { message: '', hidePricesOnPackingSlip: false },
      },
    })

    expect(summary.lines[0]!.unitPrice).toBe(unitPrice)
    expect(summary.shippingCost).toBe(695)
  })

  it('calculates every print and delivery modifier in integer minor units', () => {
    const product = catalogueProducts[0]!
    const summary = calculateOrderSummary({
      products: [product],
      basketLines: [{ productId: product.id, quantity: 2 }],
      configuration: {
        lines: { [product.id]: framedA3 },
        shipping: 'express',
        giftOptions: { message: '', hidePricesOnPackingSlip: false },
      },
    })

    // £55 base + £5 lustre + £55 A3 frame + £10 oak + £8 acrylic, twice, plus Express £12.95.
    expect(summary).toMatchObject({
      subtotal: 26600,
      shippingCost: 1295,
      total: 27895,
      lines: [{ productId: product.id, unitPrice: 13300, lineTotal: 26600 }],
    })
  })

  it('allows Acrylic only for an A2 framed print and clears incompatible dependent values', () => {
    const product = catalogueProducts[0]!

    expect(
      normalizePrintConfiguration({
        product,
        configuration: { ...framedA3, size: 'A2', glazing: 'glass' },
      }),
    ).toEqual({ ...framedA3, size: 'A2', glazing: undefined })
    expect(
      normalizePrintConfiguration({
        product,
        configuration: { ...framedA3, size: 'A2', glazing: 'acrylic' },
      }),
    ).toEqual({ ...framedA3, size: 'A2', glazing: 'acrylic' })

    expect(
      normalizePrintConfiguration({
        product,
        configuration: { ...framedA3, presentation: 'print-only' },
      }),
    ).toEqual({ presentation: 'print-only', size: 'A3', finish: 'lustre' })
  })

  it('limits Express to fully configured Print-only A4 or A3 lines', () => {
    const product = catalogueProducts[0]!

    expect(isExpressEligible([{ presentation: 'print-only', size: 'A4', finish: 'matte' }])).toBe(
      true,
    )
    expect(isExpressEligible([{ presentation: 'print-only', size: 'A2', finish: 'matte' }])).toBe(
      false,
    )
    expect(isExpressEligible([{ ...framedA3 }])).toBe(false)
    expect(isExpressEligible([])).toBe(false)

    const configuration = createEmptyOrderConfiguration()
    configuration.shipping = 'express'
    configuration.lines[product.id] = { presentation: 'print-only', size: 'A2', finish: 'matte' }

    expect(
      validateOrderConfiguration({
        products: [product],
        basketLines: [{ productId: product.id, quantity: 1 }],
        configuration,
      }).issues,
    ).toContainEqual({
      field: 'shipping',
      message: 'Express shipping is not available for this order.',
    })
  })

  it('reports each missing required configuration choice with a stable field key', () => {
    const product = catalogueProducts[0]!
    const validation = validateOrderConfiguration({
      products: [product],
      basketLines: [{ productId: product.id, quantity: 1 }],
      configuration: createEmptyOrderConfiguration(),
    })

    expect(validation.issues).toEqual([
      { field: `lines.${product.id}.presentation`, message: 'Choose a presentation.' },
      { field: `lines.${product.id}.size`, message: 'Choose a size.' },
      { field: `lines.${product.id}.finish`, message: 'Choose a paper finish.' },
    ])
  })

  it('keeps Gift Options out of the valid range and reports the dedicated field', () => {
    const product = catalogueProducts[0]!
    const validation = validateOrderConfiguration({
      products: [product],
      basketLines: [{ productId: product.id, quantity: 1 }],
      configuration: {
        lines: { [product.id]: { presentation: 'print-only', size: 'A4', finish: 'matte' } },
        shipping: 'standard',
        giftOptions: { message: 'x'.repeat(201), hidePricesOnPackingSlip: true },
      },
    })

    expect(validation.issues).toEqual([
      { field: 'giftOptions.message', message: 'Gift message must be 200 characters or fewer.' },
    ])
  })

  it('reconciles changed Basket Lines while keeping unchanged valid configurations', () => {
    const [firstProduct, secondProduct] = catalogueProducts
    const basketLines: BasketLine[] = [
      { productId: firstProduct!.id, quantity: 3 },
      { productId: secondProduct!.id, quantity: 1 },
    ]
    const reconciled = reconcileOrderConfiguration({
      products: [firstProduct!, secondProduct!],
      basketLines,
      configuration: {
        lines: {
          [firstProduct!.id]: { presentation: 'print-only', size: 'A4', finish: 'matte' },
          removed: framedA3,
        },
        shipping: 'standard',
        giftOptions: { message: '', hidePricesOnPackingSlip: false },
      },
    })

    expect(reconciled.lines).toEqual({
      [firstProduct!.id]: { presentation: 'print-only', size: 'A4', finish: 'matte' },
      [secondProduct!.id]: {},
    })
  })

  it('creates a payload from a valid Basket and configuration snapshot', () => {
    const product = catalogueProducts[0]!
    const basketLines = [{ productId: product.id, quantity: 1 }]
    const configuration = {
      lines: {
        [product.id]: {
          presentation: 'print-only' as const,
          size: 'A4' as const,
          finish: 'matte' as const,
        },
      },
      shipping: 'standard' as const,
      giftOptions: { message: 'For Maya', hidePricesOnPackingSlip: true },
    }
    const payload = createOrderPayload({ products: [product], basketLines, configuration })

    expect(payload).toMatchObject({
      lines: [{ productId: product.id, quantity: 1, unitPrice: 3500 }],
      shipping: 'standard',
      totals: { subtotal: 3500, shippingCost: 695, total: 4195 },
    })
  })
})
