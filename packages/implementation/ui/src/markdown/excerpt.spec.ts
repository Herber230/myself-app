import { describe, expect, it } from 'vitest';

import { excerptOf } from './excerpt.js';

describe('a post’s excerpt', () => {
  it('is the lead and the paragraphs, as plain text, in reading order', () => {
    const markdown = [
      ':::lead',
      'The **opening**, set _larger_.',
      ':::',
      '',
      '## A heading',
      '',
      'A [linked](https://example.com) paragraph with `code`.',
      '',
      ':::note',
      'A note beside the text.',
      ':::',
      '',
      '::figure[A caption]{src="./a.png" alt="An image"}',
      '',
      '- a list item',
      '',
      '```ts',
      'const skipped = true;',
      '```',
      '',
      '> A quote.',
      '',
      'The   last',
      'paragraph.',
    ].join('\n');
    expect(excerptOf(markdown)).toBe(
      'The opening, set larger. A linked paragraph with code. The last paragraph.',
    );
  });

  it('leaves out raw HTML, images and line breaks’ markup', () => {
    expect(
      excerptOf('Before <b>bold</b> after ![an image](./a.png)  \nnext line.'),
    ).toBe('Before bold after next line.');
  });

  it('is empty for a post that opens with no prose', () => {
    expect(excerptOf('## Only a heading\n\n```\ncode\n```')).toBe('');
  });

  it('is cut at the last whole word within its length', () => {
    expect(excerptOf('one two three four', 12)).toBe('one two');
    expect(excerptOf('one two three', 13)).toBe('one two three');
  });

  it('is cut mid-word when a single word is longer than it', () => {
    expect(excerptOf('abcdefghij klm', 5)).toBe('abcde');
  });

  it('is about four lines of a card by default', () => {
    const words = Array.from({ length: 200 }, (_, index) => `w${index}`);
    const excerpt = excerptOf(words.join(' '));
    expect(excerpt.length).toBeLessThanOrEqual(320);
    expect(excerpt.length).toBeGreaterThan(300);
    expect(excerpt.endsWith(' ')).toBe(false);
  });
});
