#!/bin/bash
set -x

cd example || exit

yarn start --port 8082 > metro.log 2>&1 &
METRO_BUNDLER_PID=$!

yarn e2e:run-android --headless
DETOX_EXIT_CODE=$?

kill $METRO_BUNDLER_PID || true
wait $METRO_BUNDLER_PID 2>/dev/null || true

exit $DETOX_EXIT_CODE
