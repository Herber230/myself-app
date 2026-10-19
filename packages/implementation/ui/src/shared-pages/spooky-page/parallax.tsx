/**
 * The page's backdrop: two layers of silhouettes — a crooked town, curling
 * trees, a little door with its keyhole, a cat on a fence, a stitched
 * tombstone, dragonflies — scrolling slower than the words in front of them,
 * the far layer slower still (`spooky.css`). Motifs only, every one drawn
 * here. Decorative, and still under reduced motion.
 */

import { ParallaxLag } from './parallax-lag.js';

type Motif =
  | 'town'
  | 'tree'
  | 'door'
  | 'fenceCat'
  | 'tomb'
  | 'dragonfly'
  | 'swirl'
  | 'moon'
  | 'bat';

const VIEW_BOXES: Record<Motif, string> = {
  town: '0 0 160 120',
  tree: '0 0 100 140',
  door: '0 0 60 90',
  fenceCat: '0 0 140 100',
  tomb: '0 0 60 72',
  dragonfly: '0 0 80 60',
  swirl: '0 0 60 60',
  moon: '0 0 60 60',
  bat: '-30 -14 60 28',
};

const FENCE_POSTS = [4, 34, 64, 94, 124] as const;

function Drawing({ motif }: { motif: Motif }) {
  switch (motif) {
    case 'town':
      return (
        <>
          <path className="spooky-shade" d="M-8 112c40-8 130-8 176 0v8H-8Z" />
          <path className="spooky-shade" d="M8 110V62l17-14 17 14v48Z" />
          <path className="spooky-shade" d="M48 110V46l24-20 22 20v64Z" />
          <path className="spooky-shade" d="M100 110V72l16-14 18 14v38Z" />
          <path
            className="spooky-curl"
            d="M25 48c0-14 10-20 16-14 4 5-2 10-6 6M72 26c-6-12 4-22 12-16 6 5 0 12-5 8M116 58c4-12 16-14 18-6 1 6-6 8-8 4"
          />
          <path
            className="spooky-glint"
            d="M19 74h7v9h-7zM64 58h7v9h-7zM78 80h7v9h-7zM112 84h7v9h-7z"
          />
        </>
      );
    case 'tree':
      return (
        <path
          className="spooky-curl spooky-curl-bold"
          d="M50 140c2-30-2-50 1-80M50 82c-14-6-26-20-22-34 3-10 15-8 13 0-1 6-8 5-7 0M51 72c14-10 30-16 30-30 0-10-12-12-14-4-2 6 6 8 8 3M51 62c0-14 4-28 0-40-3-8-12-4-9 2 2 4 7 2 6-2"
        />
      );
    case 'door':
      return (
        <>
          <path
            className="spooky-shade spooky-outline"
            d="M8 90V36a22 22 0 0 1 44 0v54Z"
          />
          <circle className="spooky-glint" cx="30" cy="58" r="3.5" />
          <path className="spooky-glint" d="M28.5 60l-2 9h7l-2-9Z" />
          <circle className="spooky-glint" cx="44" cy="60" r="2" />
        </>
      );
    case 'fenceCat':
      return (
        <>
          {FENCE_POSTS.map(x => (
            <path
              key={x}
              className="spooky-shade"
              d={`M${x} 100V40l6-8 6 8v60Z`}
            />
          ))}
          <path className="spooky-shade" d="M0 52h140v6H0zM0 78h140v6H0z" />
          <g transform="translate(84 22) scale(0.55)">
            <path
              className="spooky-shade"
              d="M-26 60c-4-28 4-46 14-54-8-8-10-20-6-30l-6-20 14 12q8-4 18 0l14-12-6 20c4 10 2 22-6 30 10 8 18 26 14 54Z"
            />
            <path
              className="spooky-curl spooky-curl-bold"
              d="M24 56c22 0 30-14 24-30-4-10 4-16 10-10"
            />
            <ellipse
              className="spooky-eye"
              cx="-7"
              cy="-14"
              rx="3.5"
              ry="4.5"
            />
            <ellipse className="spooky-eye" cx="9" cy="-14" rx="3.5" ry="4.5" />
          </g>
        </>
      );
    case 'tomb':
      return (
        <>
          <path
            className="spooky-shade spooky-outline"
            d="M6 72V30a24 24 0 0 1 48 0v42Z"
          />
          <path
            className="spooky-glint"
            d="M30 50s-11-6-11-13a5.5 5.5 0 0 1 11-1.5A5.5 5.5 0 0 1 41 37c0 7-11 13-11 13Z"
          />
          <path className="spooky-stitches" d="M24 40l3 3M30 38v4M36 40l-3 3" />
        </>
      );
    case 'dragonfly':
      return (
        <>
          <ellipse
            className="spooky-wing"
            cx="26"
            cy="20"
            rx="15"
            ry="5"
            transform="rotate(-12 26 20)"
          />
          <ellipse
            className="spooky-wing"
            cx="54"
            cy="20"
            rx="15"
            ry="5"
            transform="rotate(12 54 20)"
          />
          <ellipse
            className="spooky-wing"
            cx="27"
            cy="30"
            rx="12"
            ry="4"
            transform="rotate(14 27 30)"
          />
          <ellipse
            className="spooky-wing"
            cx="53"
            cy="30"
            rx="12"
            ry="4"
            transform="rotate(-14 53 30)"
          />
          <path className="spooky-curl spooky-curl-bold" d="M40 14v42" />
          <circle className="spooky-shade" cx="40" cy="11" r="4.5" />
        </>
      );
    case 'swirl':
      return (
        <path
          className="spooky-curl"
          d="M30 30c0-4 6-4 6 0 0 8-12 8-12 0 0-12 18-12 18 0 0 16-24 16-24 0 0-20 30-20 30 0"
        />
      );
    case 'moon':
      return (
        <path
          className="spooky-moonlet"
          d="M40 6a26 26 0 1 0 14 40A22 22 0 1 1 40 6Z"
        />
      );
    case 'bat':
      return (
        <path
          className="spooky-shade"
          d="M0 0q-6-8-18-6 5 4 4 9-6-2-12 2 8 0 10 6 6-6 12-3 2-5 4-8 2 3 4 8 6-3 12 3 2-6 10-6-6-4-12-2-1-5 4-9-12-2-18 6Z"
        />
      );
  }
}

interface Placement {
  motif: Motif;
  /** From the page's top, in percent of its height. */
  top: number;
  /** From its left edge, in percent of its width; the margins, mostly. */
  left: number;
  /** Width, in rem. */
  size: number;
  rotate?: number;
}

/**
 * Each layer lags by its own share of the scroll, so a motif low on a slow
 * layer never comes into view: the far layer stops at about half the page,
 * the near one at two thirds.
 */
const LAYERS: Record<'far' | 'near', readonly Placement[]> = {
  far: [
    { motif: 'moon', top: 4, left: 80, size: 5 },
    { motif: 'swirl', top: 11, left: 4, size: 4, rotate: -10 },
    { motif: 'bat', top: 17, left: 88, size: 4.5 },
    { motif: 'bat', top: 19, left: 78, size: 3 },
    { motif: 'dragonfly', top: 25, left: 2, size: 5, rotate: 20 },
    { motif: 'swirl', top: 32, left: 91, size: 3.5, rotate: 30 },
    { motif: 'bat', top: 38, left: 12, size: 3.5 },
    { motif: 'swirl', top: 44, left: 84, size: 4, rotate: -40 },
  ],
  near: [
    { motif: 'town', top: 9, left: -4, size: 15 },
    { motif: 'tree', top: 16, left: 82, size: 11 },
    { motif: 'door', top: 27, left: 5, size: 6.5 },
    { motif: 'fenceCat', top: 36, left: 76, size: 13 },
    { motif: 'tomb', top: 46, left: 7, size: 6, rotate: -6 },
    { motif: 'dragonfly', top: 53, left: 85, size: 6, rotate: -25 },
    { motif: 'tree', top: 60, left: -2, size: 10 },
    { motif: 'tomb', top: 64, left: 86, size: 5, rotate: 8 },
  ],
};

export function SpookyParallax() {
  return (
    <div className="spooky-parallax" aria-hidden="true">
      <ParallaxLag />
      {(['far', 'near'] as const).map(depth => (
        <div key={depth} className="spooky-parallax-layer" data-depth={depth}>
          {LAYERS[depth].map(({ motif, top, left, size, rotate = 0 }) => (
            <svg
              key={`${motif}-${top}`}
              className="spooky-motif"
              data-motif={motif}
              viewBox={VIEW_BOXES[motif]}
              style={{
                top: `${top}%`,
                left: `${left}%`,
                width: `${size}rem`,
                rotate: `${rotate}deg`,
              }}
            >
              <Drawing motif={motif} />
            </svg>
          ))}
        </div>
      ))}
    </div>
  );
}
