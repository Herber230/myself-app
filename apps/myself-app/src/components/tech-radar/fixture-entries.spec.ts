/**
 * The fixture the layout's specs run against has to exercise the control:
 * every segment, every movement, both locales. A fixture missing one would let
 * the layout break there with every spec still green.
 */
import { describe, expect, it } from 'vitest';

import { SITE_LOCALES } from '../../site-locales';
import { FIXTURE_RADAR_ENTRIES } from './fixture-entries';
import { QUADRANT_INDICES, RING_INDICES } from './geometry';
import { MOVEMENTS } from './types';

describe('the fixture radar entries', () => {
  it('fill every one of the sixteen segments', () => {
    // Pinned: one per segment at least, so a thinned fixture fails here.
    expect(FIXTURE_RADAR_ENTRIES.length).toBeGreaterThanOrEqual(16);
    for (const quadrant of QUADRANT_INDICES) {
      for (const ring of RING_INDICES) {
        const cell = FIXTURE_RADAR_ENTRIES.filter(
          entry => entry.quadrant === quadrant && entry.ring === ring,
        );
        expect(
          cell.length,
          `quadrant ${quadrant}, ring ${ring}`,
        ).toBeGreaterThan(0);
      }
    }
  });

  it('show every movement, so each blip shape is drawn at least once', () => {
    for (const movement of MOVEMENTS) {
      expect(
        FIXTURE_RADAR_ENTRIES.some(entry => entry.movement === movement),
        movement,
      ).toBe(true);
    }
  });

  it('carry a unique id', () => {
    const ids = FIXTURE_RADAR_ENTRIES.map(entry => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('are labelled in every site locale', () => {
    for (const entry of FIXTURE_RADAR_ENTRIES) {
      for (const locale of SITE_LOCALES) {
        expect(entry.label[locale], `${entry.id} › ${locale}`).toBeTruthy();
        expect(entry.label[locale].trim(), `${entry.id} › ${locale}`).toBe(
          entry.label[locale],
        );
      }
    }
  });
});
