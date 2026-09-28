import { describe, expect, it } from 'vitest';

import { readPostBodyFile } from './post-bodies';

describe('readPostBodyFile', () => {
  it('reads a post’s Markdown from the content package', () => {
    expect(readPostBodyFile('entifix-in-the-browser', 'en')).toContain(
      ':::lead',
    );
  });

  it('answers undefined for a file that does not exist', () => {
    expect(readPostBodyFile('no-such-post', 'es')).toBeUndefined();
  });
});
