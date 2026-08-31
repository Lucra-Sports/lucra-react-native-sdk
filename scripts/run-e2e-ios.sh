#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=scripts/metro.sh
source "$SCRIPT_DIR/metro.sh"

cd "$SCRIPT_DIR/../example" || exit 1

metro_start "${RCT_METRO_PORT:-8082}" || exit 1

# Detox can wedge after the tests finish: it logs "Detox server close callback
# was not invoked within the 10000 ms timeout" and never exits, hanging the CI
# step until the workflow timeout. Run it under a watchdog: propagate the real
# exit code on a normal exit; on a wedge, kill the process tree and fall back
# to the jest summary captured in the log to decide the outcome.
DETOX_LOG="detox-run.log"
DETOX_TIMEOUT="${DETOX_TIMEOUT_SECONDS:-900}"
DETOX_EXIT_GRACE="${DETOX_EXIT_GRACE_SECONDS:-60}"

: > "$DETOX_LOG"

job_control_was_off=""
case "$-" in *m*) ;; *) job_control_was_off=1; set -m ;; esac
yarn e2e:run-ios > "$DETOX_LOG" 2>&1 &
detox_pid=$!
[ -n "$job_control_was_off" ] && set +m

tail -n +1 -f "$DETOX_LOG" &
tail_pid=$!

set +e
wedged=""
finished_at=""
deadline=$((SECONDS + DETOX_TIMEOUT))
while kill -0 "$detox_pid" 2>/dev/null; do
  if [ -z "$finished_at" ] && grep -q "Ran all test suites." "$DETOX_LOG" 2>/dev/null; then
    finished_at=$SECONDS
  fi
  if [ -n "$finished_at" ] && [ $((SECONDS - finished_at)) -ge "$DETOX_EXIT_GRACE" ]; then
    wedged=1
    break
  fi
  if [ "$SECONDS" -ge "$deadline" ]; then
    wedged=1
    break
  fi
  sleep 5
done

if [ -n "$wedged" ]; then
  echo "Detox did not exit on its own — killing its process tree (pid $detox_pid)"
  kill -TERM -- "-$detox_pid" 2>/dev/null || kill -TERM "$detox_pid" 2>/dev/null
  sleep 5
  kill -KILL -- "-$detox_pid" 2>/dev/null || kill -KILL "$detox_pid" 2>/dev/null
  wait "$detox_pid" 2>/dev/null
  if grep -q "Ran all test suites." "$DETOX_LOG" &&
    ! grep -qE "FAIL |Tests:.*[0-9]+ failed" "$DETOX_LOG"; then
    echo "::warning::Detox wedged during teardown after all tests passed (known 'server close callback' hang) — treating the run as successful"
    detox_status=0
  else
    echo "::error::Detox wedged and the log does not show a fully passing run"
    detox_status=1
  fi
else
  wait "$detox_pid"
  detox_status=$?
fi

kill "$tail_pid" 2>/dev/null
set -e

echo "detox exited rc=$detox_status — tearing down Metro"
exit "$detox_status"
