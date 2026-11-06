# Handoff — Auditor

**Status:** DONE (manual fallback; subagent quota blocked)

## Commands and Evidence

```text
$ make check
ok — 10 tool rules, clean fixture, bounded evidence
ok — protocol initialize, pagination, error, timeout
ok — 10 config rules, 10 tool rules, protocol, live CLI
docs-lint: OK
[OK] Public-safety guard passed.
```

```text
$ node src/cli.js --stdio node --arg test/fixtures/protocol/server.js --format json --fail-on none
16 findings (1 low, 8 medium, 7 high) in 1 server.
rules: MCP-011..MCP-020
```

```text
$ node src/cli.js test/fixtures/bad.mcp.json --format json --fail-on none
10 findings (4 high, 6 medium)
```

```text
$ node src/cli.js test/fixtures/good.mcp.json --format json
0 findings
```

```text
$ node src/cli.js --stdio node --arg test/fixtures/protocol/server.js --arg --hang --timeout 300
mcp-scan: tools/list timed out after 300ms
exit 2; no child process left
```

## Pass/Fail

| Claim | Result |
|---|---|
| Protocol handshake works | PASS |
| Pagination returns all 7 tools | PASS |
| JSON-RPC error is surfaced | PASS |
| Timeout rejects and kills child | PASS |
| 10 tool rules fire | PASS |
| Clean tool returns 0 | PASS |
| Config regression is clean | PASS |
| Evidence is bounded | PASS |
| Docs match code | PASS |

## Integrity

- Tests call production code (`connectStdio`, `scanTools`, the CLI).
- No hardcoded test results or facade implementations found.
- No secrets or internal hostnames in the tree.

## Verdict

PASS locally. Independent audit is pending because the subagent quota is blocked.
