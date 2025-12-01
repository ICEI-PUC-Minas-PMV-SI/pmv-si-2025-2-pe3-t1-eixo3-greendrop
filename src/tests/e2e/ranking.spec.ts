import { test, expect } from "@playwright/test"

test.describe("Página de Ranking e APIs relacionadas", () => {
  test("Página /ranking mostra seções principais", async ({ page }) => {
    await page.goto("/ranking")

    await expect(page.getByRole("heading", { name: /Ranking de Reciclagem/i })).toBeVisible()

    await expect(page.getByRole("heading", { name: /Diretrizes de Reciclagem/i })).toBeVisible()

    const diretrizesGrid = page.locator("#diretrizes-content .grid > div").first()
    await expect(diretrizesGrid).toBeVisible()

    await page.click('[data-tab="ranking"]')
    await expect(page.locator("#ranking-content")).toBeVisible()
    await expect(page.getByRole("heading", { name: /Ranking de Empresas/i })).toBeVisible()

    await page.click('[data-tab="recompensas"]')
    await expect(page.locator("#recompensas-content")).toBeVisible()
    await expect(page.getByRole("heading", { name: /Área de Recompensas/i })).toBeVisible()

    const screenshotPath = `tests/screenshots/ranking-page-${Date.now()}.png`
    await page.screenshot({ path: screenshotPath, fullPage: true })
  })

  test("APIs de ranking retornam dados consistentes", async ({ request }) => {
    const respDiretrizes = await request.get("/api/ranking/diretrizes")
    expect(respDiretrizes.ok()).toBeTruthy()
    const diretrizes = await respDiretrizes.json()
    expect(Array.isArray(diretrizes)).toBeTruthy()
    expect(diretrizes.length).toBeGreaterThan(0)
    expect(diretrizes[0]).toHaveProperty("material")
    expect(diretrizes[0]).toHaveProperty("pontos")

    const respEmpresas = await request.get("/api/ranking/empresas")
    expect(respEmpresas.ok()).toBeTruthy()
    const empresas = await respEmpresas.json()
    expect(Array.isArray(empresas)).toBeTruthy()
    expect(empresas.length).toBeGreaterThan(0)
    expect(empresas[0]).toHaveProperty("empresa")
    expect(empresas[0]).toHaveProperty("pontos")
    expect(empresas[0]).toHaveProperty("materiaisReciclados")

    const respPremios = await request.get("/api/ranking/premios")
    expect(respPremios.ok()).toBeTruthy()
    const premios = await respPremios.json()
    expect(Array.isArray(premios)).toBeTruthy()
    expect(premios.length).toBeGreaterThan(0)
    expect(premios[0]).toHaveProperty("nome")
    expect(premios[0]).toHaveProperty("pontosNecessarios")
  })
})
