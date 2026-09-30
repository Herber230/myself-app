import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { InlineCode } from './inline-code.js';

const html = (text: string) =>
  render(<InlineCode text={text} />).container.innerHTML;

describe('inline code', () => {
  it('sets each backtick span as code', () => {
    expect(html('run `nx build` then `nx test`')).toBe(
      'run <code>nx build</code> then <code>nx test</code>',
    );
  });

  it('leaves plain text, and an unmatched backtick, as they are', () => {
    expect(html('no code here')).toBe('no code here');
    expect(html('a `b` and a stray ` tick')).toBe(
      'a <code>b</code> and a stray ` tick',
    );
  });
});
