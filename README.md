# myself-app

Herber Colop's developer profile, built on [entifix](https://github.com/r10c-technologies/entifix)
and exported as static files for an S3 bucket.

Three pages, in English and Spanish:

- **Home** — a landing page: projects, social links, and the entifix this site runs on.
- **CV** — a digital paper sheet, in variants per role, printable to PDF.
- **Tech radar** — an interactive radar of the technologies and techniques I use.

The previous Vite app is kept as the `legacy-vite` tag, as reference only.

## Working on it

Toolchain: Node 26.4 and pnpm 11.9 (see `engines`), Nx 23.

```sh
pnpm install
pnpm nx dev myself-app                          # http://localhost:3000
pnpm nx run-many -t lint,typecheck,test,build,e2e   # everything CI runs
pnpm nx build myself-app                        # static export into apps/myself-app/out
pnpm nx serve-out myself-app                    # serve the export like S3: http://localhost:3100
```

The workflows — adding a page, copy, styling, a package, working on an unreleased entifix — are in [`docs/DEVELOPING.md`](docs/DEVELOPING.md).

## Where things are decided

- Architecture decisions: [`docs/adr/`](docs/adr/).
- What is next and whether it is done: the GitHub milestones, M0 to M5.
