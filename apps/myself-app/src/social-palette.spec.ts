import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { SOCIAL_PALETTE } from './social-palette';

/** The declarations of the blue theme's block in `themes.css`. */
function blueTheme(): Record<string, string> {
  const css = readFileSync(new URL('app/themes.css', import.meta.url), 'utf8');
  const block = /\[data-theme='blue'\]\s*\{([^}]*)\}/.exec(css)?.[1] ?? '';
  return Object.fromEntries(
    [...block.matchAll(/--color-([\w-]+):\s*([^;]+);/g)].map(
      ([, name, value]) => [name, value?.trim()],
    ),
  );
}

describe('the social preview palette', () => {
  it('is the blue theme, as themes.css declares it', () => {
    const theme = blueTheme();
    for (const [name, value] of Object.entries(SOCIAL_PALETTE)) {
      expect(theme[name], `--color-${name}`).toBe(value);
    }
  });
});
