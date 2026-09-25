// A CloudFront Function (runtime `cloudfront-js-2.0`) on viewer request
// (ADR 0013). It gives a private bucket behind a REST origin what the S3
// website endpoint did by itself, the rules `tools/serve-static.mjs` mirrors:
//
// - `www.<apex>` answers a 301 to the apex, path and query kept.
// - `path/` is served `path/index.html`.
// - `path`, where the last segment has no extension, answers a 301 to `path/`,
//   except for the files Next writes without one.
//
// Plain script, not a module: CloudFront calls the top-level `handler`. It is
// read as text by `site.ts` and run by `viewer-request.spec.ts`.

const EXTENSIONLESS_FILES = ['opengraph-image', 'twitter-image'];

function redirect(location) {
  return {
    statusCode: 301,
    statusDescription: 'Moved Permanently',
    headers: { location: { value: location } },
  };
}

function search(querystring) {
  const pairs = [];
  for (const name of Object.keys(querystring)) {
    const entry = querystring[name];
    const values = entry.multiValue
      ? entry.multiValue.map(item => item.value)
      : [entry.value];
    for (const value of values) {
      pairs.push(value === '' ? name : `${name}=${value}`);
    }
  }
  return pairs.length > 0 ? `?${pairs.join('&')}` : '';
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function handler(event) {
  const request = event.request;
  const host = request.headers.host ? request.headers.host.value : '';

  if (host.startsWith('www.')) {
    return redirect(
      `https://${host.slice(4)}${request.uri}${search(request.querystring)}`,
    );
  }

  if (request.uri.endsWith('/')) {
    request.uri += 'index.html';
    return request;
  }

  const last = request.uri.slice(request.uri.lastIndexOf('/') + 1);
  if (!last.includes('.') && !EXTENSIONLESS_FILES.includes(last)) {
    return redirect(`${request.uri}/${search(request.querystring)}`);
  }

  return request;
}
