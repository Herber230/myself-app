/**
 * Where each sheet lives (ADR 0012). The default variant has `/cv/` only, so
 * no two URLs show the same sheet; the ATS mode adds `ats/`, a segment no
 * variant may take.
 */
import type { SiteLocale } from '../../site-locales';
import type { CvMode } from './cv-format';

export function cvPath(
  variant: string,
  mode: CvMode,
  defaultVariant: string,
): string {
  const base = variant === defaultVariant ? '/cv' : `/cv/${variant}`;
  return mode === 'ats' ? `${base}/ats` : base;
}

/**
 * The prebuilt PDF's file name, written beside its page (#37):
 * `herber-colop-cv-backend-es-ats.pdf`. Relative, so a link to it from its
 * page resolves to the file next to the page.
 */
export function cvPdfName(
  variant: string,
  locale: SiteLocale,
  mode: CvMode,
): string {
  const suffix = mode === 'ats' ? '-ats' : '';
  return `herber-colop-cv-${variant}-${locale}${suffix}.pdf`;
}
