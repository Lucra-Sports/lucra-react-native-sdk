#!/bin/bash

cd example

yarn start &

METRO_BUNDLER_PID=$!

yarn e2e:build-android

yarn e2e:run-android --headless

DETOX_EXIT_CODE=$?

kill $METRO_BUNDLER_PID

exit $DETOX_EXIT_CODE