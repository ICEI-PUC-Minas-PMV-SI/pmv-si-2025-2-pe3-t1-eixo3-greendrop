import { test, expect } from '@playwright/test';

test.describe('Seção de pontos de coleta na Home', () => {
  test('Seção de mapa e filtros aparecem corretamente', async ({ page }) => {
    await page.goto('/');

    const section = page.locator('section#mapa');
    await expect(section).toBeVisible();

    await expect(
      section.getByRole('heading', {
        name: /Encontre Pontos de Coleta Perto de Você/i,
      })
    ).toBeVisible();

    await expect(section.locator('#map-search')).toBeVisible();
    await expect(section.locator('#map-filter-material')).toBeVisible();
    await expect(section.locator('#map-open-now')).toBeVisible();
    await expect(section.locator('#locations-list')).toBeVisible();
    await expect(section.locator('#map')).toBeVisible();

    const screenshotPath = `tests/screenshots/pontos-coleta-${Date.now()}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
  });

  test('API /api/pontos retorna lista de locais', async ({ request }) => {
    const response = await request.get('/api/pontos');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
    expect(data.length).toBeGreaterThan(0);

    const first = data[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('name');
    expect(first).toHaveProperty('lat');
    expect(first).toHaveProperty('lng');
  });
});
