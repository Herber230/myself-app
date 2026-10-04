'use client';

/**
 * The radar with its filter (#41, ADR 0014, 0016): the one client part of the
 * page.
 *
 * The filter is the query string, read once hydrated, and answered by
 * entifix's `load` use case over `/data/technology.json` — the same use case
 * the build rendered the radar through. What the answer leaves out is dimmed,
 * so the radar keeps its shape. The static HTML is the whole radar, which is
 * also what a visitor without scripting gets, with no controls that could not
 * work.
 */
import { Stack, Text } from '@entifix/react-controls/primitives';
import { Technology } from '@myself-app/domain/entities/technology';
import { useUrlFilter } from '@myself-app/entifix-incubator-browser/react';
import {
  ActiveFilters,
  activeFiltersOf,
  FilterFieldset,
  FilterPanel,
  FilterSummary,
  RadarChart,
  type RadarLayout,
  SegmentedControl,
  ToggleGroup,
  useMediaQuery,
} from '@myself-app/entifix-incubator-react-controls';
import { type ReactNode, useMemo, useState } from 'react';

import { SlidersIcon } from '../../atoms/icons/icons.js';
import { fill } from '../../i18n/fill.js';
import { technologyPath } from '../../routing/radar-paths.js';
import type { SiteLocale } from '../../routing/site-locales.js';
import { useSources } from '../../sources/sources.js';
import { NOT_NARROW } from '../../theme/breakpoints.js';
import { RadarLegend } from '../radar-legend/radar-legend.js';
import {
  type RadarParam,
  radarQuery,
  type RadarVocabulary,
} from './radar-filter.js';

const NONE_DIMMED: ReadonlySet<string> = new Set();

/** Every string the controls show, translated at build. */
export interface RadarExplorerCopy {
  readonly chartLabel: string;
  /** The legend's heading. */
  readonly legend: string;
  /** The legend's fold toggle, while it is open and while it is closed. */
  readonly hideLegend: string;
  readonly showLegend: string;
  /** A quadrant's count in the legend: `{{n}}` is replaced. */
  readonly legendCount: string;
  /** The List | Chart switch on a narrow screen. */
  readonly view: string;
  readonly viewList: string;
  readonly viewChart: string;
  /** The zoomed quadrant's button: pressing it shows the whole radar. */
  readonly zoomOut: string;
  /** The fieldset's name, for assistive technology. */
  readonly filters: string;
  /** The card's header. */
  readonly title: string;
  /** `{{n}}` is replaced. */
  readonly active: string;
  /** `{{name}}` is replaced: an active filter's remove button. */
  readonly remove: string;
  readonly quadrant: string;
  readonly ring: string;
  readonly area: string;
  readonly search: string;
  /** What to type, while the search is empty. */
  readonly placeholder: string;
  readonly clear: string;
  /** `{{shown}}` and `{{total}}` are replaced. */
  readonly showing: string;
}

export interface RadarExplorerProps {
  readonly layout: RadarLayout;
  readonly locale: SiteLocale;
  /** Quadrant names, by quadrant index. */
  readonly quadrants: readonly string[];
  /** Ring names, innermost first. */
  readonly rings: readonly string[];
  /** What each ring means, innermost first: on the Ring chips. */
  readonly ringMeanings?: readonly string[];
  /** Area names, by id, in the order the controls list them. */
  readonly areas: readonly { readonly id: string; readonly name: string }[];
  /** The ids the query string names quadrants, rings and areas by. */
  readonly vocabulary: RadarVocabulary;
  readonly copy: RadarExplorerCopy;
  /** Between the picture and the legend: the ring key. */
  readonly children?: ReactNode;
}

export function RadarExplorer({
  layout,
  locale,
  quadrants,
  rings,
  ringMeanings = [],
  areas,
  vocabulary,
  copy,
  children,
}: RadarExplorerProps) {
  const query = useMemo(() => radarQuery(vocabulary), [vocabulary]);
  // `filter` is `null` in the static HTML, drawn unfiltered and without
  // controls.
  const sources = useSources();
  const { filter, filtering, kept, toggle, set, clear } = useUrlFilter<
    RadarParam,
    SiteLocale,
    Technology
  >(sources.technologies, query, locale);
  const dimmed = useMemo(
    () =>
      kept === undefined
        ? NONE_DIMMED
        : new Set(
            layout.blips
              .filter(blip => !kept.has(blip.id))
              .map(blip => blip.id),
          ),
    [kept, layout],
  );
  const [highlighted, setHighlighted] = useState<string>();
  const [view, setView] = useState<'list' | 'chart'>('list');
  // Open on a wide screen, closed on a phone, where the rows would push the
  // radar a screen down; the active chips stay in view either way.
  const wide = useMediaQuery(NOT_NARROW, true);

  const shown = layout.blips.length - dimmed.size;
  const quadrantOptions = quadrants.map((name, index) => ({
    key: vocabulary.quadrants[index] as string,
    name,
  }));
  // Each ring's dot is its blips' colour; its meaning, a tooltip.
  const ringOptions = rings.map((name, index) => ({
    key: vocabulary.rings[index] as string,
    name,
    swatch: `var(--color-radar-ring-${index + 1})`,
    description: ringMeanings[index],
  }));
  const ringNote =
    filter === null
      ? []
      : ringOptions.filter(
          ring =>
            filter.ring.includes(ring.key) && ring.description !== undefined,
        );
  const areaOptions = areas.map(area => ({ key: area.id, name: area.name }));

  // What is in force, in the rows' order, each chip removing its value.
  const active =
    filter === null
      ? []
      : activeFiltersOf({
          groups: [
            {
              param: 'quadrant',
              label: copy.quadrant,
              options: quadrantOptions,
            },
            { param: 'ring', label: copy.ring, options: ringOptions },
            { param: 'area', label: copy.area, options: areaOptions },
          ],
          selected: param => filter[param],
          search: { label: copy.search, text: filter.q[0] ?? '' },
          removeLabel: name => fill(copy.remove, { name }),
          onToggle: toggle,
          onClearSearch: () => set('q', []),
        });
  return (
    <Stack gap="l">
      {filter !== null && (
        <FilterPanel
          title={copy.title}
          icon={<SlidersIcon className="size-[1.1em]" />}
          activeLabel={
            active.length > 0
              ? fill(copy.active, { n: active.length })
              : undefined
          }
          open={wide}
          footer={
            <FilterSummary
              searchLabel={copy.search}
              search={filter.q[0] ?? ''}
              onSearch={text => set('q', [text])}
              placeholder={copy.placeholder}
              showing={fill(copy.showing, {
                shown,
                total: layout.blips.length,
              })}
              clearLabel={copy.clear}
              onClear={filtering ? clear : undefined}
            >
              {active.length > 0 && <ActiveFilters active={active} />}
            </FilterSummary>
          }
        >
          <FilterFieldset label={copy.filters}>
            <ToggleGroup
              label={copy.quadrant}
              options={quadrantOptions}
              selected={filter.quadrant}
              onToggle={quadrant => toggle('quadrant', quadrant)}
            />
            <ToggleGroup
              label={copy.ring}
              options={ringOptions}
              selected={filter.ring}
              onToggle={ring => toggle('ring', ring)}
              note={
                ringNote.length > 0 ? (
                  <dl className="m-0 grid grid-cols-[max-content_1fr] gap-x-2xs">
                    {ringNote.map(ring => (
                      <div key={ring.key} className="contents">
                        <dt className="font-medium text-content">
                          {ring.name}
                        </dt>
                        <dd className="m-0">{ring.description}</dd>
                      </div>
                    ))}
                  </dl>
                ) : undefined
              }
            />
            <ToggleGroup
              label={copy.area}
              options={areaOptions}
              selected={filter.area}
              onToggle={area => toggle('area', area)}
            />
          </FilterFieldset>
        </FilterPanel>
      )}
      {/* Side by side on a wide screen, the picture held in view while the
          legend scrolls past it. Below that, one at a time, through the
          List | Chart switch; with no script, both, the legend shown first
          as the primary view (#40). */}
      {filter !== null && (
        <SegmentedControl
          label={copy.view}
          options={[
            { key: 'list', label: copy.viewList },
            { key: 'chart', label: copy.viewChart },
          ]}
          value={view}
          onChange={setView}
          className="radar-view-switch"
        />
      )}
      <div
        className="radar-split grid gap-l"
        data-view={filter === null ? undefined : view}
      >
        <div className="radar-split-chart">
          <RadarChart
            layout={layout}
            locale={locale}
            hrefOf={id => technologyPath(locale, id)}
            quadrants={quadrants}
            rings={rings}
            label={copy.chartLabel}
            dimmed={dimmed}
            highlighted={highlighted}
            onHighlight={setHighlighted}
            {...(filter !== null && {
              onQuadrant: (index: number) =>
                toggle('quadrant', vocabulary.quadrants[index] as string),
              selectedQuadrants: vocabulary.quadrants.flatMap((key, index) =>
                filter.quadrant.includes(key) ? [index] : [],
              ),
              // One quadrant chosen: it fills the picture.
              zoom:
                filter.quadrant.length === 1
                  ? vocabulary.quadrants.indexOf(filter.quadrant[0] as string)
                  : undefined,
              zoomOutLabel: copy.zoomOut,
            })}
          />
        </div>
        {/* The list folds into a tab on a wide screen, and the picture takes
            the room; a `<details>`, so it folds with no script. Open in the
            HTML; folded there before paint (`FoldScript`, from the page). */}
        <div className="radar-split-legend">
          <details
            className="radar-legend-panel"
            open
            // The page's `FoldScript` folds it before hydration on a wide screen.
            suppressHydrationWarning
          >
            <summary className="radar-legend-toggle">
              <svg
                className="radar-legend-toggle-icon"
                viewBox="0 0 16 16"
                aria-hidden="true"
                focusable="false"
              >
                <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" />
                <path d="M10 2.5v11" />
              </svg>
              <span className="radar-legend-when-open">{copy.hideLegend}</span>
              <span className="radar-legend-when-closed">
                {copy.showLegend}
              </span>
            </summary>
            <Stack gap="l" className="radar-legend-body @container">
              {children}
              <Stack gap="s">
                <Text as="h2" step={2} weight="semibold">
                  {copy.legend}
                </Text>
                <RadarLegend
                  layout={layout}
                  locale={locale}
                  quadrants={quadrants}
                  rings={rings}
                  countLabel={copy.legendCount}
                  dimmed={dimmed}
                  highlighted={highlighted}
                  onHighlight={setHighlighted}
                />
              </Stack>
            </Stack>
          </details>
        </div>
      </div>
    </Stack>
  );
}
