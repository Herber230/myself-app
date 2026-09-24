import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { localize } from '@myself-app/domain';
import { ImageResponse } from 'next/og';

import { loadProfile } from './content/profile';
import { SITE_REPOSITORIES } from './content/repositories';
import { siteT } from './i18n/server';
import type { SiteLocale } from './site-locales';
import { SOCIAL_PALETTE } from './social-palette';

/** The size Open Graph and Twitter both crop least. */
export const SOCIAL_IMAGE_SIZE = { width: 1200, height: 630 };

/**
 * `next/og` reads TTF, OTF and WOFF, not the WOFF2 the pages self-host
 * (`fonts.ts`), so the image takes the static WOFF cuts of the same faces.
 * Read from disk at build; the build and test targets both run from the app's
 * folder.
 */
async function font(file: string): Promise<ArrayBuffer> {
  const bytes = await readFile(join(process.cwd(), 'node_modules', file));
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
}

/**
 * The social preview for a locale (#50): the hero, as type — the name, the
 * title, and the site's two destinations — on the blue theme's gradient.
 * Drawn once per locale during `next build`; nothing of it reaches a browser.
 */
export async function renderSocialImage(
  locale: SiteLocale,
): Promise<ImageResponse> {
  const t = siteT(locale);
  const profile = await loadProfile(SITE_REPOSITORIES);
  // One string: `next/og` needs `display: flex` on a box with several
  // children, and `{first} {last}` would make three.
  const name = [profile.firstName, profile.lastName].join(' ');
  const [interRegular, interSemibold, mono] = await Promise.all([
    font('@fontsource/inter/files/inter-latin-400-normal.woff'),
    font('@fontsource/inter/files/inter-latin-600-normal.woff'),
    font(
      '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff',
    ),
  ]);
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 96px',
        gap: 24,
        color: SOCIAL_PALETTE.content,
        backgroundImage: `linear-gradient(160deg, ${SOCIAL_PALETTE['hero-from']} 0%, ${SOCIAL_PALETTE['hero-to']} 100%)`,
        fontFamily: 'Inter',
      }}
    >
      <div
        style={{
          fontSize: 112,
          fontWeight: 600,
          lineHeight: 1,
          letterSpacing: '-0.03em',
        }}
      >
        {name}
      </div>
      {profile.title && (
        <div style={{ fontSize: 44, color: SOCIAL_PALETTE['content-muted'] }}>
          {localize(profile.title, locale)}
        </div>
      )}
      <div
        style={{
          display: 'flex',
          gap: 40,
          marginTop: 48,
          fontFamily: 'JetBrains Mono',
          fontSize: 28,
          color: SOCIAL_PALETTE.primary,
        }}
      >
        <span>{t('cv')}</span>
        <span>{t('techRadar')}</span>
      </div>
    </div>,
    {
      ...SOCIAL_IMAGE_SIZE,
      fonts: [
        { name: 'Inter', data: interRegular, weight: 400, style: 'normal' },
        { name: 'Inter', data: interSemibold, weight: 600, style: 'normal' },
        { name: 'JetBrains Mono', data: mono, weight: 400, style: 'normal' },
      ],
    },
  );
}
