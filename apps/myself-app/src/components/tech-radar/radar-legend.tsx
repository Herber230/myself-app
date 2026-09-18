/**
 * The radar as text: every blip, by quadrant and ring, with the number the
 * chart prints inside it.
 *
 * This is the accessible path (#40), not a supplement — an SVG of numbered
 * shapes says nothing to a screen reader, and on a phone the legend is the
 * primary view. It stays a server component, and it renders from the same
 * layout as the chart, so the two cannot disagree.
 */
import { Stack, Text } from '@entifix/react-controls/primitives';

import type { SiteLocale } from '../../site-locales';
import { RING_INDICES } from './geometry';
import type { PlacedBlip, RadarLayout } from './types';

export interface RadarLegendProps {
  readonly layout: RadarLayout;
  readonly locale: SiteLocale;
  /** Quadrant names, by quadrant index. */
  readonly quadrants: readonly string[];
  /** Ring names, innermost first. */
  readonly rings: readonly string[];
}

export function RadarLegend({
  layout,
  locale,
  quadrants,
  rings,
}: RadarLegendProps) {
  return (
    <div className="grid grid-cols-1 gap-l sm:grid-cols-2">
      {quadrants.map((quadrant, index) => (
        <section key={quadrant} aria-labelledby={`radar-quadrant-${index}`}>
          <Stack gap="s">
            <Text
              as="h3"
              id={`radar-quadrant-${index}`}
              step={1}
              weight="semibold"
            >
              {quadrant}
            </Text>
            {RING_INDICES.map(ring => (
              <RingList
                key={ring}
                name={rings[ring]}
                blips={blipsIn(layout, index, ring)}
                locale={locale}
              />
            ))}
          </Stack>
        </section>
      ))}
    </div>
  );
}

function RingList({
  name,
  blips,
  locale,
}: {
  name: string;
  blips: readonly PlacedBlip[];
  locale: SiteLocale;
}) {
  if (blips.length === 0) return null;
  return (
    <Stack gap="2xs">
      <Text as="h4" step={0} weight="semibold" muted>
        {name}
      </Text>
      <ul className="m-0 list-none p-0">
        {blips.map(blip => (
          <li key={blip.id} className="flex gap-2xs">
            <span
              aria-hidden
              className="inline-block min-w-[2ch] text-right tabular-nums text-content-muted"
            >
              {blip.number}
            </span>
            <span>{blip.label[locale]}</span>
          </li>
        ))}
      </ul>
    </Stack>
  );
}

function blipsIn(layout: RadarLayout, quadrant: number, ring: number) {
  return layout.blips
    .filter(blip => blip.quadrant === quadrant && blip.ring === ring)
    .sort((a, b) => a.number - b.number);
}
