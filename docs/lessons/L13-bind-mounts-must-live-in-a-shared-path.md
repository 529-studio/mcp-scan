# L13: Bind Mounts Must Live in a Shared Path

## Context & Problem

The Docker smoke test started the sandbox and called the canary tool, but the tool returned `ENOENT: no such file or directory, open '/canary/host-file.txt'`. The mount was configured, the file existed on the host, and the container was running. The file was simply not visible inside the VM.

The canary directory was created with `os.tmpdir()`. On macOS that is `/var/folders/...`. Docker Desktop and colima share the user's home directory and some explicit paths, but not `/var/folders`.

## Root Cause

A bind mount is only as good as the runtime's shared path list. A path that exists on the host does not automatically exist in the VM.

## Solution

- Create canaries under the user's home directory: `~/.mcp-scan/canary-*`.
- Allow an override with `MCP_SCAN_CANARY_BASE`.
- Keep the directory mode at `0700` and the canary files at `0644`.
- Clean up the canary directory after the scan.
- Add a Docker smoke test that reads `/canary/host-file.txt` end-to-end.

## Verification

- `bash scripts/smoke-docker.sh` passes and reports `DYN-001`.
- The process adapter tests still pass.
- The canary directory is removed after the run.

## Rule References

- AGENTS.md Rule 4: secrets and configuration.
- AGENTS.md Rule 5: evidence before assertions.
