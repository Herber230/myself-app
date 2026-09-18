# 9. The radar's maths is ported, and it runs at build time

- Status: Accepted
- Date: 2026-09-18
- Area: ui
- Read when: the radar's blips moved between two builds, or a radar library is
  proposed

## Context

The tech radar (#39, #40) is the site's one genuinely graphical page: four
quadrants, four rings, and a blip per technology that must sit inside its own
segment without landing on a neighbour.

[zalando/tech-radar](https://github.com/zalando/tech-radar) solves exactly this
and is MIT licensed, but it ships as a single `docs/radar.js` that expects d3 v4
on a global and draws the SVG itself. There is no package to depend on, and a
script that owns the DOM does not compose with React, with two themes read from
CSS variables, or with copy that comes from a catalog.

The page is exported as static HTML ([ADR 0001](0001-next-static-export-on-s3.md)),
and [ADR 0003](0003-build-time-pages-and-browser-queries.md) gives a component
the choice of rendering at build or querying in the browser.

## Decision

**The geometry and layout are ported to TypeScript, and they run during
`next build`.**

- `apps/myself-app/src/components/tech-radar/` holds the port: the seeded
  generator, the sixteen segments, and `layoutRadar`, which places, numbers and
  separates blips. Each file carries Zalando's MIT notice, as the licence
  requires of derived work.
- The page renders the resulting coordinates as SVG in a server component. The
  radar therefore ships **no JavaScript**, and an e2e journey loads the page
  with JavaScript disabled to keep it that way.
- **The force simulation is not ported.** d3's `forceCollide` separates
  coincident nodes with `Math.random`, so its output differs between runs; the
  export would then differ on every build and a screenshot diff would be noise.
  A relaxation pass driven by the same seeded generator settles to the same
  24px separation and is deterministic.
- The control knows no semantics. Quadrant and ring names arrive as props from
  the catalogs, and blips arrive as data. What the four rings _mean_ for one
  person is still open in #39, and answering it must not touch the SVG.
- Blips are numbered by the **default locale's** label, so a technology keeps
  its number on both the English and the Spanish page.

## Consequences

- No new dependency, and nothing to keep in step with an upstream release. The
  cost is that an upstream fix to the reference radar is not free: it is a
  deliberate re-port.
- The layout is a pure function, so the properties that matter — every blip in
  its own quadrant and ring, no two overlapping, the same result twice — are
  unit tests in the existing node-environment Vitest setup, with no DOM.
- Filtering in the browser (#41) will need a decision of its own: either
  re-running this layout in a client component, which pulls it into the bundle,
  or hiding blips that the build already placed. Until then nothing about the
  radar reaches the browser.

## Alternatives

- **Vendor `radar.js` as-is, with d3.** Fastest to a picture, and wrong
  afterwards: a global-scoped script that owns the DOM, a d3 v4 dependency in
  the client bundle, colours and copy hardcoded in a config object, and a layout
  that differs on every build.
- **A charting library.** None of them draw a radar of this shape; the segment
  bounding and the collision pass would still have to be written.
- **Lay out in the browser.** Ships the maths to every visitor for a picture
  that does not change after it is drawn, and leaves the page blank without
  JavaScript.
