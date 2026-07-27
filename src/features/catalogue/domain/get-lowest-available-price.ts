export function getLowestAvailablePrice(
  pricesBySize: Readonly<Record<string, number | undefined>>,
): number {
  const prices = Object.values(pricesBySize).filter((price): price is number => price !== undefined)

  return Math.min(...prices)
}
