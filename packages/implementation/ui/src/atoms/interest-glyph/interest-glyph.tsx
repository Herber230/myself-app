/**
 * An interest's line drawing, in the manner of `ProjectGlyph`: 48×48, stroked
 * in `currentColor` at a hairline, decorative (the heading names it). Each
 * stroke is `pathLength` 1, so a hover can redraw it (`site.css`).
 */
import type { CSSProperties } from 'react';

const GLYPHS: Readonly<Record<string, readonly string[]>> = {
  // A sport bike: its wheels, its frame, its tank and its bars.
  motorcycles: [
    'M4 33a7 7 0 1 0 14 0a7 7 0 1 0-14 0',
    'M30 33a7 7 0 1 0 14 0a7 7 0 1 0-14 0',
    'M11 33l7-9h11l8 9',
    'M17 24l5-6h7l3 6',
    'M32 18l3-5h4',
  ],
  // An open book, and a star over it.
  reading: [
    'M24 16c-5-3-11-3-17-1v23c6-2 12-2 17 1c5-3 11-3 17-1V15c-6-2-12-2-17 1z',
    'M24 16v23',
    'M38 4v6M35 7h6',
  ],
  // Two notes, beamed: the music the dance follows.
  salsa: [
    'M18 35V13l20-5v22',
    'M18 19l20-5',
    'M10 35a5 4 0 1 0 10 0a5 4 0 1 0-10 0',
    'M30 30a5 4 0 1 0 10 0a5 4 0 1 0-10 0',
  ],
};

/** Any other interest: a heart. */
const FALLBACK = [
  'M24 40S7 30 7 18a8 8 0 0 1 17-3a8 8 0 0 1 17 3c0 12-17 22-17 22z',
];

export function InterestGlyph({
  interest,
  className = 'interest-glyph',
}: {
  interest: string;
  className?: string;
}) {
  const strokes = GLYPHS[interest] ?? FALLBACK;
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {strokes.map((d, index) => (
        <path
          key={d}
          d={d}
          pathLength={1}
          vectorEffect="non-scaling-stroke"
          style={{ '--stroke-order': index } as CSSProperties}
        />
      ))}
    </svg>
  );
}
