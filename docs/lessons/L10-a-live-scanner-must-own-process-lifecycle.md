# L10: A Live Scanner Must Own Process Lifecycle

## Context & Problem

A live scanner spawns a child process. If the server hangs after `initialize`, or exits without a response, a naive client waits forever and leaks the child. In CI this becomes a stuck job; on a laptop it becomes a zombie process.

## Root Cause

The client treats the child as a pure function. It does not model startup failure, per-request timeout, exit-before-response, or shutdown.

## Solution

- Spawn without a shell; use an argument array.
- Give every request a timeout.
- Reject all pending requests when the child exits.
- Capture stderr (truncated) for diagnostics only.
- On close, end stdin, send SIGTERM, then SIGKILL after a grace period.
- Make the timeout configurable with `--timeout`.
- Add a `--hang` fixture and a timeout test.

## Verification

- The fixture server responds to `initialize` and then hangs.
- `listTools()` rejects with `timed out after 300ms`.
- The client closes and the child exits.
- `--timeout` is validated as a positive integer.

## Rule References

- AGENTS.md Rule 5: evidence before assertions.
- AGENTS.md Rule 10: scope control.
