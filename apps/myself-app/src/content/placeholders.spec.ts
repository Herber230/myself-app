/**
 * Placeholder text is listed, and the list only shrinks (#26).
 */
import { CONTENT } from '@myself-app/content';
import { ContentValidationError } from '@myself-app/static-adapter';
import { describe, expect, it } from 'vitest';

import { PENDING_CONTENT } from './pending-content';
import {
  assertNoUnlistedPlaceholders,
  placeholderPaths,
  placeholderProblems,
} from './placeholders';

const messages = (
  content: Record<string, readonly unknown[]>,
  pending: readonly string[] = [],
) =>
  placeholderProblems(content, pending).map(
    problem => `${problem.path} ${problem.message}`,
  );

describe('the content the site ships', () => {
  it('holds placeholder text only where the list says it does', () => {
    expect(placeholderProblems(CONTENT)).toEqual([]);
    expect(() => assertNoUnlistedPlaceholders(CONTENT)).not.toThrow();
  });

  it('lists each pending path once', () => {
    expect(new Set(PENDING_CONTENT).size).toBe(PENDING_CONTENT.length);
  });
});

describe('a placeholder', () => {
  it('is found inside a localized value, by its path', () => {
    const content = {
      'employers.json': [
        {
          id: 'acme',
          name: { en: 'Acme', es: 'TODO(#26): el nombre' },
          url: 'https://acme.example',
        },
      ],
    };
    expect(placeholderPaths(content)).toEqual(['employers.json › acme › name']);
  });

  it('is found in plain text and inside a list', () => {
    const content = {
      'things.json': [
        { id: 'a', note: 'TODO(#33) decide', tags: ['ok', 'TODO(#39)'] },
      ],
    };
    expect(placeholderPaths(content)).toEqual([
      'things.json › a › note',
      'things.json › a › tags',
    ]);
  });

  it('is not every mention of "TODO"', () => {
    const content = {
      'things.json': [{ id: 'a', note: 'A TODO list app', count: 3, x: null }],
    };
    expect(placeholderPaths(content)).toEqual([]);
  });

  it('is skipped in a record with no id, or in no record at all', () => {
    const content = {
      'things.json': [{ note: 'TODO(#26)' }, 'TODO(#26)', null],
    };
    expect(placeholderPaths(content)).toEqual([]);
  });
});

describe('the pending list', () => {
  const content = {
    'things.json': [{ id: 'a', note: { en: 'TODO(#26)', es: 'TODO(#26)' } }],
  };

  it('stops a placeholder it does not list', () => {
    expect(messages(content)).toEqual([
      'things.json › a › note holds placeholder text: write it, or list it in pending-content.ts',
    ]);
  });

  it('stops a listed path whose value has been written', () => {
    expect(
      messages(content, ['things.json › a › note', 'things.json › b › note']),
    ).toEqual([
      'things.json › b › note is written, or gone: remove it from the list in pending-content.ts',
    ]);
  });

  it('fails the build with every problem', () => {
    expect(() => assertNoUnlistedPlaceholders(content, [])).toThrow(
      ContentValidationError,
    );
  });
});
