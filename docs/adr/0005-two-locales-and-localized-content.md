# 5. English and Spanish, with localized content fields

- Status: Accepted
- Date: 2026-09-17
- Area: i18n
- Read when: adding copy or content, or when a translation is missing
- Revised: 2026-09-18 by #23 — the locale list lives in `@myself-app/domain`, and `site-locales.ts` re-exports it
- Revised: 2026-09-28 by [ADR 0019](0019-layered-packages-domain-content-incubator-implementation.md) — the default locale is routing, declared in `@myself-app/implementation-ui/routing`; the list stays in the domain

## Context

The site is read in English and Spanish. Two kinds of text need translating:
**UI copy** (headings, buttons, navigation — the same for every visitor) and
**content** (a bio, a job's responsibilities, a technology's description).
entifix translates UI copy through i18next catalogs. It has no member type for
content in several languages: `MetaAccessorTypes` is a closed list in core
([entifix#36](https://github.com/r10c-technologies/entifix/issues/36)).

entifix also fixes r10c's locale list and default in core —
`LOCALES = ['es', 'en']`, `DEFAULT_LOCALE = 'es'` — used as i18next's fallback
language and as the controls' starting locale
([entifix#35](https://github.com/r10c-technologies/entifix/issues/35)).

## Decision

- **`en` and `es`, `en` by default.** The site declares its own
  `SITE_LOCALES = ['en', 'es']`, `en` by default, typed as a
  subset of entifix's `Locale`. That one list drives the routes, the catalogs and
  content validation. It is declared in `@myself-app/domain`, because content
  validation needs it; the UI's `routing/site-locales.ts` re-exports it beside
  `SITE_DEFAULT_LOCALE`, which is routing, and the adapter is handed it.
- **Routes carry the locale**: `/[locale]/…` with `generateStaticParams`. `/`
  sends the visitor to `/en/` without a server.
- **UI copy** lives in catalogs, and a key present in one locale only fails the
  build (#17).
- **Content uses localized fields** — one record per fact, with only the text
  varying: `"role": { "en": "Tech Lead", "es": "Líder técnico" }`. Built here as
  `{ en, es }` on a member declared `type: 'string'`; the mapping passes the
  object through untouched. The metadata is knowingly inexact until entifix has a
  real type.
- **The page picks the language** with `localize(value, locale)`. Entities hold
  both, the adapter is locale-agnostic, and the JSON the browser reads carries
  both.
- **A missing translation fails the build.** Nothing falls back at render time,
  so entifix's `es` fallback is unreachable.
- **Localized querying is deferred.** The radar searches English text first.

## Alternatives

- **English only** — fastest, but adding Spanish later moves every route under
  a new segment.
- **Per-locale content files** — needs nothing from entifix, but every
  non-text member is written twice and the two versions drift unnoticed.
