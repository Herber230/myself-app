/**
 * The radar's vocabulary, and nothing else. No entifix entity, no Effect, no
 * content package: the control is a renderer over plain data, so #25's
 * `Technology` entity can replace `RadarEntry` later without touching it.
 *
 * Quadrant and ring *meanings* are content (ADR 0014), not decided here. The
 * control knows four of each, by index, and takes their names as props.
 */
import type { SiteLocale } from '../../site-locales';

/** One of the four quadrants, clockwise from the bottom right, as Zalando numbers them. */
export type QuadrantIndex = 0 | 1 | 2 | 3;

/** One of the four rings, innermost first. */
export type RingIndex = 0 | 1 | 2 | 3;

/**
 * How a blip moved since the previous edition. Zalando encodes this as a
 * number (`-1 | 0 | 1 | 2`); named here, and mapped back to a shape by the
 * chart.
 */
export type Movement = 'none' | 'in' | 'out' | 'new';

export const MOVEMENTS: readonly Movement[] = ['none', 'in', 'out', 'new'];

/** A piece of copy in every site locale. Content (#26) carries text this way. */
export type LocalizedText = Record<SiteLocale, string>;

/** A technology, before it has a place on the radar. */
export interface RadarEntry {
  /** Stable across builds and locales; the React key and the legend's anchor. */
  readonly id: string;
  readonly label: LocalizedText;
  readonly quadrant: QuadrantIndex;
  readonly ring: RingIndex;
  readonly movement: Movement;
  /** The areas it is tagged with, by id: what the radar's filter matches (#41). */
  readonly areas: readonly string[];
}

/** A cartesian point in radar space, the origin at the centre. */
export interface Point {
  readonly x: number;
  readonly y: number;
}

/** A point in polar space: `t` in radians, `r` from the centre. */
export interface PolarPoint {
  readonly t: number;
  readonly r: number;
}

/** An entry with its place: a number the legend repeats, and a point. */
export interface PlacedBlip extends RadarEntry {
  /** 1-based, unique across the radar, and the same in every locale. */
  readonly number: number;
  readonly x: number;
  readonly y: number;
}

/** Everything a renderer needs, computed once at build time. */
export interface RadarLayout {
  readonly blips: readonly PlacedBlip[];
  /** Outer radius of each ring, innermost first. */
  readonly ringRadii: readonly number[];
  /** Half the width and half the height of the square the radar fills. */
  readonly extent: number;
}
