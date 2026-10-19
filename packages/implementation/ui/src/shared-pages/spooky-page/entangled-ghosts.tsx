'use client';

import { useState } from 'react';

import { type GhostSide, type GhostState, SPOOKY_COPY } from './copy.js';
import { GhostGlyph, PumpkinGlyph } from './glyphs.js';

const COPY = SPOOKY_COPY.demo;
const SIDES: readonly GhostSide[] = ['a', 'b'];

const opposite = (state: GhostState): GhostState =>
  state === 'pumpkin' ? 'ghost' : 'pumpkin';

interface Measurement {
  /** The ghost that was looked at. */
  side: GhostSide;
  /** Ghost A's answer; Ghost B's is always the opposite. */
  a: GhostState;
}

/**
 * Two entangled "particles", each a pumpkin and a ghost at once until one is
 * looked at. Looking settles it at random, and its twin settles opposite.
 * The tally shows both halves of the story: each answer alone is chance,
 * their disagreement never is.
 *
 * The coin is tossed in the click handler only, so the page the build writes
 * and the one the browser hydrates are the same.
 */
export function EntangledGhosts() {
  const [measured, setMeasured] = useState<Measurement>();
  const [tally, setTally] = useState({ times: 0, pumpkins: 0 });

  // Once looked at, both buttons are disabled until the pair is entangled
  // again, so a measured pair is never measured twice.
  function look(side: GhostSide) {
    const seen: GhostState = Math.random() < 0.5 ? 'pumpkin' : 'ghost';
    const a = side === 'a' ? seen : opposite(seen);
    setMeasured({ side, a });
    setTally(({ times, pumpkins }) => ({
      times: times + 1,
      pumpkins: pumpkins + (a === 'pumpkin' ? 1 : 0),
    }));
  }

  const stateOf = (side: GhostSide) =>
    measured && (side === 'a' ? measured.a : opposite(measured.a));

  return (
    <div className="spooky-demo">
      {/* Kept in the flow once used, so the pair below does not jump. */}
      <p className="spooky-tap" data-used={measured ? '' : undefined}>
        <svg aria-hidden="true" className="spooky-tap-hand" viewBox="0 0 24 24">
          <path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10m0-.5V4a1.5 1.5 0 0 1 3 0v6m0-1.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-.5a6 6 0 0 1-4.6-2.2L3.6 16a1.6 1.6 0 0 1 2.4-2.1L9 16" />
        </svg>
        <span>{COPY.tap}</span>
      </p>
      <div className="spooky-pair" data-measured={measured ? '' : undefined}>
        {SIDES.map(side => {
          const state = stateOf(side);
          return (
            <button
              key={side}
              type="button"
              className="spooky-particle"
              data-state={state ?? 'both'}
              disabled={Boolean(measured)}
              aria-label={COPY.measure(side)}
              onClick={() => look(side)}
            >
              <span className="spooky-particle-figure">
                <PumpkinGlyph className="spooky-particle-pumpkin" />
                <GhostGlyph className="spooky-particle-ghost" />
              </span>
              <span className="spooky-particle-name">{COPY.names[side]}</span>
              <span className="spooky-particle-place">{COPY.places[side]}</span>
              <span className="spooky-particle-state">
                {state ? COPY.states[state] : COPY.undecided}
              </span>
            </button>
          );
        })}
        <svg
          aria-hidden="true"
          className="spooky-thread"
          viewBox="0 0 100 10"
          preserveAspectRatio="none"
        >
          <path d="M0 5q12.5-5 25 0t25 0 25 0 25 0" />
        </svg>
      </div>
      <p className="spooky-demo-result" aria-live="polite">
        {measured
          ? COPY.result(
              measured.side,
              stateOf(measured.side) as GhostState,
              opposite(stateOf(measured.side) as GhostState),
            )
          : COPY.idle}
      </p>
      {tally.times > 0 ? (
        <p className="spooky-demo-tally">
          {COPY.tally(tally.times, tally.pumpkins)}
        </p>
      ) : null}
      {measured ? (
        <button
          type="button"
          className="spooky-again"
          onClick={() => setMeasured(undefined)}
        >
          {COPY.again}
        </button>
      ) : null}
    </div>
  );
}
