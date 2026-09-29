import { describe, expect, it } from 'vitest';

import { PostContentError } from './problem.js';

describe('a problem in a post', () => {
  it('names the file and line, and what is wrong', () => {
    const error = new PostContentError(
      'posts/a.en.md',
      {
        type: 'text',
        position: {
          start: { line: 4, column: 1 },
          end: { line: 4, column: 2 },
        },
      },
      'is wrong',
    );
    expect(error.message).toBe('posts/a.en.md:4 is wrong');
    expect(error.name).toBe('PostContentError');
  });

  it('names the file alone for a node with no position', () => {
    expect(
      new PostContentError('posts/a.en.md', { type: 'text' }, 'is wrong')
        .message,
    ).toBe('posts/a.en.md is wrong');
  });
});
