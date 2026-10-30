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

  case "$AE" in
    *jettythegeek*) ;;
    *)
      echo "ERROR: Commit $sha has invalid author email '$AE'." >&2
      exit 1
      ;;
  esac

  case "$CE" in
    *jettythegeek*) ;;
    *)
      echo "ERROR: Commit $sha has invalid committer email '$CE'." >&2
      exit 1
      ;;
  esac

  if printf '%s\n' "$BODY" | grep -iqE '(^|[[:space:]])co-authored-by:'; then
    echo "ERROR: Commit $sha contains a forbidden Co-authored-by trailer." >&2
    exit 1
  fi
done

echo "All checked commits verified: authored and committed exclusively by jettythegeek with no Co-authored-by trailers."
