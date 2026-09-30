import { describe, expect, it } from 'vitest';

import {
  readDecisionBodyFile,
  readPostBodyFile,
  readProjectOverviewFile,
} from './post-bodies.js';

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

describe('the other Markdown beside the records', () => {
  it('reads a project’s overview per locale', () => {
    expect(readProjectOverviewFile('entifix', 'es')).toContain('entifix');
    expect(readProjectOverviewFile('nothing', 'en')).toBeUndefined();
  });

  it('reads a decision record’s body, in one language', () => {
    expect(readDecisionBodyFile('myself-app-0001')).toContain('## Context');
    expect(readDecisionBodyFile('myself-app-9999')).toBeUndefined();
  });
});
