#!/bin/bash

cd example || exit

if lsof -i :8081 >/dev/null; then
    echo "Metro bundler already running on port 8081"
    METRO_BUNDLER_PID=""
else
    yarn start &
    METRO_BUNDLER_PID=$!
fi

yarn e2e:run-ios

DETOX_EXIT_CODE=$?

if [ -n "$METRO_BUNDLER_PID" ]; then
    echo "Metro bundler was started by this script, killing it now..."
    kill $METRO_BUNDLER_PID
else
    echo "Metro bundler was not started by this script, not killing it."
fi

exit $DETOX_EXIT_CODE