#!/bin/bash
set -x

cd example

cd android

# Run assembleDebug and capture logs
if ! ./gradlew assembleDebug --stacktrace --info > assembleDebug.log 2>&1; then
  echo "❌ Error: Failed to assemble debug build"
  cat assembleDebug.log
  exit 1
fi


echo "🟦 Assemble debug done!"

./gradlew assembleAndroidTest -DtestBuildType=debug

echo "🟦 Assemble android test done!"

yarn start > metro.log 2>&1 &
METRO_BUNDLER_PID=$!

adb wait-for-device

yarn e2e:run-android --headless
DETOX_EXIT_CODE=$?

kill $METRO_BUNDLER_PID || true
wait $METRO_BUNDLER_PID 2>/dev/null || true

exit $DETOX_EXIT_CODE