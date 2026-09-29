import {
  Card,
  Center,
  Lead,
  Stack,
  Text,
} from '@entifix/react-controls/primitives';
import {
  localize,
  type LocalizedText,
  Quadrant,
  Ring,
  TechnologyArea,
} from '@myself-app/domain';
import { loadRadarPlacements } from '@myself-app/domain/use-cases';
import {
  layoutRadar,
  RingKey,
} from '@myself-app/entifix-incubator-react-controls';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { SiteNav } from '../../../components/site-nav';
import { radarEntriesOf } from '../../../components/tech-radar/entries';
import { RadarExplorer } from '../../../components/tech-radar/radar-explorer';
import { SITE_CONTENT } from '../../../composition';
import { siteT } from '../../../i18n/server';
import {
  isSiteLocale,
  localeAlternates,
  SITE_DEFAULT_LOCALE,
} from '../../../site-locales';

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
  const t = siteT(locale);
  const [layout, ringRecords, quadrantRecords, areaRecords] = await Promise.all(
    [LAYOUT, RINGS, QUADRANTS, AREAS],
  );
  const quadrants = [
    t('radar.quadrants.techniques'),
    t('radar.quadrants.tools'),
    t('radar.quadrants.platforms'),
    t('radar.quadrants.languages'),
  ];
  const rings = [
    t('radar.rings.adopt'),
    t('radar.rings.trial'),
    t('radar.rings.assess'),
    t('radar.rings.hold'),
  ];
  const areas = areaRecords
    .map(area => ({
      id: String(area.id),
      name: localize(area.name as LocalizedText, locale),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, locale));
  return (
    <>
      <SiteNav locale={locale} path={PATH} />
      <Center as="main" gutters className="py-2xl">
        <Card>
          <Stack gap="l">
            <Stack gap="s">
              <Text as="h1" step={3} weight="semibold">
                {t('techRadar')}
              </Text>
              <Lead muted>{t('techRadarLead')}</Lead>
            </Stack>
            <RadarExplorer
              layout={layout}
              locale={locale}
              quadrants={quadrants}
              rings={rings}
              areas={areas}
              vocabulary={{
                quadrants: quadrantRecords.map(each => String(each.id)),
                rings: ringRecords.map(each => String(each.id)),
                areas: areas.map(area => area.id),
              }}
              copy={{
                chartLabel: t('radar.chartLabel'),
                legend: t('radar.legend'),
                filters: t('radar.filter.label'),
                quadrant: t('radar.filter.quadrant'),
                ring: t('radar.filter.ring'),
                area: t('radar.filter.area'),
                search: t('radar.filter.search'),
                clear: t('radar.filter.clear'),
                showing: t('radar.filter.showing', {
                  shown: '{{shown}}',
                  total: '{{total}}',
                }),
              }}
            >
              <Stack gap="s">
                <Text as="h2" step={2} weight="semibold">
                  {t('radar.ringKey')}
                </Text>
                <RingKey
                  rings={ringRecords.map((ring, index) => ({
                    name: rings[index],
                    meaning: localize(
                      ring.description as LocalizedText,
                      locale,
                    ),
                  }))}
                />
              </Stack>
            </RadarExplorer>
          </Stack>
        </Card>
      </Center>
    </>
  );
}
