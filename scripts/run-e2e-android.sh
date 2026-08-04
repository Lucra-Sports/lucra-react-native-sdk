#!/bin/bash
set -euo pipefail
set -x

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=scripts/metro.sh
source "$SCRIPT_DIR/metro.sh"

cd "$SCRIPT_DIR/../example" || exit 1

metro_start 8081 || exit 1

set +e
yarn e2e:run-android --headless
detox_status=$?
set -e
echo "detox exited rc=$detox_status — tearing down Metro"
exit "$detox_status"
