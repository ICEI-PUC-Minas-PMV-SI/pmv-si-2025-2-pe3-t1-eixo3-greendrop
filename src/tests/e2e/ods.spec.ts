import { test, expect } from "@playwright/test"

test.describe("Página ODS ONU", () => {
  test("Página /ods carrega conteúdo principal", async ({ page }) => {
    await page.goto("/ods")

    await expect(page.getByRole("heading", { name: /Metas da ONU/i })).toBeVisible()

    await expect(page.getByRole("heading", { name: /Conexão com os ODS/i })).toBeVisible()

    await expect(page.getByText(/ODS 11/i)).toBeVisible()

    const screenshotPath = `tests/screenshots/ods-page-${Date.now()}.png`
    await page.screenshot({ path: screenshotPath, fullPage: true })
  })
})
