import { Quadrant, Ring, TechnologyArea } from '@myself-app/domain';
import { loadRadarPlacements } from '@myself-app/domain/use-cases';
import { layoutRadar } from '@myself-app/entifix-incubator-react-controls';
import { siteT } from '@myself-app/implementation-ui/i18n';
import { radarEntriesOf } from '@myself-app/implementation-ui/organisms';
import {
  isSiteLocale,
  localeAlternates,
  SITE_DEFAULT_LOCALE,
} from '@myself-app/implementation-ui/routing';
import { TechRadarPageView } from '@myself-app/implementation-ui/templates';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { SITE_CONTENT } from '../../../composition';
import { BrowserSources } from '../../../providers/browser-sources';

const PATH = '/tech-radar';

/**
 * Read from content and laid out once, while `next build` runs, and shared by
 * both locales: the layout does not depend on the language (ADR 0003, and
 * `layout.ts` on why the numbering is sorted by the default locale). A promise
 * rather than a value, because the entries arrive through entifix's `load`
 * use case.
 */
const LAYOUT = loadRadarPlacements(SITE_CONTENT).then(placements =>
  layoutRadar(radarEntriesOf(placements), { sortLocale: SITE_DEFAULT_LOCALE }),
);

/** Innermost first, as the chart draws them. */
const RINGS = SITE_CONTENT.loadAll(Ring, {
  sorting: [{ 0: { property: 'order', type: 'asc' } }],
});

/** By index, as the chart numbers them: the ids the filter's URL uses. */
const QUADRANTS = SITE_CONTENT.loadAll(Quadrant, {
  sorting: [{ 0: { property: 'order', type: 'asc' } }],
});

const AREAS = SITE_CONTENT.loadAll(TechnologyArea);

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/tech-radar'>): Promise<Metadata> {
  const { locale } = await params;
  if (!isSiteLocale(locale)) notFound();
  const t = siteT(locale);
  return {
    title: `${t('techRadar')} — ${t('siteName')}`,
    alternates: localeAlternates(locale, PATH),
  };
}

export default async function TechRadarPage({
  params,
}: PageProps<'/[locale]/tech-radar'>) {
  const { locale } = await params;
  if (!isSiteLocale(locale)) notFound();
  const [layout, rings, quadrants, areas] = await Promise.all([
    LAYOUT,
    RINGS,
    QUADRANTS,
    AREAS,
  ]);
  return (
    <BrowserSources>
      <TechRadarPageView
        locale={locale}
        layout={layout}
        rings={rings}
        quadrants={quadrants}
        areas={areas}
      />
    </BrowserSources>
  );
}
