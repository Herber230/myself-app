# 14. A personal radar: rings for one person, editions in content, filtering over placed blips

- Status: Accepted
- Date: 2026-09-25
- Area: ui
- Read when: a blip shows the wrong movement, a ring's meaning is questioned, a technology needs its own page, or the radar's filter is about to query in the browser

Decides #39. Answers the question [ADR 0009](0009-a-radar-laid-out-at-build-time.md)
left open for #41, and stays within
[ADR 0003](0003-build-time-pages-and-browser-queries.md) (no entifix in the
browser).

## Context

Thoughtworks' radar is an organisation's: its rings say what a company advises
its teams. On one person's radar the same words have to say something a reader
can check against a CV, movement has to be measured from somewhere, and the
page has to offer more than a picture — a detail per technology, and a filter.

## Decision

- **Rings, for one person** (content, `rings.json`): _Adopt_ — I use it in
  production, and I would choose it again. _Trial_ — I have shipped with it.
  _Assess_ — I am learning it. _Hold_ — I have moved away from it. The page
  prints them beside the radar.
- **Quadrants** stay Thoughtworks' four. **Areas** stay many-to-many tags on a
  technology, for filtering and CV variants; a quadrant is single-valued.
- **Movement is measured against an edition in content.** `RadarEdition`
  (`radar-editions.json`) records each redraw; a blip is new, moved in or
  moved out relative to the ring it sat in on the latest edition's date,
  derived from `TechnologyUsePeriod`. Not the build's clock: the same content
  always draws the same radar, and a screenshot only changes when an edition
  is added.
- **A static page per technology**, `/<locale>/tech-radar/<id>/`: its
  description, areas, links, ring history and the projects that use it. It
  works without JavaScript, can be linked and crawled, and the blips and the
  legend link to it. The legend keeps its `#tech-<id>` anchors (ADR 0008).
- **Filtering dims blips the build already placed.** One client component
  wraps the chart and legend and filters props passed from build time, by
  quadrant, ring and area (combined with `and`, an area matching any of a
  technology's areas) and a search over names. The layout does not re-run in
  the browser, so the radar keeps its shape. The filter lives in the query
  string (`?quadrant=&ring=&area=&q=`), read after hydration, so a filtered
  view can be shared; without JavaScript the full radar is shown.

## Consequences

- Redrawing the radar is a content change: add an edition, move the periods.
- The filter's matching is a pure function, checked against the static
  adapter's `load` for every combination, so the browser and the build cannot
  disagree about which technologies a filter selects.
- The radar page ships a small client island; its script size is budgeted in
  e2e beside the landing page's.

## Alternatives

- **Movement from a rolling window on the build date.** Always current, but
  the same content would draw a different radar on a later build.
- **The detail inline in the legend, or in a client-side panel.** One page
  fewer, but a long legend, or client code and a no-JavaScript fallback, and
  neither gives a technology a URL of its own.
- **Re-running the layout in the browser on filter.** Pulls the layout into
  the bundle and reshuffles the radar on every change.
