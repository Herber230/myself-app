'use client';

/**
 * The radar with its filter (#41, ADR 0014): the one client part of the page.
 *
 * It filters the layout the build passed down and dims what it leaves out, so
 * the radar keeps its shape and no entifix code reaches the browser. The
 * filter is the query string, read once hydrated: the static HTML is the whole
 * radar, which is also what a visitor without scripting gets, with no controls
 * that could not work.
 */
import { Stack, Text } from '@entifix/react-controls/primitives';
import { type ReactNode, useMemo, useState, useSyncExternalStore } from 'react';

import type { SiteLocale } from '../../site-locales';
import { RadarChart } from './radar-chart';
import {
  isFiltering,
  matches,
  NO_FILTER,
  parseFilter,
  type RadarFilter,
  type RadarVocabulary,
  serializeFilter,
  toggled,
} from './radar-filter';
import { RadarLegend } from './radar-legend';
import type { QuadrantIndex, RadarLayout, RingIndex } from './types';

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

/** Tells the explorer the query string changed under it. */
const SEARCH_CHANGED = 'radar-search-changed';

function subscribe(onChange: () => void) {
  window.addEventListener('popstate', onChange);
  window.addEventListener(SEARCH_CHANGED, onChange);
  return () => {
    window.removeEventListener('popstate', onChange);
    window.removeEventListener(SEARCH_CHANGED, onChange);
  };
}

const noSubscription = () => () => undefined;

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
  const hydrated = useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  );
  // `null` in the static HTML, which is drawn unfiltered.
  const search = useSyncExternalStore(
    subscribe,
    () => window.location.search,
    () => null,
  );
  const filter = useMemo(
    () => (search === null ? NO_FILTER : parseFilter(search, vocabulary)),
    [search, vocabulary],
  );
  const dimmed = useMemo(
    () =>
      new Set(
        layout.blips
          .filter(blip => !matches(blip, filter, locale))
          .map(blip => blip.id),
      ),
    [layout, filter, locale],
  );
  const [highlighted, setHighlighted] = useState<string>();

  const update = (next: RadarFilter) => {
    const url = new URL(window.location.href);
    url.search = serializeFilter(next, vocabulary);
    window.history.replaceState(window.history.state, '', url);
    window.dispatchEvent(new Event(SEARCH_CHANGED));
  };

  const shown = layout.blips.length - dimmed.size;
  return (
    <Stack gap="l">
      {hydrated && (
        <fieldset className="radar-filters">
          <legend className="sr-only">{copy.filters}</legend>
          <Stack gap="s">
            <ToggleGroup
              label={copy.quadrant}
              options={quadrants.map((name, index) => ({
                key: index as QuadrantIndex,
                name,
              }))}
              selected={filter.quadrants}
              onToggle={quadrant =>
                update({
                  ...filter,
                  quadrants: toggled(filter.quadrants, quadrant),
                })
              }
            />
            <ToggleGroup
              label={copy.ring}
              options={rings.map((name, index) => ({
                key: index as RingIndex,
                name,
              }))}
              selected={filter.rings}
              onToggle={ring =>
                update({ ...filter, rings: toggled(filter.rings, ring) })
              }
            />
            <ToggleGroup
              label={copy.area}
              options={areas.map(area => ({ key: area.id, name: area.name }))}
              selected={filter.areas}
              onToggle={area =>
                update({ ...filter, areas: toggled(filter.areas, area) })
              }
            />
            <div className="radar-filter-row">
              <label className="radar-search">
                <span className="radar-filter-label">{copy.search}</span>
                <input
                  type="search"
                  value={filter.query}
                  onChange={event =>
                    update({ ...filter, query: event.currentTarget.value })
                  }
                />
              </label>
              <output aria-live="polite" className="radar-filter-count">
                {copy.showing
                  .replace('{{shown}}', String(shown))
                  .replace('{{total}}', String(layout.blips.length))}
              </output>
              {isFiltering(filter) && (
                <button
                  type="button"
                  className="radar-filter-clear"
                  onClick={() => update(NO_FILTER)}
                >
                  {copy.clear}
                </button>
              )}
            </div>
          </Stack>
        </fieldset>
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

function ToggleGroup<T extends string | number>({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: readonly { key: T; name: string }[];
  selected: readonly T[];
  onToggle: (key: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="radar-filter-row">
      <span aria-hidden className="radar-filter-label">
        {label}
      </span>
      {options.map(option => (
        <button
          key={option.key}
          type="button"
          className="landing-chip"
          aria-pressed={selected.includes(option.key)}
          onClick={() => onToggle(option.key)}
        >
          {option.name}
        </button>
      ))}
    </div>
  );
}
