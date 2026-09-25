#!/usr/bin/env bash
# Publishes the static export to the site bucket and invalidates CloudFront
# (ADR 0013). Run by `pnpm nx deploy myself-app`, locally or from deploy.yml.
#
#   tools/deploy-site.sh <out-dir> <bucket> <distribution-id>
#
# Cache-Control is set per object, and CloudFront's CachingOptimized policy
# honours it:
#   - `_next/static/*` is content-hashed: immutable for a year, and never
#     deleted, since HTML still cached in a browser may reference it.
#   - Everything else revalidates in the browser, and stays at the edge until
#     the invalidation at the end of this script.
set -euo pipefail

out=${1:?usage: tools/deploy-site.sh <out-dir> <bucket> <distribution-id>}
bucket=${2:?usage: tools/deploy-site.sh <out-dir> <bucket> <distribution-id>}
distribution=${3:?usage: tools/deploy-site.sh <out-dir> <bucket> <distribution-id>}

IMMUTABLE='public, max-age=31536000, immutable'
REVALIDATE='public, max-age=0, s-maxage=31536000, must-revalidate'

# An empty or half-written export must never reach the `--delete` below.
for required in index.html 404.html sitemap.xml _next/static; do
  if [[ ! -e "$out/$required" ]]; then
    echo "deploy-site: $out/$required is missing; build the export first." >&2
    exit 1
  fi
done
# The origin is baked in at build time (src/site-url.ts). A build without
# NEXT_PUBLIC_SITE_URL points the sitemap and canonical links at localhost.
if grep -q 'localhost' "$out/sitemap.xml"; then
  echo 'deploy-site: the export names localhost; build it with NEXT_PUBLIC_SITE_URL.' >&2
  exit 1
fi

# 1. Hashed assets first, so no new HTML ever references a missing file.
aws s3 sync "$out/_next/static" "s3://$bucket/_next/static" \
  --cache-control "$IMMUTABLE" --no-progress

# 2. The images Next writes without an extension, which the CLI cannot type.
aws s3 cp "$out" "s3://$bucket" --recursive \
  --exclude '*' --include '*opengraph-image' --include '*twitter-image' \
  --content-type image/png --cache-control "$REVALIDATE" --no-progress

# 3. Everything else, deleting what the export no longer has. Excluded keys
#    are neither uploaded nor deleted here.
aws s3 sync "$out" "s3://$bucket" --delete \
  --exclude '_next/static/*' --exclude '*opengraph-image' --exclude '*twitter-image' \
  --cache-control "$REVALIDATE" --no-progress

# 4. Drop every cached copy at the edge, and wait until it is gone.
invalidation=$(aws cloudfront create-invalidation \
  --distribution-id "$distribution" --paths '/*' \
  --query 'Invalidation.Id' --output text)
aws cloudfront wait invalidation-completed \
  --distribution-id "$distribution" --id "$invalidation"

echo "deploy-site: $out is live from s3://$bucket (invalidation $invalidation)."
