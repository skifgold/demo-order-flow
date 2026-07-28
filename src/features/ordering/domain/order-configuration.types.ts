export type PrintSize = 'A4' | 'A3' | 'A2'
export type Presentation = 'print-only' | 'framed'
export type PaperFinish = 'matte' | 'lustre'
export type FrameStyle = 'black' | 'white' | 'natural-oak'
export type Glazing = 'glass' | 'acrylic'
export type ShippingMethod = 'standard' | 'express'

export type PrintConfiguration = {
  presentation?: Presentation
  size?: PrintSize
  finish?: PaperFinish
  frame?: FrameStyle
  glazing?: Glazing
}

export type CompletePrintConfiguration =
  | {
      presentation: 'print-only'
      size: PrintSize
      finish: PaperFinish
      frame?: undefined
      glazing?: undefined
    }
  | {
      presentation: 'framed'
      size: PrintSize
      finish: PaperFinish
      frame: FrameStyle
      glazing: Glazing
    }

export type GiftOptions = {
  message: string
  hidePricesOnPackingSlip: boolean
}

export type OrderConfiguration = {
  lines: Record<string, PrintConfiguration>
  shipping: ShippingMethod
  giftOptions: GiftOptions
}

export type ConfigurationIssue = {
  field: string
  message: string
}

export type OrderSummaryLine = {
  productId: string
  quantity: number
  unitPrice?: number
  lineTotal?: number
}

export type OrderSummary = {
  lines: OrderSummaryLine[]
  subtotal: number
  shippingCost: number
  total: number
}

export type OrderPayload = Readonly<{
  lines: readonly Readonly<{
    productId: string
    quantity: number
    configuration: Readonly<CompletePrintConfiguration>
    unitPrice: number
    lineTotal: number
  }>[]
  shipping: ShippingMethod
  giftOptions: Readonly<GiftOptions>
  totals: Readonly<{
    subtotal: number
    shippingCost: number
    total: number
  }>
}>
