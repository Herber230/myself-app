import localFont from 'next/font/local';

/**
 * The typefaces `@entifix/style/tokens.css` names — `--font-inter` and
 * `--font-jetbrains-mono` — self-hosted from the fontsource packages, so the
 * export carries them and a printed page never falls back (ADR 0006). Latin
 * covers both English and Spanish.
 */
const inter = localFont({
  src: '../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2',
  weight: '100 900',
  style: 'normal',
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = localFont({
  src: '../node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2',
  weight: '100 800',
  style: 'normal',
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

/** Both variables, for the `className` of every root layout's <html>. */
export const fontVariables = `${inter.variable} ${jetbrainsMono.variable}`;
