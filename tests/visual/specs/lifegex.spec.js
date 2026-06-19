/* Task 50: Visual Regression Test Specs */
import { test, expect } from '@playwright/test';

test.describe('LifeGex Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1500); // Wait for animations
  });

  test('hero section renders correctly', async ({ page }) => {
    await expect(page.locator('.hero')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.hero-visual canvas')).toBeVisible();
  });

  test('navigation is visible and interactive', async ({ page }) => {
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('.nav-links')).toBeVisible();
    const links = page.locator('.nav-links a');
    await expect(links).toHaveCount(4);
  });

  test('about section cards present', async ({ page }) => {
    await page.locator('#about').scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    const cards = page.locator('.about-card');
    await expect(cards).toHaveCount(3);
  });

  test('values grid layout', async ({ page }) => {
    await page.locator('#values').scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    const cards = page.locator('.value-card');
    await expect(cards).toHaveCount(4);
  });

  test('ventures section with cards', async ({ page }) => {
    await page.locator('#ventures').scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    const cards = page.locator('.venture-card');
    await expect(cards).toHaveCount(4);
  });

  test('timeline items render', async ({ page }) => {
    await page.locator('#timeline').scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    const items = page.locator('.tl-item');
    await expect(items).toHaveCount(4);
  });

  test('funds progress bars animate', async ({ page }) => {
    await page.locator('#funds').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    const bars = page.locator('.funds-bar-fill');
    await expect(bars).toHaveCount(4);
  });

  test('team cards visible', async ({ page }) => {
    await page.locator('#team').scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    const cards = page.locator('.team-card');
    await expect(cards).toHaveCount(3);
  });

  test('metrics counters animate', async ({ page }) => {
    await page.locator('#metrics').scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);
    const items = page.locator('.metric-item');
    await expect(items).toHaveCount(4);
  });

  test('dark mode toggle', async ({ page }) => {
    await page.locator('#themeToggle').click();
    await expect(page.locator('body')).toHaveClass(/dark/);
    await page.locator('#themeToggle').click();
    await expect(page.locator('body')).not.toHaveClass(/dark/);
  });

  test('mobile responsive nav', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expect(page.locator('.hamburger')).toBeVisible();
    await page.locator('.hamburger').click();
    await expect(page.locator('.nav-links')).toHaveClass(/open/);
  });

  test('full page screenshot matches', async ({ page }) => {
    await expect(page).toHaveScreenshot('full-page.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });

  test('section screenshots', async ({ page }) => {
    const sections = ['hero', 'about', 'values', 'ventures', 'timeline', 'funds', 'team', 'cta'];
    for (const id of sections) {
      const el = page.locator(`#${id}`);
      if (await el.isVisible()) {
        await el.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
        await expect(el).toHaveScreenshot(`${id}.png`);
      }
    }
  });
});
