'use client';

import { useRef, useState } from 'react';

import { ONE_MONTH_COPY } from './copy.js';

const COPY = ONE_MONTH_COPY.count;
const BEATS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

/** In salsa, 4 and 8 are pauses: nobody steps on them. */
const isPause = (beat: number) => beat % 4 === 0;

/** A short conga tone: a sine that drops quickly into its pitch. */
function playConga(context: AudioContext, high: boolean) {
  const t = context.currentTime;
  const osc = context.createOscillator();
  const gain = context.createGain();
  const pitch = high ? 330 : 220;
  osc.type = 'sine';
  osc.frequency.setValueAtTime(pitch * 1.4, t);
  osc.frequency.exponentialRampToValueAtTime(pitch, t + 0.04);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.7, t + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
  osc.connect(gain).connect(context.destination);
  osc.start(t);
  osc.stop(t + 0.3);
}

/**
 * The count: each tap is a beat. 1, 2, 3 and 5, 6, 7 light up and play a
 * conga; 4 and 8 stay silent, as pauses. After one full count, the lines
 * about the pauses and the way on appear.
 */
export function SalsaCount({ onDone }: { onDone: () => void }) {
  const [beat, setBeat] = useState(0);
  const [counted, setCounted] = useState(false);
  const audio = useRef<AudioContext | null>(null);

  function tap() {
    const next = (beat % 8) + 1;
    setBeat(next);
    if (next === 8) setCounted(true);
    if (isPause(next)) return;
    try {
      audio.current ??= new AudioContext();
      playConga(audio.current, next === 3 || next === 7);
    } catch {
      // No sound is fine: the count still shows.
    }
  }

  const resting = beat > 0 && isPause(beat);

  return (
    <>
      <p className="month-lead">{COPY.lead}</p>
      <p className="month-explain">{COPY.explain}</p>
      <p className="month-sound">{COPY.sound}</p>
      <div className="month-beats" aria-hidden="true">
        {BEATS.map(n => (
          <span
            key={n}
            className="month-beat"
            data-pause={isPause(n) || undefined}
            data-on={n <= beat || undefined}
          >
            {n}
          </span>
        ))}
      </div>
      <p className="month-legend">{COPY.legend}</p>
      <button
        type="button"
        className="month-pad"
        data-rest={resting || undefined}
        data-waiting={beat === 0 || undefined}
        onClick={tap}
      >
        {beat === 0 ? COPY.tap : resting ? COPY.pause : beat}
      </button>
      {counted ? (
        <>
          <p className="month-count-end">
            {COPY.end}
            <br />
            <span className="month-soft">{COPY.endSoft}</span>
          </p>
          <button type="button" className="month-next" onClick={onDone}>
            {COPY.next}
          </button>
        </>
      ) : (
        <p className="month-tap-cue">
          {beat === 0 ? ONE_MONTH_COPY.hint.count : COPY.keepGoing}
        </p>
      )}
    </>
  );
}
