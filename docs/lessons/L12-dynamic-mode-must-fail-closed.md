# L12: Dynamic Mode Must Fail Closed

## Context & Problem

Dynamic mode runs an untrusted server. If the Docker sandbox cannot start, a convenience fallback to the local process would run the server on the host. That is the exact outcome the sandbox exists to prevent.

## Root Cause

The sandbox is treated as an implementation detail instead of a security boundary. A fallback that improves the demo can remove the only isolation layer.

## Solution

- If the requested sandbox cannot start, exit with code 2. Do not fall back.
- `--sandbox process` is explicit and prints a warning. It is for tests and trusted servers.
- `--allow-network` is refused with the process sandbox.
- Docker defaults: no network, read-only root, dropped capabilities, non-root user.
- The report states which sandbox was used.

## Verification

- The CLI uses the requested sandbox and reports it in the evidence bundle.
- A Docker failure is an error, not a silent process run.
- `--sandbox process` emits a warning.
- `--allow-network` with process exits 2.

## Rule References

- AGENTS.md Rule 2: sound solutions over shortcuts.
- AGENTS.md Rule 5: evidence before assertions.
