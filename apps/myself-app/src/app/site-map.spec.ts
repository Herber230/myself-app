import { globSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';

import {
  CV_VARIANT_ROUTE,
  POST_ROUTE,
  SITE_PATHS,
  TECHNOLOGY_ROUTE,
  UNLISTED_ROUTES,
} from '@myself-app/implementation-ui/routing';
import { describe, expect, it } from 'vitest';

/** The UI's site map names the app's pages; this holds the two together. */
describe('the sitemap', () => {
  it('accounts for every page under app/[locale]/, and nothing else', () => {
    const root = join(import.meta.dirname, '[locale]');
    const pages = globSync('**/page.tsx', { cwd: root }).map(page => {
      const dir = relative('.', dirname(page));
      return dir === '' ? '/' : `/${dir}`;
    });
    expect(
      [
        ...SITE_PATHS,
        CV_VARIANT_ROUTE,
        TECHNOLOGY_ROUTE,
        POST_ROUTE,
        ...UNLISTED_ROUTES,
      ].sort(),
    ).toEqual(pages.sort());
  });
});
