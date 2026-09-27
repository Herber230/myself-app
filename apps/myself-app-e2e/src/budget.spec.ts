import { gzipSync } from 'node:zlib';

import {
  expect,
  type Locator,
  type Page,
  type Response,
  test,
} from '@playwright/test';

/**
 * The landing page's JavaScript, held to a budget (ADR 0008), the radar's
 * (ADR 0014) and the CV's (ADR 0015).
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
 * Measured 237.4 KB on 2026-09-27, rounded up, plus 10 KB of room. Since ADR
 * 0016 the filter runs entifix's `load` use case in the browser: +76 KB over
 * the 161.2 KB of filtering props (ADR 0014).
 */
const RADAR_SCRIPT_BUDGET = (238 + 10) * KB;
/**
 * After the first filter: the same scripts, and `/data/technology.json`.
 * Measured 241.4 KB on 2026-09-27, rounded up, plus 10 KB of room.
 */
const RADAR_FILTERED_BUDGET = (242 + 10) * KB;
/**
 * Measured 159.6 KB on 2026-09-25, rounded up, plus 10 KB of room: the
 * print button and the customizer's island (ADR 0015).
 */
const CV_SCRIPT_BUDGET = (160 + 10) * KB;

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
  /** A first interaction, and whatever else it loads: data as well as code. */
  interact?: (page: Page) => Promise<void>,
) {
  await page.route(/\/__next\.|\.txt(\?|$)|[?&]_rsc=/, route => route.abort());
  const scripts: Promise<{ text: string; size: number }>[] = [];
  const data: Promise<number>[] = [];
  const gzipped = (response: Response) =>
    response.body().then(body => ({
      text: body.toString('utf8'),
      size: gzipSync(body, { level: 9 }).length,
    }));
  const collect = (response: Response) => {
    if (response.request().resourceType() === 'script') {
      scripts.push(gzipped(response));
    } else if (new URL(response.url()).pathname.startsWith('/data/')) {
      data.push(gzipped(response).then(({ size }) => size));
    }
  };
  page.on('response', collect);
  await page.goto(path);
  await expect(ready(page)).toBeAttached();
  const beforeInteraction = scripts.length;
  if (interact) await interact(page);
  page.off('response', collect);
  const loaded = await Promise.all(scripts);
  const sum = (sizes: readonly number[]) =>
    sizes.reduce((total, size) => total + size, 0);
  const total = sum(loaded.slice(0, beforeInteraction).map(each => each.size));
  const afterInteraction =
    sum(loaded.map(each => each.size)) + sum(await Promise.all(data));
  return { loaded, total, afterInteraction };
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

test("the landing page's scripts stay within the budget, and carry no entifix", async ({
  page,
}) => {
  // Attached, not visible: the bar is hidden until the page scrolls.
  const { loaded, total } = await scriptsOf(page, '/en/', each =>
    each.getByRole('banner').getByLabel('Theme', { exact: true }),
  );
  report('landing', total, loaded.length, LANDING_SCRIPT_BUDGET);
  expect(loaded.length).toBeGreaterThan(0);
  expect(total).toBeLessThanOrEqual(LANDING_SCRIPT_BUDGET);
  // ADR 0016: only a page that filters in the browser ships entifix's use case.
  for (const script of loaded) {
    expect(script.text).not.toContain('EntityRepositoryTag');
  }
});

test("the radar's scripts stay within the budget, filtering through entifix", async ({
  page,
}) => {
  // The filter's controls render only once hydrated; the first filter asks
  // for `/data/technology.json` and answers through the use case.
  const { loaded, total, afterInteraction } = await scriptsOf(
    page,
    '/en/tech-radar/',
    each => each.getByRole('group', { name: 'Quadrant' }),
    async each => {
      await each.getByRole('button', { name: 'Monorepo' }).click();
      await expect(
        each.locator('a[data-blip][data-dimmed]').first(),
      ).toBeAttached();
    },
  );
  report('radar', total, loaded.length, RADAR_SCRIPT_BUDGET);
  report(
    'radar, filtered',
    afterInteraction,
    loaded.length,
    RADAR_FILTERED_BUDGET,
  );
  expect(total).toBeLessThanOrEqual(RADAR_SCRIPT_BUDGET);
  expect(afterInteraction).toBeLessThanOrEqual(RADAR_FILTERED_BUDGET);
  // ADR 0016: the filter runs entifix's own use case in the browser. The
  // tag's name is a string, so it survives minification where names do not.
  expect(
    loaded.some(script => script.text.includes('EntityRepositoryTag')),
  ).toBe(true);
});

test("the CV's scripts stay within the budget, and carry no entifix", async ({
  page,
}) => {
  // The customizer renders only once hydrated.
  const { loaded, total } = await scriptsOf(page, '/en/cv/', each =>
    each.getByText('Customize', { exact: true }),
  );
  report('cv', total, loaded.length, CV_SCRIPT_BUDGET);
  expect(total).toBeLessThanOrEqual(CV_SCRIPT_BUDGET);
  // ADR 0015: the customizer chooses over props, never through entifix.
  for (const script of loaded) {
    expect(script.text).not.toContain('EntityRepositoryTag');
    expect(script.text).not.toContain('loadUCFactory');
  }
});
