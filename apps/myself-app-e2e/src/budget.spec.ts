import { gzipSync } from 'node:zlib';

import {
  expect,
  type Locator,
  type Page,
  type Response,
  test,
} from '@playwright/test';

/**
 * The landing page's JavaScript, held to a budget (ADR 0008), and the radar's
 * (ADR 0014).
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
/**
 * Measured 161.2 KB on 2026-09-25, rounded up, plus 10 KB of room: the shared
 * runtime and the filter's island, about 8 KB of it (ADR 0014).
 */
const RADAR_SCRIPT_BUDGET = (162 + 10) * KB;

/**
 * Every script `path` loads until `ready` is attached, as text and as its
 * gzipped size. `ready` is something rendered only after hydration, so every
 * script the page needs to become interactive has loaded by then.
 *
 * Prefetching is cut off at its source, the RSC payload a visible link asks
 * for: the chunks it would then fetch belong to another page, and whether
 * they land before `ready` varies with the machine's load.
 */
async function scriptsOf(
  page: Page,
  path: string,
  ready: (page: Page) => Locator,
) {
  await page.route(/\/__next\.|\.txt(\?|$)|[?&]_rsc=/, route => route.abort());
  const scripts: Promise<{ text: string; size: number }>[] = [];
  const collect = (response: Response) => {
    if (response.request().resourceType() === 'script') {
      scripts.push(
        response.body().then(body => ({
          text: body.toString('utf8'),
          size: gzipSync(body, { level: 9 }).length,
        })),
      );
    }
  };
  page.on('response', collect);
  await page.goto(path);
  await expect(ready(page)).toBeAttached();
  page.off('response', collect);
  const loaded = await Promise.all(scripts);
  const total = loaded.reduce((sum, script) => sum + script.size, 0);
  return { loaded, total };
}

function report(name: string, total: number, count: number, budget: number) {
  test.info().annotations.push({
    type: 'budget',
    description: `${(total / KB).toFixed(1)} KB of ${(budget / KB).toFixed(0)} KB gzipped, over ${count} scripts`,
  });
  console.log(
    `${name} scripts: ${(total / KB).toFixed(1)} KB gzipped over ${count} files`,
  );
}

test("the landing page's scripts stay within the budget", async ({ page }) => {
  // Attached, not visible: the bar is hidden until the page scrolls.
  const { loaded, total } = await scriptsOf(page, '/en/', each =>
    each.getByRole('banner').getByLabel('Theme', { exact: true }),
  );
  report('landing', total, loaded.length, LANDING_SCRIPT_BUDGET);
  expect(loaded.length).toBeGreaterThan(0);
  expect(total).toBeLessThanOrEqual(LANDING_SCRIPT_BUDGET);
});

test("the radar's scripts stay within the budget, and carry no entifix", async ({
  page,
}) => {
  // The filter's controls render only once hydrated.
  const { loaded, total } = await scriptsOf(page, '/en/tech-radar/', each =>
    each.getByRole('group', { name: 'Quadrant' }),
  );
  report('radar', total, loaded.length, RADAR_SCRIPT_BUDGET);
  expect(total).toBeLessThanOrEqual(RADAR_SCRIPT_BUDGET);
  // ADR 0003: the filter runs over props, never through entifix's use case.
  for (const script of loaded) {
    expect(script.text).not.toContain('EntityRepositoryTag');
    expect(script.text).not.toContain('loadUCFactory');
  }
});
