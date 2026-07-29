import { expect, test, type Page } from '@playwright/test'

const productName = 'Modern Geometry No. 7'

async function expectPageToFitViewport(page: Page): Promise<void> {
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true)
}

async function waitForArtworkImages(page: Page): Promise<void> {
  const images = page
    .getByRole('list', { name: 'Available Artworks' })
    .getByRole('img', { name: /^Artwork:/ })

  for (let index = 0; index < (await images.count()); index += 1) {
    const image = images.nth(index)
    await image.scrollIntoViewIfNeeded()
    await expect
      .poll(() => image.evaluate((element) => element.complete && element.naturalWidth > 0))
      .toBe(true)
  }

  await page.evaluate(() => window.scrollTo(0, 0))
  await page.locator('body').hover({ position: { x: 1, y: 1 } })
}

async function selectOption(page: Page, name: string, option: string): Promise<void> {
  await page.getByRole('combobox', { name }).click()
  await page.getByRole('option', { name: option }).click()
}

async function openConfiguredCheckout(page: Page): Promise<void> {
  await page.goto('/')
  await expect(
    page.getByRole('list', { name: 'Available Artworks' }).getByRole('listitem'),
  ).toHaveCount(6)

  await page.getByRole('button', { name: `Add ${productName} to basket` }).click()
  await page.getByRole('button', { name: 'Checkout' }).click()
  await expect(page.getByRole('heading', { name: 'Configure your prints' })).toBeVisible()
}

async function configurePrintOnlyA4Matte(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Print only' }).click()
  await selectOption(page, 'Choose size', 'A4 (21.0 × 29.7 cm)')
  await selectOption(page, 'Choose paper finish', 'Matte Fine Art')
  await page.getByTestId('continue-to-details').click()
  await expect(page.getByRole('heading', { name: 'Your details' })).toBeVisible()
}

async function fillCustomerDetails(page: Page): Promise<void> {
  await page.getByRole('textbox', { name: 'Full name' }).fill('Maya Chen')
  await page.getByRole('textbox', { name: 'Email address' }).fill('maya@example.com')
  await page.getByRole('textbox', { name: 'Address', exact: true }).fill('1 Market Street')
  await page.getByRole('textbox', { name: 'City' }).fill('London')
  await page.getByRole('textbox', { name: 'Postcode' }).fill('E1 6AN')
  await page.getByRole('checkbox', { name: 'I agree to the terms and' }).check()
}

test('shows the six available Artworks at the catalogue route', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Artwork catalogue' })).toBeVisible()
  await expect(
    page.getByRole('list', { name: 'Available Artworks' }).getByRole('listitem'),
  ).toHaveCount(6)
  await expect(page.getByRole('complementary', { name: 'Demo controls' })).toHaveCount(0)
  await waitForArtworkImages(page)
  await expect(page).toHaveScreenshot('catalogue.png', {
    animations: 'disabled',
    fullPage: true,
  })
})

test('completes the happy path without console errors or viewport overflow', async ({ page }) => {
  const consoleProblems: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      consoleProblems.push(`${message.type()}: ${message.text()}`)
    }
  })
  page.on('pageerror', (error) => consoleProblems.push(`pageerror: ${error.message}`))

  await openConfiguredCheckout(page)
  await expectPageToFitViewport(page)
  await configurePrintOnlyA4Matte(page)
  await expectPageToFitViewport(page)
  await fillCustomerDetails(page)
  await page.getByTestId('submit-order').click()

  await expect(page.getByRole('heading', { name: 'Thank you for your order' })).toBeVisible()
  await expect(page.getByText('ORD-2026-1001')).toBeVisible()
  await expectPageToFitViewport(page)
  expect(consoleProblems).toEqual([])
})

test('moves focus to validation feedback as configuration errors become more specific', async ({
  page,
}) => {
  await openConfiguredCheckout(page)
  await page.getByTestId('continue-to-details').click()

  const errorSummary = page.getByRole('alert', { name: 'Configuration errors' })
  await expect(errorSummary).toBeFocused()

  await page.getByRole('button', { name: 'Print only' }).click()
  await selectOption(page, 'Choose size', 'A4 (21.0 × 29.7 cm)')
  await page.getByTestId('continue-to-details').click()

  const finish = page.getByRole('combobox', { name: 'Choose paper finish' })
  await expect(finish).toBeFocused()
  await expectPageToFitViewport(page)
})

test('keeps keyboard focus on the quantity control after adding an Artwork', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('list', { name: 'Available Artworks' }).getByRole('listitem'),
  ).toHaveCount(6)

  await page.keyboard.press('Tab')

  const addToBasket = page.getByRole('button', { name: `Add ${productName} to basket` })
  await expect(addToBasket).toBeFocused()
  await expect(addToBasket).toHaveCSS('outline-style', 'solid')

  await page.keyboard.press('Enter')
  await expect(
    page.getByRole('button', { name: `Decrease quantity of ${productName}` }),
  ).toBeFocused()
})

test('keeps the catalogue usable while a reviewer-triggered refresh is loading', async ({
  page,
}) => {
  await page.goto('/?demo=true')
  await expect(
    page.getByRole('list', { name: 'Available Artworks' }).getByRole('listitem'),
  ).toHaveCount(6)

  await page.getByRole('button', { name: 'Reviewer scenarios' }).click()
  await page.getByRole('button', { name: 'Delay catalogue' }).click()

  await expect(page.getByText('Refreshing availability…')).toBeVisible()
  await expect(
    page.getByRole('list', { name: 'Available Artworks' }).getByRole('listitem'),
  ).toHaveCount(6)
  await page.getByRole('button', { name: `Add ${productName} to basket` }).click()
  await expect(page.getByLabel(`${productName} quantity`)).toHaveText('1')
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
  await page.getByRole('button', { name: `Add ${productName} to basket` }).click()
  await page.getByRole('button', { name: 'Checkout' }).click()

  await configurePrintOnlyA4Matte(page)

  await fillCustomerDetails(page)
  await page.getByTestId('submit-order').click()

  const conflictBanner = page.locator('.submission-recovery')
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

  await expect(page.getByText('Catalogue failure triggered')).toBeVisible()

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

test('shows the catalogue refresh indicator during the reviewer delay scenario', async ({
  page,
}) => {
  await page.goto('/?demo=true')
  await expect(
    page.getByRole('list', { name: 'Available Artworks' }).getByRole('listitem'),
  ).toHaveCount(6)

  await page.getByRole('button', { name: 'Reviewer scenarios' }).click()
  await page.getByRole('button', { name: 'Delay catalogue' }).click()

  const refreshStatus = page.getByText('Refreshing availability…')
  await expect(refreshStatus).toBeVisible()
  await expect(page.getByText('Catalogue refresh started')).toHaveCount(0)
  await expect(refreshStatus).toBeHidden({ timeout: 7000 })
})
