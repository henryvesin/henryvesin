#!/usr/bin/env bash
# Minimal wrapper: pull main, hand one run off to Claude Code, print the result.
# No cron, no launchd — run this when you're at the desk. See README.md.
set -euo pipefail
cd "$(dirname "$0")"

RUN_TYPE_OVERRIDE="${1:-}"

git checkout main
git pull --ff-only origin main

if [ -n "$(git status --porcelain)" ]; then
  echo "Working tree is not clean. Commit or stash changes before running." >&2
  exit 1
fi

PROMPT="You are the Kaaostoimisto site agent. Read agent/AGENT.md and execute one run."
if [ -n "$RUN_TYPE_OVERRIDE" ]; then
  PROMPT="$PROMPT Optional run type override: $RUN_TYPE_OVERRIDE."
fi

claude -p "$PROMPT" --allowedTools "Edit,Write,Read,Glob,Grep,Bash"

echo
echo "Run finished. The PR URL should appear above (printed by 'gh pr create')."
echo "If you don't see it: gh pr list"
