#!/bin/bash
set -uo pipefail
set -x

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/metro.sh"

cd "$SCRIPT_DIR/../example"

metro_start 8081 || exit 1

yarn e2e:run-android --headless
