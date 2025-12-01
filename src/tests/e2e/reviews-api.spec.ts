import { test, expect } from '@playwright/test';

test.describe('APIs de avaliações', () => {
  test('GET /api/reviews/ponto/:id retorna array (mesmo que vazio)', async ({ request }) => {
    const response = await request.get('/api/reviews/ponto/5');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('GET /api/reviews/media/:id retorna objeto com média e total', async ({ request }) => {
    const response = await request.get('/api/reviews/media/5');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty('media');
    expect(data).toHaveProperty('total');
    expect(typeof data.media).toBe('number');
    expect(typeof data.total).toBe('number');
  });

  test('POST /api/reviews sem autenticação redireciona para /login', async ({ request }) => {
    const response = await request.post('/api/reviews', {
      data: { pontoColetaId: 5, nota: 5, comentario: 'Teste' },
      maxRedirects: 0,
    });

    expect([301, 302, 303]).toContain(response.status());
    const location = response.headers()['location'] || response.headers()['Location'];
    expect(location).toContain('/login');
  });
});
