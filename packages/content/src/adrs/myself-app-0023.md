## Context

How this repository ships is as deliberate as how it is built: two git hooks,
a pull-request check whose one required job is `CI Gate`, a squash merge
whose type decides the release, a changelog committed by a GitHub App
([ADR 0021](/projects/myself-app/adr/0021/)), and a deploy
through OIDC with no stored keys
([ADR 0013](/projects/myself-app/adr/0013/)).
None of it was visible on the site. A project's page already draws its
architecture and layers from content
([ADR 0022](/projects/myself-app/adr/0022/)); the pipeline is the same
kind of picture, with one difference: what it describes is not this site's
code but YAML and shell files that change on their own.

## Decision

- **A Delivery section on the project page.** A graph of the pipeline, a
  column per stage (the machine, the pull request, the checks, the gate, the
  merge, the deploy) and an arrow per wait; a job chosen tells what it runs,
  the file that defines it and the records that decided it; scenarios walk a
  change through it — a `feat` that ships, a `docs` change that releases
  nothing, an attributed commit refused twice, a failing journey that blocks
  the merge.
- **The jobs are content, held to the files.** `PipelineStage`,
  `PipelineJob`, `PipelineScenario` and `PipelineStep`, localized like the
  rest. A job names its `workflow` file and its `job` key there. The
  conventions spec reads `.github/workflows/*.yml` and fails when a file is
  missing, a workflow has a job the content does not draw (or the reverse),
  or what a job `needs` within one workflow differs. Arrows across files (a
  hook to the check, the merge to the deploy) are the flow, not YAML, and
  are not checked.
- **The graph draws only arrows no longer path implies.** `CI Gate` needs
  `initialize` and every check; drawn whole, that arrow would cross the
  checks. A transitive reduction keeps the waits true and the picture legible.
- **The release decision reads the release's own config.** The route reads
  the latest version from `CHANGELOG.md` and each type's level and section
  from `.releaserc.json` (plus the `conventionalcommits` preset's own: `feat`
  a minor, `fix` a patch, `!` a major), at build. Both files are inputs of
  `myself-app:build`. It is given only to the project whose repository the
  changelog's links name. Change the release config and the widget follows;
  nothing is copied.

## Consequences

- A workflow change now fails the conventions spec until the drawing
  follows: that is the point, and it costs an edit to `pipeline-jobs.json`.
- A job's prose (what it does, why) is not checked: a step renamed inside a
  job can leave its text stale.
- The release decision's date is the reader's, set after hydration; the
  build's would be the day of the deploy.
- entifix has no pipeline drawn yet; its page shows no Delivery section until
  its content exists.
