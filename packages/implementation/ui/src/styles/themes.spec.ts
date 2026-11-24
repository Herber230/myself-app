import { readFileSync } from 'node:fs';

import {
  paletteContractFailures,
  parsePaletteCss,
} from '@entifix/style/testing';
import { describe, expect, it } from 'vitest';

import { SITE_THEMES } from '../theme/theme.js';

const palettes = parsePaletteCss(
  readFileSync(new URL('./themes.css', import.meta.url), 'utf8'),
);

describe("the site's palettes", () => {
  it('declare every theme the switcher offers', () => {
    expect(Object.keys(palettes).sort()).toEqual([...SITE_THEMES].sort());
  });

  it.each(SITE_THEMES)(
    "%s fills entifix's colour contract, every pair at its contrast",
    theme => {
      expect(paletteContractFailures(palettes[theme] ?? {})).toEqual([]);
    },
  );
});
