#!/bin/bash
set -e

cd example

yarn e2e:build-android

yarn start > metro.log 2>&1 &
METRO_BUNDLER_PID=$!

adb wait-for-device

yarn e2e:run-android --headless
DETOX_EXIT_CODE=$?

kill $METRO_BUNDLER_PID || true
wait $METRO_BUNDLER_PID 2>/dev/null || true

exit $DETOX_EXIT_CODE