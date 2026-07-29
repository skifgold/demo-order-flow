import { expect, test } from '@playwright/test'

const productName = 'Modern Geometry No. 7'

test('configures a print with keyboard controls', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('list', { name: 'Available Artworks' }).getByRole('listitem'),
  ).toHaveCount(6)

  await page.getByRole('button', { name: `Add ${productName} to basket` }).click()
  await page.getByRole('button', { name: 'Checkout' }).click()

  const presentation = page.getByRole('button', { name: 'Print only' })
  await presentation.focus()
  await page.keyboard.press('Space')
  await expect(presentation).toHaveAttribute('aria-pressed', 'true')

  const size = page.getByRole('combobox', { name: 'Choose size' })
  await size.focus()
  await page.keyboard.press('Space')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect(page.getByRole('combobox', { name: 'A4 (21.0 × 29.7 cm)' })).toBeVisible()

  const finish = page.getByRole('combobox', { name: 'Choose paper finish' })
  await finish.focus()
  await page.keyboard.press('Space')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect(page.getByRole('combobox', { name: 'Matte Fine Art' })).toBeVisible()

  await page.getByTestId('continue-to-details').press('Space')
  await expect(page.getByRole('heading', { name: 'Your details' })).toBeVisible()
})
