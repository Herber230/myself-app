# 5. English and Spanish, with localized content fields

- Status: Accepted
- Date: 2026-09-17
- Area: i18n
- Read when: adding copy or content, or when a translation is missing

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
  `SITE_LOCALES = ['en', 'es']` and `SITE_DEFAULT_LOCALE = 'en'`, typed as a
  subset of entifix's `Locale`. That one list drives the routes, the catalogs and
  content validation.
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
