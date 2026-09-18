# Architecture Decision Records

Short records of significant decisions — the context, the decision, and its
consequences. One file per decision, numbered.

**An ADR's reasoning is immutable; its factual claims are not.** A statement
about how the site is arranged is corrected in place when it stops being true. A
_decision_ that no longer holds is superseded by a new record, never edited away.

Format: [Michael Nygard's ADR template](https://github.com/joelparkerhenderson/architecture-decision-record),
with the headers entifix uses.

## Headers

```
- Status: Proposed | Accepted | Superseded by [ADR 00XX](…)
- Date: <YYYY-MM-DD>
- Area: platform | data | i18n | ui | hosting
- Read when: <the symptom that should send a reader here>
```

`- Read when:` names the **symptom**, not the subject: a line naming the subject
gets skipped, one naming the symptom gets read.

## Correcting a record

- **Fix** — the record asserts something now false. Correct it where it stands.
- **Clarify** — the reasoning holds and the wording misleads. Rewrite in place.
- **Supersede** — the _decision_ no longer holds. A new record, with a pointer
  forward in the old one and its text kept. Supersession is symmetric: both
  records say so.

An accepted record edited in place gains a line, so every edit is greppable:

```
- Revised: <date> by [#issue or ADR] — <what changed, in one clause>
```

## The records

- [0001](0001-next-static-export-on-s3.md) — **A Next static export served from S3.** Read when reaching for a server feature — `headers()`, cookies, a proxy, a route handler — or wondering why this is Next rather than Vite.
- [0002](0002-a-static-adapter-behind-the-repository-port.md) — **A static adapter behind entifix's repository port.** Read when loading content, or tempted to import `@entifix/testing-unit` outside a spec.
- [0003](0003-build-time-pages-and-browser-queries.md) — **Pages render at build; interactive parts query in the browser.** Read when a component needs data, or a page's client bundle grew.
- [0004](0004-nx-workspace-and-package-layout.md) — **An Nx workspace: app, domain, static adapter, content.** Read when adding a package or an import between two, or putting an entity class somewhere.
- [0005](0005-two-locales-and-localized-content.md) — **English and Spanish, with localized content fields.** Read when adding copy or content, or when a translation is missing.
- [0006](0006-tailwind-and-entifix-style.md) — **Tailwind v4 and everything `@entifix/style` involves.** Read when styling anything, or when a primitive renders unstyled.
- [0007](0007-hosting-deferred-build-host-neutral.md) — **Hosting is deferred; the build stays host-neutral.** Read when a URL works in `next dev` but not in the export, or when choosing where the site is served from.
- [0008](0008-a-landing-page-of-five-static-sections.md) — **A landing page of five static sections.** Read when adding or reordering a landing section, or when the in-page nav or the language switch loses its place.
