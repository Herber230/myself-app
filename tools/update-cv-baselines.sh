#!/usr/bin/env bash
# Renders the CV's visual baselines on Linux x64, as CI renders the pages
# (apps/myself-app-e2e/src/cv-visual.spec.ts, docs/DEVELOPING.md).
#
#   tools/update-cv-baselines.sh
#
# The working tree is copied into Playwright's own image — the one matching
# this repository's Playwright — with the pinned Node and pnpm installed on
# top. Nothing in it touches this checkout's node_modules: only the snapshot
# folder comes back. It needs Docker, and takes a few minutes under emulation
# on an ARM machine.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

playwright=$(node -p "require('./package.json').devDependencies['@playwright/test']")
node_version=$(node -p "process.versions.node")
pnpm_version=$(pnpm --version)
snapshots=apps/myself-app-e2e/src/cv-visual.spec.ts-snapshots
out=$(mktemp -d)
trap 'rm -rf "$out"' EXIT

git ls-files -z --cached --others --exclude-standard |
  COPYFILE_DISABLE=1 tar --no-xattrs --null -T - -cf - |
  docker run --rm -i --ipc=host --platform linux/amd64 \
    -e HUSKY=0 -e CI=1 -v "$out:/out" \
    "mcr.microsoft.com/playwright:v$playwright-noble" \
    bash -euo pipefail -c "
      mkdir /work && cd /work && tar -xf - 2>/dev/null
      curl -fsSL https://nodejs.org/dist/v$node_version/node-v$node_version-linux-x64.tar.gz |
        tar -xz -C /opt
      export PATH=/opt/node-v$node_version-linux-x64/bin:\$PATH
      npm install --global --silent pnpm@$pnpm_version
      pnpm install --frozen-lockfile
      pnpm nx e2e myself-app-e2e --skip-nx-cache -- cv-visual --update-snapshots=all
      cp -r $snapshots /out/
    "

rm -rf "$snapshots"
cp -r "$out/$(basename "$snapshots")" "$snapshots"
echo "updated $(find "$snapshots" -name '*.png' | wc -l | tr -d ' ') baselines in $snapshots"
