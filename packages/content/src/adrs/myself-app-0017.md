- Revised: 2026-09-28 by #70 — the filter sits in a sidebar that folds away (open on the home, closed on a post); the home is a timeline by year whose cards fade the body's opening, read at build; the first posts include seven imported from Medium
- Revised: 2026-09-28 by [ADR 0019](/projects/myself-app/adr/0019/) — the Markdown renderer, `post-body.css` and the post's page are the UI package's (`markdown/`, `styles/`, `templates/post-page`)

Decides the blog half of #70. Builds on
[ADR 0010](/projects/myself-app/adr/0010/) (content checked from
metadata) and [ADR 0016](/projects/myself-app/adr/0016/) (the
filter). Every page stays a static page (ADR 0001).

## Context

The site needs a blog at `/[locale]/blog/<post>/`, filterable by tag,
technology and date, and later perhaps fed by another source than this
repository. The usual answers — one `.mdx` page per post, or a content tool
such as Velite or Content Collections — each bring a data layer of their own
beside entifix's, and tie posts to the file system.

## Decision

- **A post is an entity.** `Post` (in `@myself-app/domain`) has a localized
  `title`, `summary` and `body`, a `publishedAt` and optional `updatedAt`, a
  `draft` flag, `tags` (at least one) and optional `technologies`, linking to
  the radar's. `Tag` has a localized `label`. Posts are read through the
  `load` use case like everything else, so another adapter can serve them.
- **Bodies are Markdown files beside the records.** `posts.json` holds the
  metadata; `posts/<id>.en.md` and `posts/<id>.es.md` hold the bodies. The
  composition root attaches each body before validation. Both locales are
  required, and a missing one fails the build with its path. The browser's
  copy of the posts (`/data/post.json`) leaves the bodies out.
- **Markdown with directives, not MDX.** A body is text that runs no code, so
  it can come from anywhere later. Paragraph types are directives:
  `:::note`, `:::tip`, `:::warning`, `:::lead`, `:::aside`, and
  `::figure[caption]{src alt}`. An unknown directive fails the build. The
  pipeline (`unified`, `remark-gfm`, `remark-directive`, `rehype-sanitize`,
  Shiki for code) runs in the server component at build, and outputs React
  elements: no Markdown code reaches the browser, and no
  `dangerouslySetInnerHTML`.
- **Images and links are checked at build.** An image lives in
  `public/blog/<post>/` and is referenced relatively (`./radar.png`). It must
  exist and have alt text, its width and height are written into the page, and
  it loads lazily: a post is prefetched from the blog's home, and React
  preloads every eager image of a prefetched page.
  An internal link is written without a locale (`/tech-radar/nx/`), must end
  in `/`, must name a page that exists, and gets the reader's locale. An
  external link gets `rel="noopener noreferrer"`.
- **Drafts are for `next dev`.** A draft is left out of the export, the
  sitemap, the feed and `/data/post.json`.
- **Related posts are computed.** Two points per shared tag, one per shared
  technology, newest first on a tie; the top three are shown.
- **The blog home filters in the browser**, by tag, technology, year and
  title (`?tag=&tech=&year=&q=`), through the use case (ADR 0016). There are
  no tag pages: the query string is the only filter. The filter is a sidebar,
  a `<details>` open on the home and closed on a post, where it is links to
  the home; before hydration the home's sidebar is those links too. The home
  lists posts as a timeline by year, each card fading the opening of its body
  (`excerptOf`, plain text read at build, never in `/data/post.json`).
- **Each post has an Open Graph image, and each locale an RSS feed**
  (`/<locale>/blog/rss.xml`).

## Consequences

- A post is a JSON record and two Markdown files, checked like every other
  record: an unknown tag, a missing locale or a broken link fails the build
  with its path.
- A technology's page lists the posts about it.
- Styling a post is `post-body.css`, over the theme tokens; a new paragraph
  type is a directive, its class and its styles.
- The first posts were placeholders marked `TODO(#70)`; seven more were
  imported from Medium with their translations, each noting where it was
  first published.

## Alternatives considered

- **One `.tsx` or `.mdx` page per post.** The content lives in routes, cannot
  move to another source, and doubles for two locales.
- **Velite, Content Collections, Fumadocs MDX.** Each is a typed content
  layer with its own schema, beside entifix's metadata: two sources of truth.
- **MDX.** Components inside posts, at the price of posts being code.
  Directives give the paragraph types without it.
- **A Git-based CMS (Keystatic, TinaCMS).** An editor, not a mechanism; it
  could edit these files later without changing anything here.
