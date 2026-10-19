/**
 * The page's last picture: a spiral hill against a full moon, a black cat
 * with a little key at its feet, bats crossing the sky and snow falling on a
 * Halloween night. Every shape is drawn here: motifs, never anyone's
 * character. Decorative, and still under reduced motion (`spooky.css`).
 */

/** Snowflakes: where each falls from, how big it is, and when it starts. */
const FLAKES = [
  { x: 150, size: 6, delay: '0s' },
  { x: 230, size: 5, delay: '-4s' },
  { x: 300, size: 8, delay: '-8s' },
  { x: 380, size: 5, delay: '-2s' },
  { x: 560, size: 6, delay: '-6s' },
  { x: 620, size: 7, delay: '-10s' },
  { x: 660, size: 5, delay: '-3s' },
] as const;

/** Bats: where each flies, and its pace. */
const BATS = [
  { x: 330, y: 110, scale: 1, delay: '0s' },
  { x: 590, y: 100, scale: 0.75, delay: '-0.3s' },
  { x: 270, y: 160, scale: 0.6, delay: '-0.6s' },
] as const;

function Snowflake({ size }: { size: number }) {
  return (
    <g className="spooky-flake-shape">
      {[0, 60, 120].map(angle => (
        <line
          key={angle}
          x1={-size}
          x2={size}
          y1={0}
          y2={0}
          transform={`rotate(${angle})`}
        />
      ))}
    </g>
  );
}

function Bat() {
  return (
    <path
      className="spooky-bat-shape"
      d="M0 0q-6-8-18-6 5 4 4 9-6-2-12 2 8 0 10 6 6-6 12-3 2-5 4-8 2 3 4 8 6-3 12 3 2-6 10-6-6-4-12-2-1-5 4-9-12-2-18 6Z"
    />
  );
}

export function NightScene() {
  return (
    <svg
      aria-hidden="true"
      className="spooky-scene"
      viewBox="0 0 800 320"
      preserveAspectRatio="xMidYMax slice"
    >
      <circle className="spooky-scene-halo" cx="470" cy="148" r="96" />
      <circle className="spooky-scene-moon" cx="470" cy="148" r="70" />

      {FLAKES.map(({ x, size, delay }) => (
        <g
          key={x}
          className="spooky-flake"
          style={{ animationDelay: delay }}
          transform={`translate(${x} -20)`}
        >
          <Snowflake size={size} />
        </g>
      ))}

      {BATS.map(({ x, y, scale, delay }) => (
        <g key={x} transform={`translate(${x} ${y}) scale(${scale})`}>
          <g className="spooky-bat" style={{ animationDelay: delay }}>
            <Bat />
          </g>
        </g>
      ))}

      {/* The ground, and a hill curling into a spiral in front of the moon. */}
      <path className="spooky-scene-land" d="M0 274q200-20 400-4t400-6v56H0Z" />
      <g transform="translate(0 26)">
        <path
          className="spooky-scene-land"
          d="M250 276c80-10 160-36 204-80 18-18 26-32 28-46 6 52 40 96 110 124Z"
        />
        <path
          className="spooky-scene-curl"
          d="M330 266c70-24 128-60 152-112 20-42 2-80-36-78-30 2-36 38-12 44 18 4 24-14 12-20"
        />
      </g>

      {/* A black cat, sitting, its eyes catching the moon. */}
      <g className="spooky-cat" transform="translate(200 212)">
        <path
          className="spooky-scene-land"
          d="M-26 60c-4-28 4-46 14-54-8-8-10-20-6-30l-6-20 14 12q8-4 18 0l14-12-6 20c4 10 2 22-6 30 10 8 18 26 14 54Z"
        />
        <path
          className="spooky-cat-tail"
          d="M24 56c22 0 30-14 24-30-4-10 4-16 10-10"
        />
        <ellipse
          className="spooky-cat-eye"
          cx="-7"
          cy="-14"
          rx="3.5"
          ry="4.5"
        />
        <ellipse className="spooky-cat-eye" cx="9" cy="-14" rx="3.5" ry="4.5" />
      </g>

      {/* The little key, dropped in the grass. */}
      <g className="spooky-key" transform="translate(250 270) rotate(-18)">
        <circle cx="0" cy="0" r="7" />
        <circle className="spooky-key-hole" cx="0" cy="0" r="3" />
        <path d="M7 0h26M24 0v6M30 0v8" />
      </g>
    </svg>
  );
}
