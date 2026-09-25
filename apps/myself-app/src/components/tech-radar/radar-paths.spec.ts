import { describe, expect, it } from 'vitest';

import { radarEntryId, radarEntryPath } from './radar-paths';

describe("a technology's place on the radar", () => {
  it('is its legend entry, by id', () => {
    expect(radarEntryId('next-js')).toBe('tech-next-js');
    expect(radarEntryPath('es', 'next-js')).toBe(
      '/es/tech-radar/#tech-next-js',
    );
  });
});
