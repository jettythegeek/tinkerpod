#!/usr/bin/env sh
set -eu

RANGE="${1:-HEAD}"

for sha in $(git rev-list "$RANGE"); do
  AN=$(git show -s --format='%an' "$sha")
  AE=$(git show -s --format='%ae' "$sha")
  CN=$(git show -s --format='%cn' "$sha")
  CE=$(git show -s --format='%ce' "$sha")
  BODY=$(git show -s --format='%B' "$sha")

  if [ "$AN" != "jettythegeek" ]; then
    echo "ERROR: Commit $sha has invalid author name '$AN' (expected 'jettythegeek')." >&2
    exit 1
  fi

  if [ "$CN" != "jettythegeek" ]; then
    echo "ERROR: Commit $sha has invalid committer name '$CN' (expected 'jettythegeek')." >&2
    exit 1
  fi

  if [ "$AE" != "jettythegeek@users.noreply.github.com" ]; then
    echo "ERROR: Commit $sha has invalid author email '$AE' (expected 'jettythegeek@users.noreply.github.com')." >&2
    exit 1
  fi

  if [ "$CE" != "jettythegeek@users.noreply.github.com" ]; then
    echo "ERROR: Commit $sha has invalid committer email '$CE' (expected 'jettythegeek@users.noreply.github.com')." >&2
    exit 1
  fi

  if printf '%s\n' "$BODY" | grep -iqE '(^|[[:space:]])co-authored-by:'; then
    echo "ERROR: Commit $sha contains a forbidden Co-authored-by trailer." >&2
    exit 1
  fi
done

echo "All checked commits verified: authored and committed exclusively by jettythegeek with no Co-authored-by trailers."
