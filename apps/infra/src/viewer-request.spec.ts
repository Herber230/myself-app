import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

interface Querystring {
  [name: string]: { value: string; multiValue?: { value: string }[] };
}

interface Request {
  uri: string;
  headers: { host?: { value: string } };
  querystring: Querystring;
}

interface Redirect {
  statusCode: number;
  headers: { location: { value: string } };
}

// CloudFront runs the file as a script and calls its top-level `handler`; the
// spec does the same rather than importing it.
const handler = new Function(
  `${readFileSync(new URL('./viewer-request.js', import.meta.url), 'utf8')}\nreturn handler;`,
)() as (event: { request: Request }) => Request | Redirect;

const request = (
  uri: string,
  host: string | undefined = 'herbercolop.dev',
  querystring: Querystring = {},
): Request => ({
  uri,
  headers: host === undefined ? {} : { host: { value: host } },
  querystring,
});

const run = (req: Request) => handler({ request: req });

describe('the viewer-request function', () => {
  it('serves a folder its index document', () => {
    expect(run(request('/'))).toMatchObject({ uri: '/index.html' });
    expect(run(request('/es/cv/'))).toMatchObject({ uri: '/es/cv/index.html' });
  });

  it('redirects a folder without its slash, keeping the query', () => {
    expect(run(request('/es/cv'))).toEqual({
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: { location: { value: '/es/cv/' } },
    });
    expect(
      run(
        request('/en', 'herbercolop.dev', {
          variant: { value: 'backend' },
          print: { value: '' },
        }),
      ),
    ).toMatchObject({
      headers: { location: { value: '/en/?variant=backend&print' } },
    });
  });

  it('passes a file through untouched', () => {
    for (const uri of [
      '/404.html',
      '/data/technology.json',
      '/_next/static/chunks/main.js',
      '/en/cv/herber-colop-cv.pdf',
      '/en/opengraph-image',
      '/es/twitter-image',
    ]) {
      expect(run(request(uri))).toMatchObject({ uri });
    }
  });

  it('sends www to the apex, with path and every query value', () => {
    expect(
      run(
        request('/en/cv/', 'www.herbercolop.dev', {
          tag: { value: 'a', multiValue: [{ value: 'a' }, { value: 'b' }] },
        }),
      ),
    ).toMatchObject({
      statusCode: 301,
      headers: {
        location: { value: 'https://herbercolop.dev/en/cv/?tag=a&tag=b' },
      },
    });
  });

  it('treats a request without a host as the apex', () => {
    expect(run(request('/en/', undefined))).toMatchObject({
      uri: '/en/index.html',
    });
  });
});
