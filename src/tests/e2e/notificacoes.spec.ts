import { test, expect } from '@playwright/test';

test.describe('Página de Notificações /novos pontos', () => {
  test('Lista de novos pontos de coleta é exibida', async ({ page }) => {
    await page.goto('/notificacoes');

    await expect(
      page.getByRole('heading', { name: /Novos Pontos de Coleta/i })
    ).toBeVisible();

    await expect(
      page.getByText(/estabelecimentos recém-cadastrados/i)
    ).toBeVisible();

    const cards = page.locator('main .grid > div');
    await expect(cards.first()).toBeVisible();

    await expect(page.getByText(/Supermercado VerdeVida/i)).toBeVisible();

    const screenshotPath = `tests/screenshots/notificacoes-page-${Date.now()}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
  });
});
