/**
 * Placeholder text, kept from shipping (#26).
 *
 * Content still being written carries `TODO(#<issue>)` inside the value. Each
 * such value is listed in `PENDING_CONTENT` by its path, and the list only
 * shrinks: a placeholder that is not listed stops the build, and so does a
 * listed path whose value has since been written. When the list is empty,
 * nothing on the site is placeholder, and any new `TODO(#` fails outright.
 */
import {
  ContentValidationError,
  type ValidationProblem,
} from '@myself-app/static-adapter';

import { PENDING_CONTENT } from './pending-content';

/** What a value still to be written carries. */
export const PLACEHOLDER = /TODO\(#\d+\)/;

/** Whether any text inside a value, however nested, is placeholder. */
function holdsPlaceholder(value: unknown): boolean {
  if (typeof value === 'string') return PLACEHOLDER.test(value);
  if (value !== null && typeof value === 'object') {
    return Object.values(value).some(holdsPlaceholder);
  }
  return false;
}

/**
 * Every `<file> › <id> › <member>` whose value holds placeholder text — the
 * same path a validation problem carries.
 *
 * A record without an id is skipped: validation already reports it, and it has
 * no path a pending entry could name.
 */
export function placeholderPaths(
  content: Readonly<Record<string, readonly unknown[]>>,
): string[] {
  return Object.entries(content).flatMap(([file, records]) =>
    records.flatMap(record => {
      if (record === null || typeof record !== 'object') return [];
      const { id, ...members } = record as Record<string, unknown>;
      if (id === undefined) return [];
      return Object.entries(members)
        .filter(([, value]) => holdsPlaceholder(value))
        .map(([member]) => `${file} › ${String(id)} › ${member}`);
    }),
  );
}

/** A placeholder not listed as pending, and a pending path already written. */
export function placeholderProblems(
  content: Readonly<Record<string, readonly unknown[]>>,
  pending: readonly string[] = PENDING_CONTENT,
): ValidationProblem[] {
  const found = placeholderPaths(content);
  const unlisted = found
    .filter(path => !pending.includes(path))
    .map(path => ({
      path,
      message:
        'holds placeholder text: write it, or list it in pending-content.ts',
    }));
  const written = pending
    .filter(path => !found.includes(path))
    .map(path => ({
      path,
      message:
        'is written, or gone: remove it from the list in pending-content.ts',
    }));
  return [...unlisted, ...written];
}

/** Throws a `ContentValidationError` naming every problem, if there is one. */
export function assertNoUnlistedPlaceholders(
  content: Readonly<Record<string, readonly unknown[]>>,
  pending: readonly string[] = PENDING_CONTENT,
): void {
  const problems = placeholderProblems(content, pending);
  if (problems.length > 0) throw new ContentValidationError(problems);
}
