/**
 * The placeholder data is what the page renders until content (#26) lands, so
 * it has to exercise the control: every segment, every movement, both locales.
 */
import { describe, expect, it } from 'vitest';

import { SITE_LOCALES } from '../../site-locales';
import { QUADRANT_INDICES, RING_INDICES } from './geometry';
import { MOCK_RADAR_ENTRIES } from './mock-entries';
import { MOVEMENTS } from './types';

describe('the mock radar entries', () => {
  it('fill every one of the sixteen segments', () => {
    // Pinned: one per segment at least, so a thinned fixture fails here.
    expect(MOCK_RADAR_ENTRIES.length).toBeGreaterThanOrEqual(16);
    for (const quadrant of QUADRANT_INDICES) {
      for (const ring of RING_INDICES) {
        const cell = MOCK_RADAR_ENTRIES.filter(
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
        MOCK_RADAR_ENTRIES.some(entry => entry.movement === movement),
        movement,
      ).toBe(true);
    }
  });

  it('carry a unique id', () => {
    const ids = MOCK_RADAR_ENTRIES.map(entry => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('are labelled in every site locale', () => {
    for (const entry of MOCK_RADAR_ENTRIES) {
      for (const locale of SITE_LOCALES) {
        expect(entry.label[locale], `${entry.id} › ${locale}`).toBeTruthy();
        expect(entry.label[locale].trim(), `${entry.id} › ${locale}`).toBe(
          entry.label[locale],
        );
      }
    }
  });
});
