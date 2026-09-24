/**
 * Where each sheet lives (ADR 0012). The default variant has `/cv/` only, so
 * no two URLs show the same sheet; the ATS mode adds `ats/`, a segment no
 * variant may take.
 */
import type { CvMode } from './cv-format';

export function cvPath(
  variant: string,
  mode: CvMode,
  defaultVariant: string,
): string {
  const base = variant === defaultVariant ? '/cv' : `/cv/${variant}`;
  return mode === 'ats' ? `${base}/ats` : base;
}
