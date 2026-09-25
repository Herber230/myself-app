# 13. CloudFront over a private bucket, defined in Pulumi, released on every merge

- Status: Accepted
- Date: 2026-09-24
- Area: hosting
- Read when: a URL answers differently on `herbercolop.dev` than under `serve-out`, a deploy shipped stale HTML, a merge to `main` did not deploy, or an infrastructure change is being made by hand in the console

Decides #43, which [ADR 0007](0007-hosting-deferred-build-host-neutral.md)
deferred. Builds on [ADR 0001](0001-next-static-export-on-s3.md) (the export is
the whole deployment).

## Context

The site is a directory of files (`apps/myself-app/out`, about 4 MB with the CV
PDFs). ADR 0007 kept the export host-neutral until there was something worth
publishing. There now is, and the domain `herbercolop.dev` is registered in
Route 53, in the same AWS account that will host it.

`.dev` is on the browsers' HSTS preload list: it is reachable over HTTPS or not
at all.

The repository is worked trunk-based: short branches, squash-merged into `main`
behind `CI Gate`, with Conventional Commit PR titles linted in CI. There is one
maintainer, who merges with `--admin` because `main` requires a review nobody
else can give.

## Decision

### Hosting

- **CloudFront in front of a private S3 bucket**, read through Origin Access
  Control. The bucket blocks every form of public access. Its policy lets
  `cloudfront.amazonaws.com` read (`s3:GetObject`) and list (`s3:ListBucket`)
  only when the request comes from this distribution (`AWS:SourceArn`). Listing
  is what turns a missing key into a 404 rather than a 403, so the custom error
  response can map only 404 → `/404.html` without hiding a real permission error.
- **A CloudFront Function on viewer request** does what the S3 website endpoint
  did for free: `path/` is served `path/index.html`, and a path whose last
  segment has no extension answers a 301 to `path/`. The exceptions are
  `opengraph-image` and `twitter-image`, which Next writes without an extension.
  `www.herbercolop.dev` answers a 301 to the apex. `tools/serve-static.mjs`
  mirrors the same rules, so `serve-out` stays a faithful stand-in.
- **An ACM certificate** for the apex and `www`, validated by DNS in the
  existing hosted zone. HTTP redirects to HTTPS; TLS 1.2 minimum; HTTP/2 and 3;
  IPv6; `PriceClass_100`. Response headers come from CloudFront's managed
  security headers policy (HSTS, `nosniff`, frame and referrer policies).
- **Cache-Control is set per object at upload**, and CloudFront's managed
  `CachingOptimized` policy honours it:
  - `_next/static/*` is content-hashed: `public, max-age=31536000, immutable`,
    and never deleted by a deploy, since HTML still cached in a browser may
    reference it.
  - Everything else (HTML, RSC `.txt`, `data/*.json`, PDFs, images, sitemap):
    `public, max-age=0, s-maxage=31536000, must-revalidate`. Browsers
    revalidate every time; the edge keeps it until the deploy invalidates `/*`.
- **The domain and its hosted zone are not in the stack.** Route 53 created the
  zone when it registered the domain. The stack looks it up, so no
  `pulumi destroy` can take the domain with it.

### Infrastructure as code: Pulumi

- **Pulumi in TypeScript, as the Nx project `apps/infra`** (`layer:infra`,
  which depends on no workspace project). The program is linted, type-checked
  and unit-tested like any other project, at the same 100% coverage gate, with
  `pulumi.runtime.setMocks`.
- **No TypeScript compiler at run time.** `Pulumi.yaml` sets
  `typescript: false` and `main: src/index.ts`, and Node 26 strips the types
  itself. The source uses only erasable syntax, and relative imports name their
  `.ts` file. Pulumi's own path through ts-node requires TypeScript below 7, so
  this keeps the project out of #59.
- **State in a self-managed S3 backend**, with secrets encrypted by a KMS key.
  `Pulumi.yaml` names the backend, so nobody runs `pulumi login`. The state
  bucket and key are created once, by the CloudFormation template
  `apps/infra/bootstrap/state.cfn.yaml`, because the stack cannot hold the state
  it is stored in.
- **One stack, `prod`.** `Pulumi.prod.yaml` pins `aws:allowedAccountIds`, so
  credentials for another account fail instead of deploying there.

### Delivery: continuous deployment, versioned by semantic-release

- **Every pull request runs `pulumi preview`** under a read-only role, and the
  diff is part of `CI Gate`.
- **Every merge to `main` is a release candidate.** When `Pull Request Check`
  succeeds on `main`, `deploy.yml` runs semantic-release. The squash commit's
  type decides the version: `feat` → minor, `fix` → patch, `!` or
  `BREAKING CHANGE` → major. A release is a `vX.Y.Z` tag plus a GitHub Release
  with generated notes. Then `pulumi up`, then the site is built with
  `NEXT_PUBLIC_SITE_URL=https://herbercolop.dev`, synced and invalidated.
- **A merge that releases nothing deploys nothing** (`chore`, `docs`, `ci`,
  `test`, `build`). `workflow_dispatch` redeploys `main` by hand when a change
  of that kind needs to go out.
- **GitHub OIDC, no stored keys.** The preview role trusts
  `repo:Herber230/myself-app:pull_request`. The deploy role trusts only the
  `production` environment, which only `main` may deploy to. The deploy role
  can change what the stack owns: its bucket, CloudFront, ACM, records in this
  zone, and IAM roles named `myself-app-*`.

## Alternatives

- **The S3 website endpoint alone.** It resolves index documents and serves
  `404.html` without help, but only over HTTP, on an AWS host name, from a
  public bucket. Ruled out by `.dev` being HTTPS-only.
- **CDK.** Also TypeScript. It synthesizes CloudFormation, which needs a
  `cdk bootstrap` stack in the account, and the plan (`cdk diff`) and the apply
  go through a separate service. Pulumi applies directly, and its preview is
  the same engine as its apply.
- **Pulumi Cloud for state.** Free for one person, with history and a UI, but a
  second account and a second credential in CI. The S3 backend keeps
  everything in one AWS account behind one OIDC role. Its locking is a lock
  object in the bucket, and the deploy workflow's `concurrency` group keeps two
  runs from racing it.
- **release-please.** It keeps a committed `CHANGELOG.md` through a release
  PR. In continuous deployment that PR would have to merge itself, which needs
  a GitHub App token, so CI runs on it, and a bypass of the review rule, since
  auto-merge cannot use `--admin`. Every change would also go through CI twice.
- **`nx release`.** It commits the version and changelog to `main` directly,
  which the branch protection refuses.

## Consequences

- There is no `CHANGELOG.md`, and `package.json` stays at `0.0.0`. The GitHub
  Releases page is the changelog, and the tags are the versions.
- A PR title's type is now a release decision, not only a label. `feat:` ships
  a minor version. A refactor titled `feat:` ships a release with nothing in
  it.
- A new AWS resource the site needs is added to `apps/infra`, never in the
  console. The stack would not know about it, and the next `pulumi up` could
  conflict with it.
- `NEXT_PUBLIC_SITE_URL` is an input of `myself-app:build`. Without it, Nx could
  replay a cached build carrying `http://localhost:3100` into the bucket.
- The deploy role can create and change roles named `myself-app-*`, its own
  included. That is the price of `pulumi up` in CI. The trust on the
  `production` environment is what bounds it.
