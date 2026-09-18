import { describe, expect, it } from 'vitest';

import { externalLinkProps } from './external-link';

describe('a link that leaves the site', () => {
  it('opens a web page in a new tab, with no opener and no referrer', () => {
    for (const url of ['https://github.com/Herber230', 'http://example.com']) {
      expect(externalLinkProps(url)).toEqual({
        href: url,
        target: '_blank',
        rel: 'noopener noreferrer',
      });
    }
  });

  it('hands any other scheme to its app, in place', () => {
    expect(externalLinkProps('mailto:someone@example.com')).toEqual({
      href: 'mailto:someone@example.com',
    });
  });

  it('refuses something that is not a URL', () => {
    expect(() => externalLinkProps('github.com/Herber230')).toThrow(TypeError);
  });
});
