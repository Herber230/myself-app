/**
 * A project's line drawing on its landing card (#77), in the manner of the
 * hero's glyphs: 48×48, stroked in `currentColor` at a hairline. Decorative —
 * the card's heading names the project. Each stroke is `pathLength` 1, so the
 * card's hover can redraw it (`site.css`); still under reduced motion.
 */
import type { CSSProperties } from 'react';

/** Each project's drawing, as the strokes it is made of. */
const GLYPHS: Readonly<Record<string, readonly string[]>> = {
  // An entity, its metadata fanning out to what it drives.
  entifix: [
    'M8 18h14v12H8z',
    'M11 22h8M11 26h5',
    'M22 24h6',
    'M28 24 34 12M28 24h8M28 24l6 12',
    'M34 8h8v8h-8zM36 20h8v8h-8zM34 32h8v8h-8z',
  ],
  // A browser window over a CDN and its bucket.
  'myself-app': [
    'M6 8h36v22H6z',
    'M6 13h36M10 10.5h1M13 10.5h1',
    'M12 19h14M12 23h9',
    'M24 30v5',
    'M16 35h16l-2 6H18z',
  ],
};

/** Any other project: a folder, since a project is a repository. */
const FALLBACK = ['M6 14h14l4 4h18v20H6z', 'M6 20h36'];

export function ProjectGlyph({ project }: { project: string }) {
  const strokes = GLYPHS[project] ?? FALLBACK;
  return (
    <svg
      aria-hidden="true"
      className="project-glyph"
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
