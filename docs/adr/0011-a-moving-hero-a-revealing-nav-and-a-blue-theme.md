# 11. A moving hero, a revealing nav and a blue theme

- Status: Accepted
- Date: 2026-09-23
- Area: ui
- Read when: the hero's motion or the nav's reveal misbehaves with scripting off or reduced motion, a first visit paints a theme you did not expect, or a printed CV comes out dark

Supersedes, in part, [ADR 0008](0008-a-landing-page-of-five-static-sections.md):
its "the hero does not move" decision and its layout of two navigation bars.
Everything else in 0008 holds: the five sections, anchors first, the two client
leaves, headings as copy and facts as content, and the budget.

## Context

ADR 0008 kept the hero still so that nothing would delay its largest paint and
reduced motion would have nothing to handle. Building it (#29), the brief asked
for more than a still header:

- The name enters softly, and the title follows it, smaller.
- It sits on a dark-blue gradient with white text, and faint "geek" glyphs drift
  behind it.
- The navigation is hidden over the hero, appears as the visitor scrolls, and
  then stays at the top.
- A cue says the page scrolls.

The site had two palettes, light and dark, and the first visit followed
`prefers-color-scheme`. The dark blue is neither of them.

## Decision

- **The hero moves, in CSS only.** Each line enters with a `@keyframes` fade and
  rise of about 600 ms, staggered: the name first, then the title and the calls
  to action. The name starts immediately, because Chrome does not
  count text at opacity 0 as painted, so an entrance delays LCP by its own
  length. The backdrop is a gradient over a faint dot grid, with inline,
  `aria-hidden` SVG glyphs drawn like an architecture diagram (clouds, a
  database, a server, a container) drifting on long translate-only loops.
  Nothing is fetched to paint any of it.
- **The hero shows no tagline.** 0008 put one under the title. The name and the
  title carry the first screen alone; `Profile.tagline` stays in the content,
  unread by this page, until a page has a place for it.
- **Reduced motion turns every animation off.** Under
  `prefers-reduced-motion: reduce`, the text renders in place, the glyphs stand
  still and the scroll cue does not bounce.
- **One navigation bar.** The section anchors (about, projects, entifix,
  contact), the CV, the radar, a language menu and a theme menu share one bar.
  It is still the server-rendered `SiteNav`, with the same two client
  leaves 0008 decided.
- **Language and theme are dropdowns, on native `<details>`.** The language
  menu is a disclosure of plain links, so it opens and switches with scripting
  off. The theme menu renders after hydration, as entifix's `ThemeSwitcher`
  did, since without scripting a theme choice can do nothing. One more client
  leaf, `NavMenus`, keeps one menu open at a time and closes it on Escape or a
  click elsewhere. entifix's `Menu` was not used: its items exist only once
  scripting has run, which would take the language switch away from a visitor
  without it.
- **On a narrow screen the links fold into a menu.** Below 64rem the bar is
  one row (the name, the language and theme menus, and a menu button), and the
  links drop down in a full-width panel with rows tall enough to tap. The panel
  is a `<details>` too, so it works without scripting; following a link in it
  closes it. The list is rendered twice, inline and in the panel, and CSS
  shows one, so there is only ever one navigation to a screen reader. A
  sidebar drawer was weighed and passed over: it is a modal, and a focus trap
  and scroll lock are too much script for six links.
- **On the landing page, the bar reveals itself on scroll, with no script.** It
  is fixed to the top, and a scroll-driven animation
  (`animation-timeline: scroll()`) fades it in over the first stretch of scroll,
  inside `@supports`. A browser without scroll timelines shows it from the start.
  With scripting off it is plain anchors, as before. `:focus-within` shows it
  whenever a link in it has keyboard focus, so tabbing never lands on an
  invisible link. On the CV and the radar the bar is visible and static.
- **The scroll cue** is an anchor to `#about`, so it works without scripting. It
  fades in after about three seconds and fades out on the same scroll timeline.
- **A third theme, `blue`, and the first visit gets it.** `SITE_THEMES` is
  `blue`, `light`, `dark`. With nothing stored, `ThemeScript` paints and stores
  `blue` whatever the system scheme, so the hero as designed is what a visitor
  sees first. A document with no `data-theme` at all, with scripting off, is
  painted blue on screen too. Light and dark stay in the switcher, and a choice is stored as
  before. The hero's gradient is a pair of tokens in every palette, so it
  follows whichever theme is active.
- **Paper is always light.** `@media print` reapplies the light palette whatever
  `data-theme` says. The prebuilt CV PDFs are printed from a fresh browser
  context, which would otherwise paint `blue` and print navy.

## Consequences

- `prefers-color-scheme` no longer decides anything. A visitor whose system is
  light arrives on a dark-blue page until they switch.
- A browser without scroll timelines never hides the bar. That is accepted
  rather than patched with a scroll listener, which would cost a client leaf and
  run on every scroll.
- ⚠️ The reveal is keyed to the document's scroll. A landing page wrapped in its
  own scroll container would leave the bar hidden, because `scroll()` would read
  a scroller that never moves.
- The client leaves this adds (`NavMenus`, `ActiveSection`, `KeepSection`,
  `SiteThemeMenu`) are behaviour that only e2e reached, so from this record on
  the 100% unit-coverage gate counts `.tsx` as well as `.ts`: every component,
  page and layout is rendered by a spec in jsdom.
- The Lighthouse figures (LCP, CLS) that 0008 asks for are measured with the
  motion in place and written back here.

## Alternatives

- **The blue as the dark palette.** Rejected: dark keeps its role as the neutral
  low-light choice, and the blue is the site's identity rather than a scheme.
- **The blue only on the hero, whatever the theme.** Rejected by the brief: the
  blue is meant to carry the site, not frame its first screen.
- **A scroll listener toggling the bar.** Rejected: it ships script for an
  effect CSS already has, and without scripting the bar would stay hidden unless
  the listener's own fallback were right.
