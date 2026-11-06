# Handoff — Reviewer (M2)

**Status:** DONE (manual fallback; subagent quota blocked)

## Review Method

- Read the M2 plan, sandbox adapters, canary/probe/rules/evidence code, CLI wiring, tests, and docs.
- Ran the dynamic CLI against the fixture server.
- Checked isolation assumptions and evidence masking.

## Blocking Issues Found and Fixed

1. **Canary input was not masked in evidence.**
   - The base canary values were masked, but `MCP_SCAN_INPUT_<token>` leaked verbatim.
   - Fix: `maskCanary` also masks `canary.input`; `buildEvidence` masks nested input values.
2. **Evidence input was raw.**
   - Fix: `maskInput` at the evidence boundary.
3. **Docker mode cannot run host-local scripts or `npx` installs.**
   - Fix: documented the working-directory and packaged-image requirement; `--sandbox process` is the explicit fallback.
4. **Write tools are dangerous to probe by default.**
   - Fix: default selection requires `readOnlyHint: true`; `--allow-tool` is explicit.

## Non-Blocking Issues

- Docker smoke test passes locally via `make smoke-docker`; CI does not run Docker.
- Network egress detection is best-effort; `MCP-015` remains the static signal.
- Independent subagent review is pending because of the free model quota.

## Verdict

APPROVE locally. Re-run an independent review when quota is available.
