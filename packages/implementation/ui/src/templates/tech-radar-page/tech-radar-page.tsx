import { Card, Center, Stack } from '@entifix/react-controls/primitives';
import {
  localize,
  type LocalizedText,
  type Quadrant,
  type Ring,
  type TechnologyArea,
} from '@myself-app/domain';
import {
  FoldScript,
  type RadarLayout,
} from '@myself-app/entifix-incubator-react-controls';

import { siteT } from '../../i18n/server.js';
import { PageHeader } from '../../molecules/page-header/page-header.js';
import { RadarExplorer } from '../../organisms/radar-explorer/radar-explorer.js';
import { SiteNav } from '../../organisms/site-nav/site-nav.js';
import type { SiteLocale } from '../../routing/site-locales.js';
import { NOT_WIDE, WIDE } from '../../theme/breakpoints.js';

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
      <Center as="main" gutters className="radar-main py-2xl">
        <Card className="radar-card">
          <Stack gap="l">
            <PageHeader title={t('techRadar')} lead={t('techRadarLead')} />
            <RadarExplorer
              layout={layout}
              locale={locale}
              quadrants={quadrants}
              rings={rings}
              ringMeanings={ringRecords.map(ring =>
                localize(ring.description as LocalizedText, locale),
              )}
              areas={areas}
              vocabulary={{
                quadrants: quadrantRecords.map(each => String(each.id)),
                rings: ringRecords.map(each => String(each.id)),
                areas: areas.map(area => area.id),
              }}
              copy={{
                chartLabel: t('radar.chartLabel'),
                legend: t('radar.legend'),
                hideLegend: t('radar.legendHide'),
                showLegend: t('radar.legendShow'),
                legendCount: t('radar.legendCount', { n: '{{n}}' }),
                view: t('radar.view.label'),
                viewList: t('radar.view.list'),
                viewChart: t('radar.view.chart'),
                zoomOut: t('radar.zoomOut'),
                filters: t('radar.filter.label'),
                quadrant: t('radar.filter.quadrant'),
                ring: t('radar.filter.ring'),
                area: t('radar.filter.area'),
                search: t('radar.filter.search'),
                placeholder: t('radar.filter.placeholder'),
                title: t('radar.filter.title'),
                active: t('radar.filter.active', { n: '{{n}}' }),
                remove: t('radar.filter.remove', { name: '{{name}}' }),
                clear: t('radar.filter.clear'),
                showing: t('radar.filter.showing', {
                  shown: '{{shown}}',
                  total: '{{total}}',
                }),
              }}
            />
            {/* On a wide screen the picture is the view and the list a tab
                beside it, folded; below that the list is the primary view
                (#40), its quadrants folded to four rows. */}
            <FoldScript
              folds={[
                { query: WIDE, selector: '.radar-legend-panel' },
                { query: NOT_WIDE, selector: '.radar-legend-quadrant' },
              ]}
            />
          </Stack>
        </Card>
      </Center>
    </>
  );
}
