#!/bin/bash
set -euo pipefail
set -x

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=scripts/metro.sh
source "$SCRIPT_DIR/metro.sh"

cd "$SCRIPT_DIR/../example" || exit 1

metro_start 8081 || exit 1

yarn e2e:run-android --headless
