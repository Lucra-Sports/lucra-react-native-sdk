#!/bin/bash
set -euo pipefail
set -x

cd "$(dirname "$0")/../example/android"

./gradlew --stop || true

./gradlew assembleDebug --max-workers=1 --console=plain 2>&1 | tee assembleDebug.log

echo "🟦 Assemble debug done!"

./gradlew assembleAndroidTest -DtestBuildType=debug --console=plain 2>&1 | tee assembleAndroidTest.log

echo "🟦 Assemble android test done!"
