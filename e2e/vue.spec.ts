import { expect, test } from '@playwright/test'

test('shows the six available Artworks at the catalogue route', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Artwork catalogue' })).toBeVisible()
  await expect(
    page.getByRole('list', { name: 'Available Artworks' }).getByRole('listitem'),
  ).toHaveCount(6)
})
