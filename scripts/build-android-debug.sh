#!/bin/bash
set -x

cd example

cd android

# Run assembleDebug and capture logs
if ! ./gradlew assembleDebug --max-workers=1 > assembleDebug.log 2>&1; then
  echo "❌ Error: Failed to assemble debug build"
  cat assembleDebug.log
  exit 1
fi

echo "🟦 Assemble debug done!"

./gradlew assembleAndroidTest -DtestBuildType=debug

echo "🟦 Assemble android test done!"