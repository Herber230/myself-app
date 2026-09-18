import { gzipSync } from 'node:zlib';

import { expect, test } from '@playwright/test';

/**
 * The landing page's JavaScript, held to a budget (ADR 0008).
 *
 * Every script `/en/` loads, gzipped at level 9 and summed — the measure ADR
 * 0003 used, so the figures in both records compare. Lighthouse and LCP stay a
 * manual gate; this is the half CI can hold on every change.
 *
 * The budget is the measured baseline plus room for the two client leaves ADR
 * 0008 expects. A change that crosses it either earns a new figure, written
 * into ADR 0008 with the reason, or gets smaller.
 */
const KB = 1024;
/** Measured 178.6 KB on 2026-09-18, rounded up, plus 15 KB for the leaves. */
const LANDING_SCRIPT_BUDGET = (179 + 15) * KB;

test("the landing page's scripts stay within the budget", async ({ page }) => {
  const scripts: Promise<number>[] = [];
  page.on('response', response => {
    if (response.request().resourceType() === 'script') {
      scripts.push(
        response.body().then(body => gzipSync(body, { level: 9 }).length),
      );
    }
  });

  await page.goto('/en/');
  // The theme switcher renders only after hydration, so every script the
  // page needs to become interactive has loaded by the time it shows.
  await expect(page.getByRole('radio', { name: 'Dark' })).toBeVisible();
  const sizes = await Promise.all(scripts);
  const total = sizes.reduce((sum, size) => sum + size, 0);

  test.info().annotations.push({
    type: 'budget',
    description: `${(total / KB).toFixed(1)} KB of ${(LANDING_SCRIPT_BUDGET / KB).toFixed(0)} KB gzipped, over ${sizes.length} scripts`,
  });
  console.log(
    `landing scripts: ${(total / KB).toFixed(1)} KB gzipped over ${sizes.length} files`,
  );
  expect(sizes.length).toBeGreaterThan(0);
  expect(total).toBeLessThanOrEqual(LANDING_SCRIPT_BUDGET);
});
