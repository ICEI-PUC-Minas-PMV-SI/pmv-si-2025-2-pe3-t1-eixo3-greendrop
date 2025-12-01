import { test, expect } from "@playwright/test"

test.describe("Página Educativo", () => {
  test("Página /educativo carrega conteúdo principal", async ({ page }) => {
    await page.goto("/educativo")

    await expect(
      page.getByRole("heading", { name: /Seu Descarte, Nosso Impacto/i })
    ).toBeVisible()

    await expect(
      page.getByRole("heading", { name: /Guia de Reciclagem do Planeta/i })
    ).toBeVisible()

    const screenshotPath = `tests/screenshots/educativo-${Date.now()}.png`
    await page.screenshot({ path: screenshotPath, fullPage: true })
  })
})
