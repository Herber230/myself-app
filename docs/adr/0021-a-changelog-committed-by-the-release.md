# 21. A changelog committed by the release

- Status: Accepted
- Date: 2026-09-30
- Area: hosting
- Read when: `CHANGELOG.md` is missing a release or disagrees with its GitHub Release, the release job cannot push to `main`, a deploy shipped a commit that is not the squash commit, or `main` gained a `chore: release` commit nobody wrote

Revises [ADR 0013](0013-cloudfront-over-a-private-bucket-defined-in-pulumi.md),
which kept no `CHANGELOG.md` and made the Releases page the changelog. The
rest of ADR 0013 — continuous deployment, the squash commit's type as the
release decision, the order release → infrastructure → site — holds.

## Context

A release is a `vX.Y.Z` tag and a GitHub Release, written by semantic-release
when `Pull Request Check` succeeds on `main`. The notes exist only on GitHub:
a clone, a tarball or a reader of the repository sees no history of what
shipped. ADR 0013 accepted that because writing a file back meant committing
to `main` from CI, which its branch protection refuses — one approving review
and `CI Gate` on every change, with only an administrator able to bypass
them.

The standard answer is semantic-release's own: `@semantic-release/changelog`
writes the notes into `CHANGELOG.md`, and `@semantic-release/git` commits the
file and tags that commit. Both run in the release itself, so the file, the
tag and the GitHub Release are written together, from the same notes.

## Decision

- **The release writes `CHANGELOG.md`.** One semantic-release run analyzes the
  squash commit, generates the notes, prepends them to the file, commits it
  to `main` as `chore: release X.Y.Z [skip ci]`, tags that commit and
  publishes the GitHub Release. A push that fails, because `main` moved,
  stops the run before the tag; the newer commit's own run releases both, as
  before. The file was seeded from the eight releases before it.
- **A GitHub App pushes it.** `main`'s protection is a ruleset whose one
  bypass actor, besides the repository's administrators, is an App with
  `contents: write` on this repository and nothing else. Its key lives in the
  `release` environment, which only `main` may use, and the release job takes
  a token for one run from it. A personal token would act as the maintainer,
  expire, and carry every permission the maintainer has; classic branch
  protection cannot exempt an App from a required check, so the ruleset
  replaces it.
- **The deploy ships the release commit.** The tag names the commit holding
  the changelog, one commit past the one `Pull Request Check` passed. The
  release job checks that the two differ in `CHANGELOG.md` and nothing else,
  and fails otherwise; infrastructure and site check out the tagged commit.
  A re-run accepts `main` one `chore: release` commit past the checked one
  as its own release.
- **`[skip ci]` keeps the commit from deploying twice.** Without it, the push
  would run `Pull Request Check` on `main`, then this workflow again. That run
  would release nothing, since `chore` releases nothing, but it would rebuild
  for no reason.

## Alternatives

- **No changelog file** (ADR 0013's choice). Nothing to configure, and no
  commit on `main` that no pull request carried. Rejected: the history of
  releases would live outside the repository.
- **A changelog synced from the Releases, committed by the next pull request**,
  as `tools/sync-adrs.mjs` copies the records. No App and no bypass, but the
  file lags one release behind the tag, and a pull request fails for a release
  it did not make.
- **release-please.** Still ADR 0013's reason: its release pull request must
  merge itself, which needs a bypass anyway, and every change goes through CI
  twice.

## Consequences

- `main` gains a `chore: release X.Y.Z [skip ci]` commit after each release,
  authored by the App's bot. Pull before branching after a merge that
  released.
- `CHANGELOG.md` is written by a tool, in its own style: Prettier ignores it,
  and it is never edited by hand. A correction goes into the GitHub Release
  and the file in the same pull request.
- The commit that ships was never checked by CI. The diff guard is what makes
  that safe; a plugin that wrote another file into the commit would stop the
  deploy.
- One stored credential now exists, the App's key. It can push to this
  repository and nothing else, and no AWS access depends on it.
- `package.json` still says `0.0.0`; the tags are the versions.
