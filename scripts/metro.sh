#!/bin/bash

METRO_BUNDLER_PID=""

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

metro_stop() {
  [ -z "$METRO_BUNDLER_PID" ] && return 0
  kill "$METRO_BUNDLER_PID" 2>/dev/null || true
  wait "$METRO_BUNDLER_PID" 2>/dev/null || true
  METRO_BUNDLER_PID=""
}

metro_start() {
  local port="$1"
  local log="${2:-metro.log}"

  metro_reclaim_port "$port" || return 1

  yarn start --port "$port" > "$log" 2>&1 &
  METRO_BUNDLER_PID=$!
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
