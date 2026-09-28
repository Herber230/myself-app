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
import { staticJsonSource } from '@myself-app/entifix-browser';
import { useEntityLoad, useUrlState } from '@myself-app/entifix-browser/react';
import { type ReactNode, useMemo, useState } from 'react';

import type { SiteLocale } from '../../site-locales';
import {
  FilterFieldset,
  FilterSummary,
  toggled,
  ToggleGroup,
} from '../filters';
import { RadarChart } from './radar-chart';
import { radarQuery, type RadarVocabulary } from './radar-filter';
import { RadarLegend } from './radar-legend';
import type { RadarLayout } from './types';

/** Every technology, as the export writes them (ADR 0003, 0016). */
const TECHNOLOGIES = staticJsonSource(Technology, '/data/technology.json');

const NONE_DIMMED: ReadonlySet<string> = new Set();

/** Every string the controls show, translated at build. */
export interface RadarExplorerCopy {
  readonly chartLabel: string;
  /** The legend's heading. */
  readonly legend: string;
  readonly filters: string;
  readonly quadrant: string;
  readonly ring: string;
  readonly area: string;
  readonly search: string;
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
  areas,
  vocabulary,
  copy,
  children,
}: RadarExplorerProps) {
  const query = useMemo(() => radarQuery(vocabulary), [vocabulary]);
  // `null` in the static HTML, which is drawn unfiltered and without controls.
  const [filter, update] = useUrlState(query);
  const filtering = filter !== null && !query.isEmpty(filter);
  const load = useEntityLoad<Technology>(
    TECHNOLOGIES,
    filtering ? query.request(filter, locale) : null,
  );
  // While a new answer is on its way, the last one stays on screen.
  const page =
    load.status === 'done'
      ? load.page
      : load.status === 'pending'
        ? load.previous
        : undefined;
  const dimmed = useMemo(() => {
    if (page === undefined) return NONE_DIMMED;
    const kept = new Set(page.items.map(technology => String(technology.id)));
    return new Set(
      layout.blips.filter(blip => !kept.has(blip.id)).map(blip => blip.id),
    );
  }, [page, layout]);
  const [highlighted, setHighlighted] = useState<string>();

  const shown = layout.blips.length - dimmed.size;
  return (
    <Stack gap="l">
      {filter !== null && (
        <FilterFieldset label={copy.filters}>
          <ToggleGroup
            label={copy.quadrant}
            options={quadrants.map((name, index) => ({
              key: vocabulary.quadrants[index] as string,
              name,
            }))}
            selected={filter.quadrant}
            onToggle={quadrant =>
              update({
                ...filter,
                quadrant: toggled(filter.quadrant, quadrant),
              })
            }
          />
          <ToggleGroup
            label={copy.ring}
            options={rings.map((name, index) => ({
              key: vocabulary.rings[index] as string,
              name,
            }))}
            selected={filter.ring}
            onToggle={ring =>
              update({ ...filter, ring: toggled(filter.ring, ring) })
            }
          />
          <ToggleGroup
            label={copy.area}
            options={areas.map(area => ({ key: area.id, name: area.name }))}
            selected={filter.area}
            onToggle={area =>
              update({ ...filter, area: toggled(filter.area, area) })
            }
          />
          <FilterSummary
            searchLabel={copy.search}
            search={filter.q[0] ?? ''}
            onSearch={text => update({ ...filter, q: [text] })}
            showing={copy.showing
              .replace('{{shown}}', String(shown))
              .replace('{{total}}', String(layout.blips.length))}
            clearLabel={copy.clear}
            onClear={filtering ? () => update(query.empty) : undefined}
          />
        </FilterFieldset>
      )}
      {/* On a phone the picture goes last: too small to read there, it
          follows the legend, which is the primary view (#40). */}
      <div className="max-sm:order-last">
        <RadarChart
          layout={layout}
          locale={locale}
          quadrants={quadrants}
          rings={rings}
          label={copy.chartLabel}
          dimmed={dimmed}
          highlighted={highlighted}
          onHighlight={setHighlighted}
        />
      </div>
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
          dimmed={dimmed}
          highlighted={highlighted}
          onHighlight={setHighlighted}
        />
      </Stack>
    </Stack>
  );
}
