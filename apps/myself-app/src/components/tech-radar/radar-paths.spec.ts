import { describe, expect, it } from 'vitest';

import { radarEntryId, radarEntryPath, technologyPath } from './radar-paths';

describe("a technology's place on the radar", () => {
  it('is its legend entry, by id', () => {
    expect(radarEntryId('next-js')).toBe('tech-next-js');
    expect(radarEntryPath('es', 'next-js')).toBe(
      '/es/tech-radar/#tech-next-js',
    );
  });

  it('has a page of its own, with the trailing slash', () => {
    expect(technologyPath('en', 'next-js')).toBe('/en/tech-radar/next-js/');
  });
});
