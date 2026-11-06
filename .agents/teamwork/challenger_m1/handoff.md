# Handoff — Challenger

**Status:** DONE (manual fallback; subagent quota blocked)

## Adversarial Cases

| Case | Expected | Actual |
|---|---|---|
| Server hangs after initialize | Timeout, exit 2 | Timeout after 300ms, exit 2 |
| Child exits immediately | Clear error, exit 2 | `server exited before response`, exit 2 |
| `--live` server missing | Clear error, exit 2 | `live server not found`, exit 2 |
| `--live` on an HTTP URL | Clear error, exit 2 | `live HTTP scan is not implemented`, exit 2 |
| `--live` and `--stdio` together | Usage error, exit 2 | Mutual exclusion error, exit 2 |
| `--timeout 0` | Usage error, exit 2 | `--timeout must be a positive integer`, exit 2 |
| `--arg` with no value | Usage error, exit 2 | `--arg requires a value`, exit 2 |
| Clean `read_file` tool | 0 tool findings | 0 |
| Repeated cursor | Page cap or progress | Fixture cursor advances by offset |

## Findings

- No crash or hang found.
- The `--hang` fixture confirms the timeout path.
- The clean tool confirms the rules are not universal false positives.
- Evidence is capped and does not print credential assignments.

## Recommendation

Add a HTTP/SSE transport test in M2. For M1, the local stdio path is adequately challenged.
