/**
 * The attributes of a link that leaves the site (#32).
 *
 * A web page opens in a new tab with no `opener` and no referrer, so the page
 * it opens cannot reach back into this one. Any other scheme — `mailto:`,
 * `tel:` — hands off to an app, and a new tab would only leave an empty one.
 */
export interface ExternalLinkProps {
  readonly href: string;
  readonly target?: '_blank';
  readonly rel?: 'noopener noreferrer';
}

export function externalLinkProps(url: string): ExternalLinkProps {
  const { protocol } = new URL(url);
  return protocol === 'http:' || protocol === 'https:'
    ? { href: url, target: '_blank', rel: 'noopener noreferrer' }
    : { href: url };
}
