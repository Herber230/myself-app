# 15. Customizing the CV in the browser: the URL holds what is hidden, a stylesheet hides it

- Status: Accepted
- Date: 2026-09-25
- Area: ui
- Read when: a customized CV flashes its hidden parts on load, loses a choice on reload, in print or after switching reading, or the customizer is about to query content in the browser

Decides #38, which [ADR 0012](0012-the-cv-as-a-paper-sheet.md) deferred.
Stays within [ADR 0003](0003-build-time-pages-and-browser-queries.md): no
entifix in the browser.

## Context

A variant is one person's guess at what a reader wants. The visitor holding
the job description knows better: leave out a section, an old position, a
technology the role does not care about, then print. Every sheet is rendered
at build time, and the page must stay that way: the static HTML, the prebuilt
PDFs and the ATS pages are what search engines, parsers and phones get.

## Decision

- **The server renders everything; a stylesheet hides.** On the human sheet,
  each section, position and technology carries `data-cv-part`
  (`section:education`, `position:<period id>`, `tech:<technology id>`). A
  hidden part is one `display: none` rule in a single
  `<style id="cv-hidden">` in `<head>`. The markup never changes per visitor,
  so hydration never mismatches, and the rule holds in print, so printing
  honours every choice.
- **The URL holds the choices**: `?hide=section:education,tech:react`. A
  customized sheet is a link, and reloads the same. Tokens are checked against
  `^(section|position|tech):[a-z0-9-]+$`, so none can break out of its
  selector; a token naming a part the sheet does not have matches nothing.
  The customizer reads the URL through `useSyncExternalStore` and rewrites it
  with `history.replaceState`, as the radar's filter does (ADR 0014).
- **Hidden before the first paint.** An inline script ahead of the sheet reads
  `?hide=` and writes the stylesheet, as `ThemeScript` sets the palette. A
  shared link opens without a flash of what it hides. After hydration the
  customizer owns the stylesheet, and removes it when its page is left: on a
  client-side navigation the inline script does not run again.
- **The controls are plain props.** Sections, positions and technologies
  reach the client component as `{ part, label }` lists built at build time;
  no entifix code reaches the page, and e2e checks the CV's scripts for it as
  it does the radar's.
- **Human sheet only.** The ATS pages carry no parts, no script and no
  controls: what a parser reads stays exactly what was built.
- **The prebuilt PDF stays whole.** It cannot know a visitor's choices. When
  anything is hidden the customizer says so: the download is the full sheet,
  printing keeps the choices.
- **Switching reading or mode starts afresh.** Those links are built without
  the query: positions and technologies differ between variants, and the ATS
  sheet has no choices to keep.

## Consequences

- The CV page ships a client island. Its scripts are held to a budget in
  `budget.spec.ts`: 159.6 KB measured, 170 KB allowed.
- Hiding only removes content, so a customized sheet still fits one A4 page
  (ADR 0012) without a check of its own.
- A browser without scripting gets the full sheet and no controls: the same
  page as before #38.
- The human sheet's visual baselines include the closed "Customize"
  disclosure.

## Alternatives considered

- **State only in the page**: nothing to parse, nothing to flash, but a
  choice is lost on reload and cannot be shared.
- **Re-rendering the sheet on the client from its data**: puts the sheet's
  logic in the browser, and hydrating a sheet that differs from its HTML is
  a mismatch to manage. CSS over the built markup needs neither.
- **Hiding with a class set by React on each part**: the parts are server
  components, and would have to become client ones.
