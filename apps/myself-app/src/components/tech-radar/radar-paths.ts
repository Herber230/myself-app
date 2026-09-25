/**
 * Where a technology sits on the radar: its legend entry's anchor. Linked to
 * from the landing page's projects (#30), and the place a blip's detail (#42)
 * opens from.
 */
import { localePath, type SiteLocale } from '../../site-locales';

/** The legend entry's `id`: `tech-next-js`. */
export function radarEntryId(technologyId: string): string {
  return `tech-${technologyId}`;
}

/** `/en/tech-radar/#tech-next-js`. */
export function radarEntryPath(
  locale: SiteLocale,
  technologyId: string,
): string {
  return `${localePath(locale, '/tech-radar')}#${radarEntryId(technologyId)}`;
}
