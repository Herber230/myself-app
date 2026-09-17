import { workspaceRoot } from '@nx/devkit';
import { nxE2EPreset } from '@nx/playwright/preset';
import { defineConfig, devices } from '@playwright/test';

const PORT = 3200;
const baseURL = `http://localhost:${PORT}`;

/**
 * The journeys run against `apps/myself-app/out`, served by
 * `tools/serve-static.mjs` — the same rules the S3 website endpoint applies
 * (ADR 0007). Never against `next dev` or `next start`: a route that only works
 * with a server behind it must fail here, not in the bucket.
 *
 * `e2e` depends on `myself-app:build`, so the export is fresh when this runs.
 *
 * Port 3200 rather than `serve-out`'s 3100, and no server reuse: a reused
 * server would quietly run these journeys against whatever export it was
 * started on.
 */
export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src' }),
  use: { baseURL, trace: 'on-first-retry' },
  webServer: {
    command: `node tools/serve-static.mjs apps/myself-app/out ${PORT}`,
    cwd: workspaceRoot,
    url: `${baseURL}/en/`,
    reuseExistingServer: false,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
