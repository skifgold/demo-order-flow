import { expect, test, type Locator, type Page } from '@playwright/test'

const productName = 'Modern Geometry No. 7'

async function chooseFirstSelectOptionWithKeyboard(page: Page, select: Locator) {
  const listboxId = await select.getAttribute('aria-controls')

  if (listboxId === null) {
    throw new Error('The select control does not reference its listbox.')
  }

  await select.focus()
  await page.keyboard.press('Space')
  await expect(page.locator(`#${listboxId}`)).toBeVisible()
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
}

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

  const size = page.locator('#configuration-items-modern-geometry-07-size')
  await chooseFirstSelectOptionWithKeyboard(page, size)
  await expect(size).not.toHaveText('Choose size')

  const finish = page.locator('#configuration-items-modern-geometry-07-finish')
  await chooseFirstSelectOptionWithKeyboard(page, finish)
  await expect(finish).toHaveText('Matte Fine Art')

  await page.getByTestId('continue-to-details').press('Space')
  await expect(page.getByRole('heading', { name: 'Your details' })).toBeVisible()
})
