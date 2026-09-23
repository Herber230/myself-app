/**
 * The hero's backdrop: the theme's gradient over a faint dot grid, and
 * infrastructure glyphs drifting behind the type. Decorative only — hidden from assistive technology, fetched from
 * nowhere, and still under reduced motion (`global.css`).
 */

/**
 * 24×24 line drawings in the manner of an architecture diagram, stroked in
 * `currentColor` at a hairline that does not scale with the glyph.
 */
const GLYPHS = {
  cloud: 'M7 18h10.5a4.5 4.5 0 0 0 .6-8.96A6 6 0 0 0 6.2 10.1 4 4 0 0 0 7 18Z',
  cloudUpload:
    'M7 18h10.5a4.5 4.5 0 0 0 .6-8.96A6 6 0 0 0 6.2 10.1 4 4 0 0 0 7 18ZM12 15.5v-5M9.75 12.75 12 10.5l2.25 2.25',
  cloudNetwork:
    'M8 12h8.5a3.5 3.5 0 0 0 .45-6.97A4.75 4.75 0 0 0 7.6 5.9 3.1 3.1 0 0 0 8 12ZM12 12v3.5M5 15.5h14M5 15.5V19M12 15.5V19M19 15.5V19',
  database:
    'M4 6c0-1.66 3.58-3 8-3s8 1.34 8 3-3.58 3-8 3-8-1.34-8-3ZM4 6v12c0 1.66 3.58 3 8 3s8-1.34 8-3V6M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3',
  server: 'M4 4h16v6H4zM4 14h16v6H4zM7 7h1M7 17h1M11 7h6M11 17h6',
  container:
    'M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3ZM12 12l8-4.5M12 12v9M12 12 4 7.5',
  chip: 'M7 7h10v10H7zM10 10h4v4h-4zM9.5 3v4M14.5 3v4M9.5 17v4M14.5 17v4M3 9.5h4M3 14.5h4M17 9.5h4M17 14.5h4',
  nodes:
    'M5 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM19 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM12 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM7 6h10M6 7.8l5 8.4M18 7.8l-5 8.4',
  code: 'M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 5l-3 14',
  branch:
    'M6 3.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM6 17.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM18 6.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM6 6.5v11M18 9.5c0 4-5 4.5-11.5 8',
  terminal: 'M3 5h18v14H3zM7 10l3 2-3 2M12 14h5',
} as const;

type Glyph = keyof typeof GLYPHS;

/**
 * Where each glyph sits, as percentages of the hero, clear of the type in the
 * middle; its size in rem; and its drift, a long, slow loop offset so no two
 * move together.
 */
const PLACEMENTS: readonly {
  glyph: Glyph;
  top: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
}[] = [
  { glyph: 'cloud', top: 10, left: 9, size: 4, duration: 34, delay: 0 },
  { glyph: 'database', top: 16, left: 80, size: 3.25, duration: 38, delay: -9 },
  { glyph: 'container', top: 36, left: 4, size: 3, duration: 31, delay: -15 },
  {
    glyph: 'cloudNetwork',
    top: 30,
    left: 90,
    size: 3.75,
    duration: 42,
    delay: -4,
  },
  { glyph: 'code', top: 6, left: 44, size: 2.5, duration: 29, delay: -20 },
  { glyph: 'server', top: 62, left: 12, size: 3, duration: 36, delay: -11 },
  {
    glyph: 'cloudUpload',
    top: 70,
    left: 78,
    size: 4.25,
    duration: 40,
    delay: -6,
  },
  { glyph: 'nodes', top: 84, left: 30, size: 3, duration: 33, delay: -17 },
  { glyph: 'chip', top: 52, left: 93, size: 2.5, duration: 30, delay: -24 },
  { glyph: 'branch', top: 86, left: 62, size: 2.75, duration: 35, delay: -13 },
  { glyph: 'terminal', top: 20, left: 26, size: 2.5, duration: 32, delay: -27 },
  { glyph: 'cloud', top: 48, left: 20, size: 2.25, duration: 44, delay: -31 },
];

export function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="hero-backdrop">
      {PLACEMENTS.map(({ glyph, top, left, size, duration, delay }) => (
        <svg
          key={`${glyph}-${top}-${left}`}
          className="hero-glyph"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.25}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            top: `${top}%`,
            left: `${left}%`,
            width: `${size}rem`,
            height: `${size}rem`,
            animationDuration: `${duration}s`,
            animationDelay: `${delay}s`,
          }}
        >
          <path d={GLYPHS[glyph]} vectorEffect="non-scaling-stroke" />
        </svg>
      ))}
    </div>
  );
}
