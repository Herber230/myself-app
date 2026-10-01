#!/usr/bin/env bash
# Resizes an original photo for the site: a large copy (1600px on its long
# edge) and a thumbnail (640px), both WebP, upright, with every metadata field
# stripped (camera, date, location). Originals stay out of git, in
# apps/myself-app/public/images/ (.gitignore); only the copies are committed.
#
#   tools/optimize-photo.sh <original> <destination without extension>
#   tools/optimize-photo.sh "apps/myself-app/public/images/DSC_0216.jpg" \
#     apps/myself-app/public/beyond-code/moto-corner-2
#
# Writes <destination>.webp and <destination>-thumb.webp. Needs ImageMagick;
# a camera RAW (.dng) goes through macOS's sips first.
set -euo pipefail

if [ $# -ne 2 ]; then
  echo "usage: $0 <original> <destination without extension>" >&2
  exit 64
fi

source=$1
destination=$2
mkdir -p "$(dirname "$destination")"

case "$(printf %s "$source" | tr '[:upper:]' '[:lower:]')" in
  *.dng)
    temporary=$(mktemp -t optimize-photo).jpg
    trap 'rm -f "$temporary"' EXIT
    sips -s format jpeg -s formatOptions best "$source" --out "$temporary" >/dev/null
    source=$temporary
    ;;
esac

magick "$source" -auto-orient -strip -resize '1600x1600>' -quality 78 "$destination.webp"
magick "$source" -auto-orient -strip -resize '640x640>' -quality 72 "$destination-thumb.webp"
echo "$destination.webp $(magick identify -format '%wx%h' "$destination.webp")"
