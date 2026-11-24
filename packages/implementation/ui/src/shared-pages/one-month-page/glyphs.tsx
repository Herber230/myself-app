/**
 * The page's drawings, declared once as SVG symbols and placed with `<use>`:
 * a friendly ghost, a heart and a rounded conga with a heart on it. Motifs, never anyone's character.
 *
 * Their colours are inline: what `<use>` draws is a copy no `.month-page`
 * selector reaches, but the copy still inherits the page's custom properties.
 */
export function MonthSymbols() {
  return (
    <svg className="month-symbols" width="0" height="0" aria-hidden="true">
      <defs>
        <symbol id="month-ghost" viewBox="0 0 64 72">
          <path
            style={{ fill: 'var(--month-ghost)' }}
            d="M32 4C16 4 6 16 6 32v34l8-6 8 6 10-6 10 6 8-6 8 6V32C58 16 48 4 32 4z"
          />
          <circle
            style={{ fill: 'var(--month-eye)' }}
            cx="24"
            cy="30"
            r="3.6"
          />
          <circle
            style={{ fill: 'var(--month-eye)' }}
            cx="40"
            cy="30"
            r="3.6"
          />
          <ellipse
            style={{ fill: 'var(--month-blush)', opacity: 0.7 }}
            cx="18"
            cy="39"
            rx="4"
            ry="2.4"
          />
          <ellipse
            style={{ fill: 'var(--month-blush)', opacity: 0.7 }}
            cx="46"
            cy="39"
            rx="4"
            ry="2.4"
          />
          <path
            style={{
              fill: 'none',
              stroke: 'var(--month-eye)',
              strokeWidth: 2,
              strokeLinecap: 'round',
            }}
            d="M28 42q4 4 8 0"
          />
        </symbol>
        <symbol id="month-heart" viewBox="0 0 32 30">
          <path
            style={{ fill: 'var(--month-blush)' }}
            d="M16 29S2 20 2 10a7 7 0 0 1 14-2 7 7 0 0 1 14 2c0 10-14 19-14 19z"
          />
        </symbol>
        <symbol id="month-conga" viewBox="0 0 60 120">
          {/* A rounded barrel, a little wider at the belly, like the real drum. */}
          <path
            style={{ fill: 'var(--month-conga)' }}
            d="M9 16C9 16 51 16 51 16C53 40 47 54 48 70C49 88 53 102 50 114C50 116 48 117 46 117H14C12 117 10 116 10 114C7 102 11 88 12 70C13 54 7 40 9 16Z"
          />
          <path
            style={{ fill: 'var(--month-conga-shine)' }}
            d="M16 24C15 42 19 56 18 72C17 88 15 100 17 110H21C19 100 22 88 23 72C24 56 20 42 21 24Z"
          />
          <rect
            style={{ fill: 'var(--month-blush)' }}
            x="10"
            y="28"
            width="40"
            height="4"
            rx="2"
          />
          <rect
            style={{ fill: 'var(--month-blush)' }}
            x="11"
            y="104"
            width="38"
            height="4"
            rx="2"
          />
          <path
            style={{ fill: 'var(--month-blush)' }}
            d="M30 76s-9-5.5-9-11a4.5 4.5 0 0 1 9-1.5a4.5 4.5 0 0 1 9 1.5c0 5.5-9 11-9 11z"
          />
          <ellipse
            style={{ fill: 'var(--month-skin)' }}
            cx="30"
            cy="16"
            rx="22"
            ry="6.5"
          />
          <ellipse
            style={{
              fill: 'none',
              stroke: 'var(--month-rim)',
              strokeWidth: 2.5,
            }}
            cx="30"
            cy="16"
            rx="22"
            ry="6.5"
          />
        </symbol>
      </defs>
    </svg>
  );
}

/** The thread with a knot in it, as one path: drawn on card 3, undone on card 6. */
export const KNOTTED_THREAD =
  'M10 60 C70 60 110 60 130 60 C160 60 175 20 150 18 C120 16 120 62 150 60 C175 58 170 32 150 40 C135 46 150 62 180 60 C220 58 250 60 290 60';

/** The same thread, loose. */
export const LOOSE_THREAD = 'M10 60 C100 60 200 60 290 60';

/** The string lights hung once the night warms up. */
const BULBS = [
  [25, 24],
  [55, 34],
  [85, 24],
  [125, 30],
  [160, 34],
  [200, 18],
  [240, 30],
  [275, 32],
  [320, 26],
  [360, 28],
  [390, 14],
] as const;

export function StringLights() {
  return (
    <svg
      className="month-lights"
      viewBox="0 0 400 64"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d="M0 10 Q50 50 100 18 T200 18 T300 18 T400 10" />
      {BULBS.map(([cx, cy]) => (
        <circle key={cx} cx={cx} cy={cy} r="3.5" />
      ))}
    </svg>
  );
}
