/**
 * What a visitor has hidden on a CV sheet (#38, ADR 0015), and how it is
 * written: in the URL, as `?hide=section:education,tech:jest`, and in the page,
 * as one `<style>` element of `display: none` rules.
 *
 * The sheet itself never changes: every part is rendered at build time with a
 * `data-cv-part` naming it, and hiding it is a stylesheet's job, so print
 * honours it too. Both writers of that stylesheet — the inline script before
 * first paint and the customizer after hydration — build it from here.
 */

export type CvPartKind = 'section' | 'position' | 'tech';

/** The query parameter a customized sheet's URL carries. */
export const HIDE_PARAM = 'hide';

/** The attribute every hideable part of the sheet carries. */
export const PART_ATTRIBUTE = 'data-cv-part';

/** The `<style>` element in `<head>` that hides them. */
export const HIDDEN_STYLE_ID = 'cv-hidden';

/**
 * A part's name as the URL and the attribute write it. Content ids are
 * kebab-case, so a token that matches this cannot break out of the selector
 * it is written into.
 */
export const PART_PATTERN = /^(section|position|tech):[a-z0-9-]+$/;

export const cvPart = (kind: CvPartKind, id: string) => `${kind}:${id}`;

/** The parts a search string hides: valid tokens only, each once. */
export function parseHidden(search: string): string[] {
  const raw = new URLSearchParams(search).get(HIDE_PARAM);
  if (!raw) return [];
  return [...new Set(raw.split(',').filter(token => PART_PATTERN.test(token)))];
}

/**
 * `search` with its `hide` parameter set to `parts`, in a stable order, or
 * without it when nothing is hidden. Every other parameter is kept.
 */
export function withHidden(search: string, parts: readonly string[]): string {
  const params = new URLSearchParams(search);
  if (parts.length === 0) params.delete(HIDE_PARAM);
  else params.set(HIDE_PARAM, [...parts].sort().join(','));
  // `:` and `,` are legal in a query; left unescaped, the URL stays readable.
  const query = params.toString().replace(/%3A/g, ':').replace(/%2C/g, ',');
  return query ? `?${query}` : '';
}

/** The rules that hide `parts`, or nothing. */
export function hiddenCss(parts: readonly string[]): string {
  if (parts.length === 0) return '';
  return `${parts.map(part => `[${PART_ATTRIBUTE}="${part}"]`).join(',')}{display:none!important}`;
}

/**
 * Writes the rules for `parts` into the page, replacing any written before,
 * or removes them when nothing is hidden.
 */
export function applyHidden(parts: readonly string[]) {
  let style = document.getElementById(HIDDEN_STYLE_ID);
  if (parts.length === 0) {
    style?.remove();
    return;
  }
  if (style === null) {
    style = document.createElement('style');
    style.id = HIDDEN_STYLE_ID;
    document.head.appendChild(style);
  }
  style.textContent = hiddenCss(parts);
}
