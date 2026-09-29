import type { Profile } from '@myself-app/domain';
import { loadProfile } from '@myself-app/domain/use-cases';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { SITE_CONTENT } from './composition';
import { renderSocialImage } from './social-image';

// What the image says, rather than how it is drawn: `next/og` is replaced by
// a stand-in that keeps the element it is handed.
const drawn = vi.hoisted(() => ({ element: undefined as unknown }));
vi.mock('next/og', () => ({
  ImageResponse: class {
    constructor(element: unknown) {
      drawn.element = element;
    }
  },
}));
const PROFILE = await loadProfile(SITE_CONTENT);

async function textFor(locale: 'en' | 'es', profile: Profile = PROFILE) {
  await renderSocialImage(locale, profile);
  return renderToStaticMarkup(drawn.element as ReactElement).replace(
    /<[^>]+>/g,
    '|',
  );
}

describe("the social preview image's words", () => {
  it('come from the profile and the catalogs, in English', async () => {
    const text = await textFor('en');
    expect(text).toContain('Herber Colop');
    expect(text).toContain('Software Engineer');
    expect(text).toContain('|CV|');
    expect(text).toContain('|Tech radar|');
  });

  it('come from the profile and the catalogs, in Spanish', async () => {
    const text = await textFor('es');
    expect(text).toContain('Ingeniero de software');
    expect(text).toContain('|Radar tecnológico|');
  });

  it('leave the title out when the profile has none', async () => {
    const text = await textFor('en', {
      ...PROFILE,
      title: undefined,
    } as Profile);
    expect(text).not.toContain('Software Engineer');
  });
});
