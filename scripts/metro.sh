#!/bin/bash

METRO_BUNDLER_PID=""
METRO_PORT_IN_USE=""

metro_reclaim_port() {
  local port="$1"
  local pids
  pids=$(lsof -ti ":$port" 2>/dev/null || true)
  [ -z "$pids" ] && return 0

  echo "Port $port is held by PID(s) $pids — reclaiming (likely a Metro leaked by a cancelled run)"
  # shellcheck disable=SC2086
  kill $pids 2>/dev/null || true

  local deadline=$((SECONDS + 20))
  while [ -n "$(lsof -ti ":$port" 2>/dev/null || true)" ]; do
    if [ "$SECONDS" -ge "$deadline" ]; then
      # shellcheck disable=SC2086
      kill -9 $pids 2>/dev/null || true
      sleep 2
      break
    fi
    sleep 1
  done

  if [ -n "$(lsof -ti ":$port" 2>/dev/null || true)" ]; then
    echo "::error::Could not free port $port"
    lsof -i ":$port"
    return 1
  fi
}

metro_signal_tree() {
  local sig="$1" pid="$2"
  kill "-$sig" "-$pid" 2>/dev/null || kill "-$sig" "$pid" 2>/dev/null || true
}

metro_stop() {
  local pid="${METRO_BUNDLER_PID:-}"
  local port="${METRO_PORT_IN_USE:-}"
  METRO_BUNDLER_PID=""

  if [ -n "$pid" ]; then
    metro_signal_tree TERM "$pid"

    local deadline=$((SECONDS + 15))
    while kill -0 "$pid" 2>/dev/null; do
      if [ "$SECONDS" -ge "$deadline" ]; then
        echo "Metro (pid $pid) ignored SIGTERM after 15s — sending SIGKILL"
        metro_signal_tree KILL "$pid"
        sleep 1
        break
      fi
      sleep 1
    done

    wait "$pid" 2>/dev/null || true
  fi

  if [ -n "$port" ]; then
    local stragglers
    stragglers=$(lsof -ti ":$port" 2>/dev/null || true)
    if [ -n "$stragglers" ]; then
      echo "Reaping Metro stragglers still bound to port $port: $stragglers"
      # shellcheck disable=SC2086
      kill -9 $stragglers 2>/dev/null || true
    fi
  fi
}

metro_start() {
  local port="$1"
  local log="${2:-metro.log}"

  metro_reclaim_port "$port" || return 1

  local job_control_was_off=""
  case "$-" in *m*) ;; *) job_control_was_off=1; set -m ;; esac
  yarn start --port "$port" > "$log" 2>&1 &
  METRO_BUNDLER_PID=$!
  [ -n "$job_control_was_off" ] && set +m

  METRO_PORT_IN_USE="$port"
  trap metro_stop EXIT

  local deadline=$((SECONDS + 180))
  until curl -fsS "http://localhost:$port/status" 2>/dev/null | grep -q 'packager-status:running'; do
    if ! kill -0 "$METRO_BUNDLER_PID" 2>/dev/null; then
      echo "::error::Metro exited before becoming ready on port $port"
      cat "$log"
      return 1
    fi
    if [ "$SECONDS" -ge "$deadline" ]; then
      echo "::error::Metro did not become ready on port $port within 3 minutes"
      cat "$log"
      return 1
    fi
    sleep 2
  done

  echo "Metro is ready on port $port"
}
