import { expect, test } from '@playwright/test';

/**
 * How the CV looks (ADR 0012): every sheet as it prints, and each human sheet
 * on a desktop and a phone. A design change shows up here as screenshots to
 * review.
 *
 * ⚠️ The baselines are rendered on Linux, where CI runs: fonts rasterize
 * differently on macOS, so these are skipped anywhere else. Update them in
 * Docker with `tools/update-cv-baselines.sh` (docs/DEVELOPING.md).
 */
// eslint-disable-next-line playwright/no-skipped-test -- a platform guard, not a skipped test: macOS rasterizes differently.
test.skip(
  process.platform !== 'linux',
  'CV baselines are Linux-rendered; update them with tools/update-cv-baselines.sh',
);

const VARIANTS = ['', 'backend/', 'frontend/', 'devops/'];
const LOCALES = ['en', 'es'];

/** `/es/cv/backend/ats/` → `es-backend-ats`. */
const nameOf = (path: string) =>
  path
    .split('/')
    .filter(part => part !== '' && part !== 'cv')
    .join('-') || 'default';

const humanPaths = LOCALES.flatMap(locale =>
  VARIANTS.map(variant => `/${locale}/cv/${variant}`),
);

for (const path of humanPaths.flatMap(path => [path, `${path}ats/`])) {
  test(`${path} prints as designed`, async ({ page }) => {
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('article.cv-sheet')).toHaveScreenshot(
      `print-${nameOf(path)}.png`,
    );
  });
}

for (const [device, viewport] of [
  ['desktop', { width: 1280, height: 900 }],
  ['phone', { width: 390, height: 844 }],
] as const) {
  for (const path of humanPaths) {
    test(`${path} looks as designed on a ${device}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      await expect(page).toHaveScreenshot(`${device}-${nameOf(path)}.png`, {
        fullPage: true,
      });
    });
  }
}
