# Handoff — Auditor (M2)

**Status:** DONE (manual fallback; subagent quota blocked)

## Commands and Evidence

```text
$ make check
ok — 10 tool rules, clean fixture, bounded evidence
ok — protocol initialize, pagination, error, timeout
ok — dynamic canary, selection, Docker flags, DYN-001..005
ok — config, tool, protocol, dynamic, live CLI
docs-lint: OK
[OK] Public-safety guard passed.
```

```text
$ node src/cli.js --stdio node --arg "$PWD/test/fixtures/dynamic/server.js" \
    --dynamic --sandbox process --allow-tool write_outside \
    --max-tools 6 --timeout 300 --format json --fail-on none
DYN-001..DYN-005 present
```

```text
$ docker version
failed to connect to the docker API
```

## Pass/Fail

| Claim | Result |
|---|---|
| Canary files are created and hashed | PASS |
| Read-only tools are selected by default | PASS |
| Write tool requires `--allow-tool` | PASS |
| `DYN-001` host read | PASS |
| `DYN-002` write outside `out/` | PASS |
| `DYN-003` secret canary leak | PASS |
| `DYN-004` instruction-like output | PASS |
| `DYN-005` timeout | PASS |
| Evidence contains no raw canary token | PASS |
| Docker flags include `--network none`, `--read-only`, `--cap-drop ALL` | PASS (unit) |
| Docker smoke test | PENDING (daemon unavailable) |

## Integrity

- Tests call production code (`createSandbox`, `probeTools`, `evaluateDynamic`, CLI).
- No hardcoded results or facade implementations found.
- No secrets or internal hostnames in the tree.

## Residual Risk

- Docker adapter is unit-tested but not smoke-tested on a live daemon here.
- Dynamic mode is heuristic; canaries cover common host read/write paths, not every exfiltration channel.
- Independent subagent audit is pending due to quota.
