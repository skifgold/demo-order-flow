const gbpFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

export function formatGbp(amountInMinorUnits: number): string {
  return gbpFormatter.format(amountInMinorUnits / 100)
}
