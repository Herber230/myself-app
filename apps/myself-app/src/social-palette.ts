/**
 * The blue theme's colors, as the social preview image paints them (#50).
 *
 * The image is drawn by `next/og` at build, which reads no stylesheet, so the
 * values are written out here. `social-palette.spec.ts` holds them to
 * `app/themes.css`: a palette change there fails until it is made here too.
 */
export const SOCIAL_PALETTE = {
  'hero-from': '#081630',
  'hero-to': '#16366e',
  content: '#f4f7fc',
  'content-muted': '#a8b6d0',
  primary: '#7cc4ff',
} as const;
