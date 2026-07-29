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
  items: Record<string, PrintConfiguration>
  shipping: ShippingMethod
  giftOptions: GiftOptions
}

export type ConfigurationIssue = {
  field: string
  message: string
}

export type OrderSummaryItem = {
  productId: string
  quantity: number
  unitPrice?: number
  itemTotal?: number
}

export type OrderSummary = {
  items: OrderSummaryItem[]
  subtotal: number
  shippingCost: number
  total: number
}

export type CustomerDetails = {
  fullName: string
  email: string
  phone: string
  addressLine1: string
  city: string
  postcode: string
  termsAccepted: boolean
}

export type OrderPayload = Readonly<{
  items: readonly Readonly<{
    productId: string
    quantity: number
    configuration: Readonly<CompletePrintConfiguration>
    unitPrice: number
    itemTotal: number
  }>[]
  shipping: ShippingMethod
  giftOptions: Readonly<GiftOptions>
  customer: Readonly<{
    fullName: string
    email: string
    phone?: string
  }>
  deliveryAddress: Readonly<{
    addressLine1: string
    city: string
    postcode: string
  }>
  termsAccepted: true
  totals: Readonly<{
    subtotal: number
    shippingCost: number
    total: number
  }>
}>
