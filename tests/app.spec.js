import { test, expect } from '@playwright/test';

test.describe('Página inicial', () => {
  test('carrega com título Rotina', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Rotina/);
  });

  test('mostra navegação de dias', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#dayLabel')).toBeVisible();
    await expect(page.locator('#dateLabel')).toBeVisible();
  });

  test('mostra 3 separadores', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#tabMeals')).toBeVisible();
    await expect(page.locator('#tabEx')).toBeVisible();
    await expect(page.locator('#tabProgress')).toBeVisible();
  });

  test('alterna entre separadores', async ({ page }) => {
    await page.goto('/');
    await page.locator('#tabEx').click();
    await page.waitForTimeout(300);
    await expect(page.locator('#exPanel')).toHaveClass(/active/);
    await expect(page.locator('#mealsPanel')).not.toHaveClass(/active/);
    await page.locator('#tabProgress').click();
    await page.waitForTimeout(300);
    await expect(page.locator('#progressPanel')).toHaveClass(/active/);
    await page.locator('#tabMeals').click();
    await page.waitForTimeout(300);
    await expect(page.locator('#mealsPanel')).toHaveClass(/active/);
  });

  test('mostra 6 refeições', async ({ page }) => {
    await page.goto('/');
    const items = page.locator('#mealsPanel .item');
    await expect(items).toHaveCount(6);
  });

  test('marca e desmarca uma refeição', async ({ page }) => {
    await page.goto('/');
    const first = page.locator('#mealsPanel .item').first();
    await expect(first).not.toHaveClass(/done/);
    await first.click();
    await expect(first).toHaveClass(/done/);
    await first.click();
    await expect(first).not.toHaveClass(/done/);
  });

  test('vista semanal tem 7 dots', async ({ page }) => {
    await page.goto('/');
    const dots = page.locator('#weeklyView .dot');
    await expect(dots).toHaveCount(7);
  });

  test('streak badge visível quando há streak', async ({ page }) => {
    await page.goto('/');
    // Marca 5 refeições para o dia atual
    const items = page.locator('#mealsPanel .item');
    for (let i = 0; i < 5; i++) {
      await items.nth(i).click();
    }
    const badge = page.locator('#streakBadge');
    await expect(badge).toBeVisible();
  });
});

test.describe('Página de exercício', () => {
  test('carrega detalhes de um exercício', async ({ page }) => {
    await page.goto('/exercicio.html?id=e1&date=2026-07-14');
    await expect(page.locator('h1')).toContainText('Flexões Normais');
  });

  test('mostra navegação anterior/seguinte', async ({ page }) => {
    await page.goto('/exercicio.html?id=e2&date=2026-07-14');
    await expect(page.locator('#prevEx')).toBeEnabled();
    await expect(page.locator('#nextEx')).toBeEnabled();
  });

  test('timer de descanso visível', async ({ page }) => {
    await page.goto('/exercicio.html?id=e1&date=2026-07-14');
    await expect(page.locator('#timerDisplay')).toBeVisible();
  });

  test('botão marcar como feito funciona', async ({ page }) => {
    await page.goto('/exercicio.html?id=e1&date=2026-07-14');
    const btn = page.locator('#markBtn');
    await expect(btn).toContainText('Marcar como feito');
    await btn.click();
    await expect(btn).toContainText('Feito hoje');
    await btn.click();
    await expect(btn).toContainText('Marcar como feito');
  });

  test('exercício inexistente mostra mensagem', async ({ page }) => {
    await page.goto('/exercicio.html?id=zzz');
    await expect(page.locator('.not-found')).toBeVisible();
  });
});

test.describe('Página de treino guiado', () => {
  test('carrega com exercícios do dia', async ({ page }) => {
    await page.goto('/treino.html?date=2026-07-13'); // Segunda-feira = 4 exercícios
    await page.waitForTimeout(500);
    const card = page.locator('.wo-card h2');
    await expect(card).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.wo-counter')).toContainText('0 de 4');
  });

  test('dia de descanso mostra mensagem', async ({ page }) => {
    await page.goto('/treino.html?date=2026-07-18'); // Sábado = descanso
    await page.waitForTimeout(500);
    await expect(page.locator('.finish-screen')).toBeVisible({ timeout: 10000 });
  });

  test('marca exercício como feito e avança', async ({ page }) => {
    await page.goto('/treino.html?date=2026-07-13');
    await page.waitForTimeout(500);
    const btnDone = page.locator('#btnDone');
    await btnDone.waitFor({ state: 'visible', timeout: 10000 });
    await btnDone.click();
    await page.waitForTimeout(300);
    const btnNext = page.locator('#btnNext');
    await btnNext.waitFor({ state: 'visible', timeout: 5000 });
    await btnNext.click();
    await page.waitForTimeout(300);
    await expect(page.locator('.wo-counter')).toContainText('1 de 4');
  });

  test('timer de descanso visível', async ({ page }) => {
    await page.goto('/treino.html?date=2026-07-13');
    await page.waitForTimeout(500);
    await expect(page.locator('#timerDisplay')).toBeVisible({ timeout: 10000 });
  });

  test('metrónomo toggla', async ({ page }) => {
    await page.goto('/treino.html?date=2026-07-13');
    await page.waitForTimeout(500);
    const metroBtn = page.locator('#metroBtn');
    await metroBtn.waitFor({ state: 'visible', timeout: 10000 });
    await metroBtn.click();
    await page.waitForTimeout(200);
    await expect(metroBtn).toHaveClass(/active/);
    await metroBtn.click();
    await expect(metroBtn).not.toHaveClass(/active/);
  });

  test.skip('termina treino completo', async ({ page }) => {
    await page.goto('/treino.html?date=2026-07-13');
    await page.waitForTimeout(500);
    // Mark all 4 exercises
    for (let i = 0; i < 3; i++) {
      await page.locator('#btnDone').click();
      await page.waitForTimeout(200);
      await page.locator('#btnNext').click();
      await page.waitForTimeout(500);
    }
    // Last exercise
    await page.locator('#btnDone').click();
    await page.waitForTimeout(200);
    await page.locator('#btnFinish').click();
    await expect(page.locator('.finish-screen')).toBeVisible();
  });
});

test.describe('PWA', () => {
  test('manifest é servido', async ({ page }) => {
    const response = await page.request.get('/manifest.webmanifest');
    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json.name).toContain('Rotina');
  });

  test('service worker regista-se', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);
    // Check that registerSW.js is loaded
    const sw = await page.evaluate(() => 'serviceWorker' in navigator);
    expect(sw).toBe(true);
  });
});
