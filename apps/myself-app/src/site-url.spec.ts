import { describe, expect, it } from 'vitest';

import { LOCAL_SITE_URL, siteUrl } from './site-url';

describe('the site URL', () => {
  it('is the deployed origin when one is set', () => {
    expect(
      siteUrl({ NEXT_PUBLIC_SITE_URL: 'https://herber.example' }).href,
    ).toBe('https://herber.example/');
  });

  it('is the local static server until then, or when it is set empty', () => {
    expect(siteUrl({}).href).toBe(`${LOCAL_SITE_URL}/`);
    expect(siteUrl({ NEXT_PUBLIC_SITE_URL: '' }).href).toBe(
      `${LOCAL_SITE_URL}/`,
    );
  });

  it('reads the environment by default', () => {
    expect(siteUrl()).toBeInstanceOf(URL);
  });
});
