'use client';

import {
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  useEffect,
  useState,
} from 'react';

import { ONE_MONTH_COPY as COPY } from './copy.js';
import {
  KNOTTED_THREAD,
  LOOSE_THREAD,
  MonthSymbols,
  StringLights,
} from './glyphs.js';
import { SalsaCount } from './salsa-count.js';

type Mood = 'night' | 'warm';

/** Where the stitches cross the closing seam. */
const STITCHES = [85, 107, 129, 151, 171] as const;

/** A line's turn in its card's entrance. */
const turn = (n: number) => ({ '--n': n }) as CSSProperties;

function Card({
  label,
  active,
  children,
}: {
  label: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <section
      className="month-card"
      data-active={active || undefined}
      aria-label={label}
      aria-hidden={!active}
      inert={!active}
    >
      {children}
    </section>
  );
}

function Ghost({ className, size }: { className: string; size: string }) {
  return (
    <svg
      className={`month-art ${className}`}
      viewBox="0 0 64 72"
      style={{ inlineSize: size }}
      aria-hidden="true"
    >
      <use href="#month-ghost" />
    </svg>
  );
}

/** Which mood each card sets: the night, until the salsa night warms it. */
const MOODS: readonly Mood[] = [
  'night',
  'night',
  'night',
  'night',
  'night',
  'night',
  'warm',
  'warm',
  'warm',
];
const COUNT = 7;
const LAST = MOODS.length - 1;

/** When each card's tap cue shows: once its lines (or drafts, or knot) are in. */
const CUE_DELAYS = [1.6, 2.4, 2.6, 1.8, 5.4, 3.2, 2.4] as const;

/**
 * The story, one card at a time: tap the right side to go on, the left to go
 * back. The count card moves on by its own button, so a stray tap there does
 * not skip it.
 */
export function OneMonthStory() {
  const [at, setAt] = useState(0);
  const [visits, setVisits] = useState(0);

  const go = (to: number) => {
    const next = Math.max(0, Math.min(LAST, to));
    if (next === COUNT) setVisits(v => v + 1);
    setAt(next);
  };

  /** On, unless the card moves on by its own button (the count) or is the last. */
  const forward = () => {
    if (at !== COUNT && at !== LAST) go(at + 1);
  };
  const back = () => go(at - 1);

  // The arrow keys follow the taps' rules. Bound again each render, so they
  // always read the card shown.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') forward();
      if (event.key === 'ArrowLeft') back();
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  });

  const onTap = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as Element).closest('button')) return;
    if (event.clientX < window.innerWidth * 0.3) back();
    else forward();
  };

  const card = (n: number) => n === at;

  return (
    // The whole stage is the tap target; the arrow keys do the same.
    <div className="month-stage" data-mood={MOODS[at]} onClick={onTap}>
      <div className="month-sky" aria-hidden="true" />
      <div className="month-room" aria-hidden="true" />
      <StringLights />
      <MonthSymbols />
      <div className="month-progress" aria-hidden="true">
        {MOODS.map((_, n) => (
          <span key={n} data-done={n <= at || undefined} />
        ))}
      </div>

      <Card label={COPY.cover.label} active={card(0)}>
        <Ghost className="month-floaty" size="7rem" />
        <h1 className="month-big month-line" style={turn(0)}>
          {COPY.cover.greeting}
        </h1>
        <p className="month-lead month-line" style={turn(1)}>
          {COPY.cover.plan}
        </p>
        <p className="month-cue month-line" style={turn(2)}>
          {COPY.cover.cue}
        </p>
      </Card>

      <Card label={COPY.plan.label} active={card(1)}>
        <svg
          className="month-art month-wide"
          viewBox="0 0 200 110"
          aria-hidden="true"
        >
          <use href="#month-conga" x="40" y="0" width="50" height="100" />
          <use href="#month-conga" x="96" y="12" width="44" height="88" />
          <use
            href="#month-heart"
            x="150"
            y="20"
            width="22"
            height="20"
            className="month-pop"
          />
        </svg>
        <p className="month-lead month-line" style={turn(0)}>
          {COPY.plan.lead}
        </p>
        <p className="month-line" style={turn(1)}>
          {COPY.plan.line}
        </p>
        <p className="month-soft month-line" style={turn(2)}>
          {COPY.plan.soft}
        </p>
      </Card>

      <Card label={COPY.knot.label} active={card(2)}>
        <svg
          className="month-art month-wide"
          viewBox="0 0 300 100"
          aria-hidden="true"
        >
          <path className="month-thread month-knot-draw" d={KNOTTED_THREAD} />
        </svg>
        <p className="month-lead month-line" style={turn(0)}>
          {COPY.knot.lead}
        </p>
        <p className="month-line" style={turn(1)}>
          {COPY.knot.line}
        </p>
        <p className="month-soft month-line" style={turn(2)}>
          {COPY.knot.soft}
        </p>
      </Card>

      <Card label={COPY.thought.label} active={card(3)}>
        <Ghost className="month-floaty" size="5.5rem" />
        <p className="month-lead month-line" style={turn(0)}>
          {COPY.thought.lead}
        </p>
        <p className="month-line" style={turn(1)}>
          {COPY.thought.line}
        </p>
      </Card>

      <Card label={COPY.ask.label} active={card(4)}>
        <div className="month-drafts">
          {COPY.ask.drafts.map(draft => (
            <s key={draft} className="month-draft">
              {draft}
            </s>
          ))}
          <p className="month-draft month-final">{COPY.ask.final}</p>
        </div>
        <p className="month-soft month-after-drafts">{COPY.ask.after}</p>
      </Card>

      <Card label={COPY.yes.label} active={card(5)}>
        <svg
          className="month-art month-wide"
          viewBox="0 0 300 100"
          aria-hidden="true"
        >
          <path className="month-thread month-loose-knot" d={KNOTTED_THREAD} />
          <path
            className="month-thread month-loose-straight"
            d={LOOSE_THREAD}
          />
          <use
            href="#month-heart"
            x="138"
            y="24"
            width="26"
            height="24"
            className="month-pop month-pop-late"
          />
        </svg>
        <p className="month-big month-line" style={turn(0)}>
          {COPY.yes.lead}
        </p>
      </Card>

      <Card label={COPY.night.label} active={card(6)}>
        <svg
          className="month-art month-wide"
          viewBox="0 0 220 110"
          aria-hidden="true"
        >
          <use href="#month-conga" x="6" y="10" width="45" height="90" />
          <use
            href="#month-ghost"
            x="70"
            y="28"
            width="56"
            height="64"
            className="month-dance-a"
          />
          <use
            href="#month-ghost"
            x="124"
            y="34"
            width="50"
            height="58"
            className="month-dance-b"
          />
          <use href="#month-conga" x="174" y="16" width="40" height="84" />
        </svg>
        <p className="month-lead month-line" style={turn(0)}>
          {COPY.night.lead}
        </p>
        <p className="month-line" style={turn(1)}>
          {COPY.night.line}
        </p>
        <p className="month-soft month-line" style={turn(2)}>
          {COPY.night.soft}
        </p>
      </Card>

      <Card label={COPY.count.label} active={card(COUNT)}>
        <SalsaCount key={visits} onDone={() => go(COUNT + 1)} />
      </Card>

      <Card label={COPY.closing.label} active={card(LAST)}>
        <svg
          className="month-art month-wide"
          viewBox="0 0 260 90"
          aria-hidden="true"
        >
          <use
            href="#month-ghost"
            x="0"
            y="8"
            width="64"
            height="72"
            className="month-floaty"
          />
          <path className="month-seam" d="M72 46h116" />
          {STITCHES.map(x => (
            <path key={x} className="month-stitch" d={`M${x} 38l8 16`} />
          ))}
          <use
            href="#month-ghost"
            x="196"
            y="8"
            width="64"
            height="72"
            className="month-floaty month-floaty-late"
          />
        </svg>
        <p className="month-line" style={turn(0)}>
          {COPY.closing.plans}
        </p>
        <p className="month-lead month-line" style={turn(1)}>
          {COPY.closing.lead}
        </p>
        <p className="month-big month-last month-line" style={turn(2)}>
          {COPY.closing.last}
        </p>
        <button
          type="button"
          className="month-again month-line"
          style={turn(3)}
          onClick={() => go(0)}
        >
          {COPY.closing.again}
        </button>
      </Card>

      {at < COUNT ? (
        // Keyed by the card, so it fades in again once that card's lines are in.
        <p
          key={at}
          className="month-hint"
          style={{ '--delay': `${CUE_DELAYS[at]}s` } as CSSProperties}
        >
          {at === 0 ? COPY.hint.first : COPY.hint.next}
          {at > 0 ? (
            <span className="month-hint-arrow" aria-hidden="true" />
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
