/**
 * The backdrop behind a page's sections: fragments of code and engineering
 * diagrams on a blueprint grid, tiled down the page and scrolling slower than
 * the content in front of it (`site.css`). Decorative only — hidden from
 * assistive technology, drawn inline so the text uses the site's mono font,
 * and still under reduced motion.
 */

/**
 * One tile, in SVG user units, a whole number of grid squares so the grid
 * has no seam. The layer is wider than the page by a tile each side
 * (`site.css`), so one tile sits centred on it.
 */
const TILE = { width: 1200, height: 1488 } as const;

/** Code, as it is written in this repository, set in the mono font. */
const SNIPPETS: readonly {
  x: number;
  y: number;
  lines: readonly string[];
}[] = [
  {
    x: 60,
    y: 90,
    lines: [
      "@Entity({ key: 'technology' })",
      'export class Technology extends EntifixEntity {',
      "  @Member({ type: 'string', required: true })",
      '  accessor #name: LocalizedText;',
      '',
      '  @Link({ target: () => Ring, filterable: true })',
      '  accessor #ring: Ring;',
      '}',
    ],
  },
  {
    x: 700,
    y: 560,
    lines: [
      "const bucket = new aws.s3.BucketV2('site', {",
      '  forceDestroy: false,',
      '});',
      '',
      "new aws.cloudfront.Distribution('cdn', {",
      '  origins: [{ domainName: bucket.regional… }],',
      "  defaultRootObject: 'index.html',",
      '});',
    ],
  },
  {
    x: 80,
    y: 1060,
    lines: [
      'function handler(event) {',
      '  const uri = event.request.uri;',
      "  if (uri.endsWith('/')) {",
      "    event.request.uri += 'index.html';",
      '  }',
      '  return event.request;',
      '}',
    ],
  },
  {
    x: 760,
    y: 1240,
    lines: [
      '$ pnpm nx affected -t lint,test,build',
      '✔ nx run domain:build',
      '✔ nx run implementation-ui:test',
      '  Coverage: 100% statements',
    ],
  },
];

/** A box in a diagram, with its label. */
interface Node {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly label: string;
  readonly shape?: 'box' | 'store';
}

/** Each diagram: its boxes, and the arrows between them as SVG paths. */
const DIAGRAMS: readonly {
  nodes: readonly Node[];
  arrows: readonly string[];
  dashed?: readonly string[];
}[] = [
  // The request path: a browser, the CDN, its function and the bucket.
  {
    nodes: [
      { x: 700, y: 110, w: 130, h: 56, label: 'browser' },
      { x: 900, y: 110, w: 150, h: 56, label: 'CloudFront' },
      { x: 900, y: 250, w: 150, h: 56, label: 'viewer-request' },
      { x: 1090, y: 105, w: 80, h: 66, label: 'S3', shape: 'store' },
    ],
    arrows: ['M830 138H900', 'M1050 138H1090', 'M975 166V250'],
    dashed: ['M975 306C975 360 760 360 765 166'],
  },
  // The layers, and the direction of their dependencies.
  {
    nodes: [
      { x: 80, y: 520, w: 200, h: 52, label: 'app' },
      { x: 40, y: 640, w: 150, h: 52, label: 'ui' },
      { x: 220, y: 640, w: 150, h: 52, label: 'adapters' },
      { x: 130, y: 760, w: 150, h: 52, label: 'domain' },
      { x: 400, y: 760, w: 150, h: 52, label: 'incubator' },
      { x: 400, y: 640, w: 120, h: 62, label: 'content', shape: 'store' },
    ],
    arrows: [
      'M140 572L115 640',
      'M220 572L295 640',
      'M115 692L190 760',
      'M295 692L220 760',
      'M370 666H400',
      'M280 786H400',
    ],
  },
  // A sequence: the page asks, the use case loads, the repository answers.
  {
    nodes: [
      { x: 470, y: 960, w: 110, h: 40, label: 'page' },
      { x: 640, y: 960, w: 110, h: 40, label: 'loadAll' },
      { x: 810, y: 960, w: 130, h: 40, label: 'repository' },
    ],
    arrows: ['M525 1050H695', 'M695 1100H875'],
    dashed: [
      'M525 1000V1220',
      'M695 1000V1220',
      'M875 1000V1220',
      'M875 1160H525',
    ],
  },
];

/** The radar's rings and axes, as a sketch. */
const RINGS = [40, 80, 120, 160] as const;

export function SiteBackdrop() {
  return (
    <div aria-hidden="true" className="site-backdrop">
      <div className="site-backdrop-track">
        <svg className="site-backdrop-layer" width="100%" height="100%">
          <defs>
            <pattern
              id="site-backdrop-grid"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <path d="M24 0H0V24" className="site-backdrop-grid" />
            </pattern>
            <marker
              id="site-backdrop-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M0 0L10 5L0 10Z" fill="currentColor" />
            </marker>
            <pattern
              id="site-backdrop-tile"
              width={TILE.width}
              height={TILE.height}
              patternUnits="userSpaceOnUse"
            >
              <rect
                width={TILE.width}
                height={TILE.height}
                fill="url(#site-backdrop-grid)"
              />
              {SNIPPETS.map(({ x, y, lines }) => (
                <text
                  key={`${x}-${y}`}
                  className="site-backdrop-code"
                  x={x}
                  y={y}
                >
                  {lines.map((line, index) => (
                    <tspan key={index} x={x} dy={index === 0 ? 0 : '1.6em'}>
                      {line}
                    </tspan>
                  ))}
                </text>
              ))}
              {DIAGRAMS.map(({ nodes, arrows, dashed = [] }, index) => (
                <g key={index} className="site-backdrop-diagram">
                  {nodes.map(({ x, y, w, h, label, shape = 'box' }) => (
                    <g key={label}>
                      {shape === 'store' ? (
                        <path
                          d={`M${x} ${y + 8}v${h - 16}c0 10 ${w} 10 ${w} 0v${16 - h}M${x} ${y + 8}c0-10 ${w}-10 ${w} 0s-${w} 10-${w} 0`}
                        />
                      ) : (
                        <rect x={x} y={y} width={w} height={h} rx="4" />
                      )}
                      <text
                        className="site-backdrop-label"
                        x={x + w / 2}
                        y={y + h / 2 + 5}
                      >
                        {label}
                      </text>
                    </g>
                  ))}
                  {arrows.map(d => (
                    <path key={d} d={d} markerEnd="url(#site-backdrop-arrow)" />
                  ))}
                  {dashed.map(d => (
                    <path key={d} d={d} className="site-backdrop-dashed" />
                  ))}
                </g>
              ))}
              <g className="site-backdrop-diagram">
                {RINGS.map(r => (
                  <circle key={r} cx="1020" cy="860" r={r} />
                ))}
                <path d="M1020 680V1040M840 860H1200" />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#site-backdrop-tile)" />
        </svg>
      </div>
    </div>
  );
}
