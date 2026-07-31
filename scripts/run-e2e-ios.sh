#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=scripts/metro.sh
source "$SCRIPT_DIR/metro.sh"

cd "$SCRIPT_DIR/../example" || exit 1

metro_start "${RCT_METRO_PORT:-8082}" || exit 1

yarn e2e:run-ios
