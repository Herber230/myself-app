# 12. The CV as a paper sheet, in variants and two modes

- Status: Accepted
- Date: 2026-09-23
- Area: ui
- Read when: a CV page spills onto a second page, an applicant tracking system reads the PDF wrong, a variant shows the wrong bullets, a CV URL 404s under `serve-out`, or the printed sheet differs from the screen

Decides #33. Builds on [ADR 0003](0003-build-time-pages-and-browser-queries.md)
(pages render at build) and [ADR 0011](0011-a-moving-hero-a-revealing-nav-and-a-blue-theme.md)
(paper is always light).

## Context

`/[locale]/cv/` is the page most likely to be judged, and it is judged twice:
by a person skimming it for a few seconds, and by an applicant tracking system
(ATS) that extracts its text and parses it into fields. The two want different
things. The person wants hierarchy, a little colour, and recognisable icons.
The parser wants plain text in one column, standard headings, and a URL written
out where an icon would stand.

The reference is Herber's own one-page CV, written in Google Docs. Its layout
works for both readers: one column, standard sections, a real text layer. Its
content does not:

- every role has a single line and no achievements;
- the contact links are icons followed by a bare handle (`/herbercolop`), which
  extract as nothing useful;
- there is no location;
- a role's title, dates and description share a line;
- the Spanish version mixes in English months and headings.

Herber is also more than one hire: backend, frontend, devops, or all three. One
sheet cannot lead with all of them.

## Decision

- **Variants.** A `CvVariant` is a reading of the same career: its title and
  summary, the technologies it lists, the employments it shows, and the
  _focuses_ it takes. The variants are `full-stack` (the default), `backend`,
  `frontend` and `devops`.
- **Focuses select the bullets.** A `CvFocus` is backend, frontend or devops.
  Each `EmploymentHighlight` of a role carries the focuses it speaks to, and a
  variant shows the highlights that share one of its own. One role reads
  differently in each variant without its copy being written twice. Focuses are
  a link collection rather than a list of enum values, because the static
  adapter validates links (every id exists) and does not validate scalar
  collections.
- **The sheet adds education, certificates and a location.** `Education`,
  `Certificate` and `Profile.location` are content, like every other fact.
- **Two modes, both static.** _Human_ adds icons beside the contact text, one
  accent colour, dates aligned right, and technologies as chips. _ATS_ writes
  each contact as a label and a full URL, uses no colour, puts dates inline and
  technologies on one comma-separated line. The human mode is ATS-tolerant, not
  ATS-hostile, because a recruiter forwards whatever PDF they were given into
  their own system: decoration only ever sits beside text, never replaces it,
  and every link's target is the full URL.
- **Neither mode** uses two columns, a photo, skill bars, or text in a header or
  footer. Those are what breaks extraction.
- **URLs.** The default variant lives only at `/[locale]/cv/`, so no two URLs
  show the same sheet:

  | Path                          | Shows                      |
  | ----------------------------- | -------------------------- |
  | `/[locale]/cv/`               | the default variant, human |
  | `/[locale]/cv/ats/`           | the default variant, ATS   |
  | `/[locale]/cv/[variant]/`     | another variant, human     |
  | `/[locale]/cv/[variant]/ats/` | another variant, ATS       |

  The static `ats` segment wins over `[variant]`, and a site rule forbids a
  variant with the id `ats`. The ATS pages are `noindex`, with their human page
  as canonical, and are left out of the sitemap.

- **The mode is a route, not client state.** A route needs no JavaScript, can
  be linked to, and lets the PDF renderer print a URL instead of clicking a
  toggle in a headless browser.
- **A4, one page.** The sheet is `210mm × 297mm` on screen and in print, the
  same component in both. On a phone it scales down rather than reflowing into
  another document. Content that does not fit on one page is an editorial
  problem, and e2e fails on it.
- **Two ways to a PDF.** Printing from the browser is the only way to get a
  customized sheet, and its output depends on the visitor's browser and
  settings, so it is best effort. Every variant, mode and locale is also
  rendered to PDF by headless Chromium after the export and shipped as a static
  file: identical for everyone, and usable on a phone. Both use the same print
  stylesheet.
- **Customizing a sheet in the browser (#38) is deferred** to the `Backlog`
  milestone. Variants and the two modes cover what a visitor needs now.

## Consequences

- Sixteen pages and sixteen PDFs: four variants, two modes, two locales. Visual
  baselines grow with them, so a design change is reviewed as many screenshots.
- The one-page limit means real content (#26) may not fit. The fix is to cut
  copy or tag fewer highlights to a focus, not to shrink the type.
- Adding a variant is a content change: one record in `cv-variants.json`.
  Adding a focus is a content change as well, followed by tagging highlights.
- An ATS reads the text the PDF carries, so the ATS PDF's text is checked in
  e2e: the full contact URLs, every heading, in reading order. "ATS optimized"
  is a gate, not a claim.

## Alternatives considered

- **Hand-picking the highlights for each variant**: the most control, and the
  most copy to maintain. Tagging by focus keeps one list per role.
- **A client-side toggle for the mode**: needs a client island, and the prebuilt
  PDF could not reflect it.
- **Two pages allowed**: gives room, and loses the one-page discipline a
  skimming reader rewards.
- **A4 and US Letter**: doubles the PDFs and baselines. An A4 sheet with its own
  margins prints acceptably on Letter.
