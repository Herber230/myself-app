import { describe, expect, it } from 'vitest';

import { outlineOf } from './outline.js';

describe('a post’s outline', () => {
  it('is every section and subsection, in order, with the body’s anchors', async () => {
    const outline = await outlineOf(
      [
        '# The title, not an entry',
        '## Why *this* matters',
        'Some text.',
        '### The `load` use case',
        '#### Too deep to list',
        ':::note',
        '## Inside a note',
        ':::',
        '## Why *this* matters',
      ].join('\n\n'),
      'posts/sample.en.md',
    );
    expect(outline).toEqual([
      { id: 'why-this-matters', text: 'Why this matters', depth: 2 },
      { id: 'the-load-use-case', text: 'The load use case', depth: 3 },
      { id: 'inside-a-note', text: 'Inside a note', depth: 2 },
      // Twice the same words: the second anchor numbered, as the body's is.
      { id: 'why-this-matters-1', text: 'Why this matters', depth: 2 },
    ]);
  });

  it('reads a heading’s words, the HTML among them dropped', async () => {
    const outline = await outlineOf(
      '## Before <!-- a note to self --> after',
      'posts/sample.en.md',
    );
    expect(outline.map(entry => entry.text)).toEqual(['Before  after']);
  });
});
