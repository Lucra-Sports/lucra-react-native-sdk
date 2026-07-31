#!/bin/bash
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/metro.sh"

cd "$SCRIPT_DIR/../example"

metro_start "${RCT_METRO_PORT:-8082}" || exit 1

yarn e2e:run-ios
