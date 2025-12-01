import { test, expect } from "@playwright/test"

test.describe("Mapa fullscreen /mapa", () => {
  test("Mapa fullscreen carrega e alterna entre 2D e 3D", async ({ page }) => {
    test.setTimeout(90000)

    await page.goto("/mapa")

    const mapsSection = page.locator("#maps")
    await expect(mapsSection).toBeVisible()

    const map2D = page.locator("#map-leaflet")
    const map3D = page.locator("#map-maplibre")

    await expect(map2D).toBeVisible({ timeout: 30000 })

    await expect(map3D).not.toHaveClass(/is-visible/)

    const btn2D = page.locator('button[data-view="leaflet"]')
    const btn3D = page.locator('button[data-view="maplibre"]')

    await expect(btn2D).toBeVisible()
    await expect(btn3D).toBeVisible()

    await btn3D.click()
    await expect(map3D).toHaveClass(/is-visible/, { timeout: 10000 })

    await btn2D.click()
    await expect(map2D).toHaveClass(/is-visible/, { timeout: 10000 })

    const screenshotPath = `tests/screenshots/mapa-3d-${Date.now()}.png`
    await page.screenshot({ path: screenshotPath, fullPage: true })
  })
})
