# Handoff — Implementer (M2)

**Status:** DONE

## Files

- `src/sandbox/runner.js` — `docker`, `process`, `none` selection.
- `src/sandbox/docker.js` — isolation flags and Docker adapter.
- `src/sandbox/process.js` — local adapter for tests.
- `src/dynamic/canary.js` — canary files, snapshots, diffs, masking.
- `src/dynamic/probe.js` — tool selection, input builder, tool calls.
- `src/dynamic/rules.js` — `DYN-001`..`DYN-005`.
- `src/dynamic/evidence.js` — masked JSON evidence bundle.
- `src/cli.js` — `--dynamic`, `--sandbox`, `--sandbox-image`, `--allow-network`, `--max-tools`, `--allow-tool`, `--evidence`.
- `test/fixtures/dynamic/server.js`, `test/dynamic.test.js`, expanded `test/run.js`.

## Verification

```text
$ node test/run.js
ok — 10 tool rules, clean fixture, bounded evidence
ok — protocol initialize, pagination, error, timeout
ok — dynamic canary, selection, Docker flags, DYN-001..005
ok — config, tool, protocol, dynamic, live CLI
```

## Notes

- Docker is the default sandbox; `process` is for tests and trusted servers.
- Docker requires the server command to exist inside the image; `npx` installs are blocked by `--network none`.
- Docker smoke test is pending because the local Docker daemon is unavailable.
