import { expect, test } from '@playwright/test'

test('shows the six available Artworks at the catalogue route', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Artwork catalogue' })).toBeVisible()
  await expect(
    page.getByRole('list', { name: 'Available Artworks' }).getByRole('listitem'),
  ).toHaveCount(6)
  await expect(page.getByRole('complementary', { name: 'Demo controls' })).toHaveCount(0)
})

test('recovers from a reviewer-triggered Order Conflict without losing checkout input', async ({
  page,
}) => {
  await page.goto('/?demo=true')
  await expect(
    page.getByRole('list', { name: 'Available Artworks' }).getByRole('listitem'),
  ).toHaveCount(6)

  await page.getByRole('button', { name: 'Reviewer scenarios' }).click()
  await page.getByRole('button', { name: 'Order conflict' }).click()
  await page.getByRole('button', { name: 'Add Modern Geometry No. 7 to basket' }).click()
  await page.getByRole('button', { name: 'Checkout' }).click()

  await page.getByRole('button', { name: 'Print only' }).click()
  await page.getByRole('combobox', { name: 'Choose size' }).click()
  await page.getByRole('option', { name: 'A4 (21.0 × 29.7 cm)' }).click()
  await page.getByRole('combobox', { name: 'Choose paper finish' }).click()
  await page.getByRole('option', { name: 'Matte Fine Art' }).click()
  await page.getByTestId('continue-to-details').click()

  await page.getByRole('textbox', { name: 'Full name' }).fill('Maya Chen')
  await page.getByRole('textbox', { name: 'Email address' }).fill('maya@example.com')
  await page.getByRole('textbox', { name: 'Address', exact: true }).fill('1 Market Street')
  await page.getByRole('textbox', { name: 'City' }).fill('London')
  await page.getByRole('textbox', { name: 'Postcode' }).fill('E1 6AN')
  await page.getByRole('checkbox', { name: 'I agree to the terms and' }).check()
  await page.getByTestId('submit-order').click()

  const conflictBanner = page.getByRole('alert')
  await expect(conflictBanner).toContainText('An item in your basket changed')
  await expect(conflictBanner).toBeFocused()
  await expect(page.getByTestId('submit-order')).toBeDisabled()
  await expect(page.getByRole('textbox', { name: 'Full name' })).toHaveValue('Maya Chen')

  await conflictBanner.getByRole('button', { name: 'Review basket' }).click()
  await expect(page).toHaveURL('/')
  await expect(page.getByRole('heading', { name: 'Artwork catalogue' })).toBeVisible()
})

test('uses the reviewer catalogue-failure scenario without reloading the page', async ({
  page,
}) => {
  await page.goto('/?demo=true')
  await expect(
    page.getByRole('list', { name: 'Available Artworks' }).getByRole('listitem'),
  ).toHaveCount(6)

  await page.getByRole('button', { name: 'Reviewer scenarios' }).click()
  await page.getByRole('button', { name: 'Fail catalogue' }).click()

  const refreshWarning = page.getByText('Couldn’t update the catalogue')
  await expect(refreshWarning).toBeVisible()
  await expect(
    page.getByRole('list', { name: 'Available Artworks' }).getByRole('listitem'),
  ).toHaveCount(6)

  await page
    .getByRole('list', { name: 'Available Artworks' })
    .getByRole('listitem')
    .last()
    .scrollIntoViewIfNeeded()
  await expect(refreshWarning).toBeInViewport()
  await expect(page.getByRole('button', { name: 'Try again' })).toBeInViewport()

  await page.getByRole('button', { name: 'Try again' }).click()
  await expect(refreshWarning).toBeHidden()
})
