import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { browserSources } from './browser-sources.js';

afterEach(() => vi.unstubAllGlobals());

describe('the browser sources', () => {
  it('read each entity from the data file the export writes', async () => {
    const fetched: string[] = [];
    vi.stubGlobal('fetch', async (url: string) => {
      fetched.push(url);
      return new Response('[]');
    });
    await browserSources.posts();
    await browserSources.technologies();
    await browserSources.decisions();
    expect(fetched).toEqual([
      '/data/post.json',
      '/data/technology.json',
      '/data/adr.json',
    ]);
  });

  it('read no file themselves: the half the browser bundles', () => {
    const source = readFileSync(
      join(import.meta.dirname, 'browser-sources.ts'),
      'utf8',
    );
    expect(source).not.toMatch(/from 'node:/);
    expect(source).not.toMatch(/from '@myself-app\/domain'/);
  });
});
