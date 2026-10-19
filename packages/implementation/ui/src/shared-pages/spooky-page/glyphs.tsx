/**
 * The page's drawings, as inline SVG: a ghost and a jack-o'-lantern, both
 * friendly, coloured by the page's palette (`spooky.css`). Decorative: the
 * words around them say what they show.
 */

export function GhostGlyph({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={['spooky-ghost', className].filter(Boolean).join(' ')}
      viewBox="0 0 100 120"
    >
      <path
        className="spooky-ghost-body"
        d="M10 110V50a40 40 0 0 1 80 0v60l-10-9-10 9-10-9-10 9-10-9-10 9-10-9Z"
      />
      <ellipse className="spooky-ghost-eye" cx="36" cy="50" rx="6" ry="8" />
      <ellipse className="spooky-ghost-eye" cx="64" cy="50" rx="6" ry="8" />
      <ellipse className="spooky-ghost-cheek" cx="27" cy="64" rx="6" ry="3.5" />
      <ellipse className="spooky-ghost-cheek" cx="73" cy="64" rx="6" ry="3.5" />
      <path className="spooky-ghost-mouth" d="M44 66q6 6 12 0" />
    </svg>
  );
}

export function PumpkinGlyph({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={['spooky-pumpkin', className].filter(Boolean).join(' ')}
      viewBox="0 0 120 110"
    >
      <path
        className="spooky-pumpkin-stem"
        d="M56 24q-2-14 10-20l4 5q-8 5-6 15Z"
      />
      <ellipse className="spooky-pumpkin-rib" cx="38" cy="66" rx="30" ry="40" />
      <ellipse className="spooky-pumpkin-rib" cx="82" cy="66" rx="30" ry="40" />
      <ellipse
        className="spooky-pumpkin-body"
        cx="60"
        cy="66"
        rx="30"
        ry="42"
      />
      <path className="spooky-pumpkin-face" d="M38 58l10-10 10 10Z" />
      <path className="spooky-pumpkin-face" d="M62 58l10-10 10 10Z" />
      <path
        className="spooky-pumpkin-face"
        d="M36 74q24 22 48 0l-8 4-6-5-6 6-6-6-6 5Z"
      />
    </svg>
  );
}

/** A sewing button: four holes, a rim, and a cross of thread. */
export function ButtonGlyph({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={['spooky-button', className].filter(Boolean).join(' ')}
      viewBox="0 0 40 40"
    >
      <circle className="spooky-button-face" cx="20" cy="20" r="18" />
      <circle className="spooky-button-rim" cx="20" cy="20" r="13" />
      <path className="spooky-button-thread" d="M15 15l10 10M25 15 15 25" />
      {[
        [15, 15],
        [25, 15],
        [15, 25],
        [25, 25],
      ].map(([cx, cy]) => (
        <circle
          key={`${cx}-${cy}`}
          className="spooky-button-hole"
          cx={cx}
          cy={cy}
          r="2.6"
        />
      ))}
    </svg>
  );
}

export function HeartGlyph({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={['spooky-heart', className].filter(Boolean).join(' ')}
      viewBox="0 0 24 22"
    >
      <path d="M12 21S1 14 1 7a5.5 5.5 0 0 1 11-1.5A5.5 5.5 0 0 1 23 7c0 7-11 14-11 14Z" />
    </svg>
  );
}
