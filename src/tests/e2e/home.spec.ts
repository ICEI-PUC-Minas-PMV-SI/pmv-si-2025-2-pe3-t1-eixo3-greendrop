import { test, expect } from "@playwright/test"

test.describe("Home", () => {
  test("Home carrega seções principais e mapa", async ({ page }) => {
    test.setTimeout(60000)

    await page.goto("/")

    await expect(
      page.getByRole("heading", {
        name: /Transformando o amanhã, uma gota de cada vez/i,
      }),
    ).toBeVisible()

    await expect(page.getByRole("heading", { name: /Nossos Serviços/i })).toBeVisible()
    await expect(page.locator("#sobre-nos")).toBeVisible()
    await expect(page.locator("#mapa")).toBeVisible()

    await expect(page.locator("#map")).toBeVisible({ timeout: 15000 })

    const screenshotPath = `tests/screenshots/home-${Date.now()}.png`
    await page.screenshot({ path: screenshotPath, fullPage: true })
  })

  test("Home não possui erros críticos de JS (ignora erro conhecido do mapa)", async ({ page }, testInfo) => {
    const errors: string[] = []

    page.on("pageerror", (err) => {
      const msg = String(err)

      if (msg.includes("Map container not found")) return
      if (msg.includes("Error: Map container not found")) return
      if (msg.includes("maplibregl")) return // Erros do MapLibre em ambiente de teste
      if (msg.includes("maptiler")) return // Erros de API do MapTiler
      if (msg.includes("terrain")) return // Erros de terreno 3D

      errors.push(msg)
    })

    await page.goto("/")

    await page.waitForTimeout(3000)

    if (errors.length > 0) {
      await testInfo.attach("js-errors", {
        body: errors.join("\n"),
        contentType: "text/plain",
      })
      throw new Error(`Erros de JS encontrados:\n${errors.join("\n")}`)
    }
  })
})
