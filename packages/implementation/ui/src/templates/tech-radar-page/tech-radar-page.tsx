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
  type Quadrant,
  type Ring,
  type TechnologyArea,
} from '@myself-app/domain';
import {
  type RadarLayout,
  RingKey,
} from '@myself-app/entifix-incubator-react-controls';

import { siteT } from '../../i18n/server.js';
import { RadarExplorer } from '../../organisms/radar-explorer/radar-explorer.js';
import { SiteNav } from '../../organisms/site-nav/site-nav.js';
import type { SiteLocale } from '../../routing/site-locales.js';

export interface TechRadarPageData {
  readonly locale: SiteLocale;
  /** Laid out once at build, the same in every locale. */
  readonly layout: RadarLayout;
  /** Innermost first, as the chart draws them. */
  readonly rings: readonly Ring[];
  /** By index, as the chart numbers them: the ids the filter's URL uses. */
  readonly quadrants: readonly Quadrant[];
  readonly areas: readonly TechnologyArea[];
}

/**
 * The tech radar (ADR 0009, 0014): the chart and its legend, filtered in the
 * browser (#41) through `useSources()`, which the page mounts.
 */
export function TechRadarPageView({
  locale,
  layout,
  rings: ringRecords,
  quadrants: quadrantRecords,
  areas: areaRecords,
}: TechRadarPageData) {
  const t = siteT(locale);
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
      <SiteNav locale={locale} path="/tech-radar" />
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
