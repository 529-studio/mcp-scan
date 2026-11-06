# M1 — Protocol-Aware Scanner

**Status:** IMPLEMENTED (manual review/audit; subagent quota blocked)
**Owner:** thdat-vu
**Date:** 2026-11-06
**Estimate:** 12–16 active hours (2 working days)

---

## 1. Goal

Move `mcp-scan` from a config-only scanner to a scanner that can connect to a local MCP server, read its `tools/list`, and report tool-level risks with evidence.

The config scanner stays unchanged. Live scanning is additive and opt-in.

---

## 2. Why now

The config rules catch transport, secrets, supply chain, and permission mistakes. They do not see the tool surface: tool descriptions, input schemas, annotations, and hidden instructions. That is where tool poisoning and over-permission live. M1 closes that gap without building a full sandbox (M2).

---

## 3. Scope

### In scope

- stdio transport with newline-delimited JSON-RPC 2.0.
- `initialize` + `notifications/initialized` + `tools/list` with pagination.
- `--live <server>`: connect to a server declared in the config.
- `--stdio <command>` + repeated `--arg <value>`: connect to an arbitrary local command.
- `--timeout <ms>`: handshake and per-request timeout.
- 10 tool-level rules (`MCP-011`..`MCP-020`).
- Tests with a fixture MCP server.
- Docs: README, ARCHITECTURE, rules, PLAN.

### Out of scope

- HTTP/SSE transport (M2).
- Sandboxed dynamic tests, canary prompts, exploit checks (M2).
- Runtime proxy.
- Dashboard.
- Any remote server without explicit permission.

---

## 4. Protocol design

MCP stdio uses newline-delimited JSON-RPC 2.0. One JSON object per line.

Client sequence:

```text
-> initialize { protocolVersion, capabilities: {}, clientInfo: { name, version } }
<- result { protocolVersion, capabilities, serverInfo }
-> notifications/initialized
-> tools/list { cursor? }
<- result { tools: [...], nextCursor? }
-> tools/list { cursor }
<- result { tools: [...] }
-> close (kill child)
```

Rules:

- Request IDs are monotonically increasing integers.
- A response must match the request ID.
- Notifications (no `id`) are ignored unless they are errors.
- Every request has a timeout; on timeout, reject and kill the child.
- stderr is captured (truncated) for diagnostics; it is never treated as protocol.
- A child exit before a response rejects all pending requests.
- `tools/list` is capped at 20 pages to prevent an infinite cursor.

---

## 5. CLI UX

### Live from config

```bash
mcp-scan . --live filesystem
mcp-scan . --live filesystem --format json
```

Reads the config, finds `mcpServers.filesystem`, connects over stdio, scans tools, and merges config findings for that server.

### Arbitrary command

```bash
mcp-scan --stdio node --arg test/fixtures/protocol/server.js
mcp-scan --stdio npx --arg -y --arg @scope/server@1.2.3 --timeout 15000
```

- `--stdio` takes one executable.
- `--arg` is repeatable.
- No shell interpolation; `spawn` with an argument array.

### Error handling

| Case | Exit | Message |
|---|---|---|
| Server not found in config | 2 | `live server not found: <name>` |
| Config server uses `url` | 2 | `live HTTP scan is not implemented; use the config scan` |
| Handshake timeout | 2 | `initialize timed out after <ms>ms` |
| Child exits | 2 | `server exited before response: <code>` |
| Invalid JSON line | 2 | `invalid JSON-RPC line from server` |

---

## 6. Rule specs (MCP-011..MCP-020)

| ID | Title | Severity | Trigger | Fix |
|---|---|---|---|---|
| MCP-011 | Tool description contains instruction-like content | High | `ignore previous`, `system prompt`, `do not tell`, `secretly`, `exfiltrate`, `send ... to` | Remove instructions from descriptions; treat them as data |
| MCP-012 | Tool references a secret path | High | `~/.ssh`, `id_rsa`, `.env`, `.aws/credentials`, `.npmrc`, `.netrc` | Remove the path; require a scoped secret reference |
| MCP-013 | Tool exposes a destructive verb | High | `delete`, `remove`, `drop`, `truncate`, `rm`, `unlink`, `wipe` | Rename/scope the tool; require explicit approval |
| MCP-014 | Tool exposes a shell/exec primitive | High | `shell`, `exec`, `spawn`, `bash`, `powershell`, `cmd` | Replace with a narrow typed tool |
| MCP-015 | Tool exposes a network/egress primitive | Medium | `http`, `fetch`, `curl`, `request`, `webhook`, `upload` | Add an allowlist and document the destination |
| MCP-016 | Tool exposes a file-write primitive | Medium | `write`, `save`, `create`, `append`, `move`, `rename`, `chmod` | Default to read-only; require approval |
| MCP-017 | Schema leaves command/path/url unconstrained | Medium | string field named `command`, `path`, `url`, `query`, `script`, `code` with no `enum`, `pattern`, or `format` | Add an enum, pattern, or allowlist |
| MCP-018 | Tool contains hidden or encoded content | High | base64-like block, zero-width characters, HTML comment | Remove it; decode and review before shipping |
| MCP-019 | `readOnlyHint: true` contradicts the tool | High | annotation says read-only, name/description is write/destructive | Fix the annotation or the tool |
| MCP-020 | Tool has no usable description | Low | missing or < 10 chars | Add a description that states what the tool does |

Evidence for every finding: tool name + a short excerpt (max 160 chars). Secrets are not printed.

---

## 7. File ownership

| Path | Owner | Notes |
|---|---|---|
| `src/protocol.js` | Worker A | JSON-RPC framing, initialize, tools/list |
| `src/targets/stdio.js` | Worker A | spawn, line reader, timeout, close |
| `test/fixtures/protocol/server.js` | Worker A | fixture MCP server |
| `test/protocol.test.js` | Worker A | handshake, pagination, timeout |
| `src/tool-rules.js` | Worker B | 10 tool rules + `scanTools` |
| `test/fixtures/tools/tools.js` | Worker B | good/bad tool fixtures |
| `test/tool-rules.test.js` | Worker B | rule assertions |
| `docs/rules.md` | Worker B | add MCP-011..020 |
| `src/cli.js` | Integrator | wire `--live`, `--stdio`, `--timeout` |
| `test/run.js` | Integrator | import the two test files |
| `README.md`, `docs/ARCHITECTURE.md`, `docs/PLAN.md` | Integrator | docs |

Rule: two writers, no shared files. The integrator owns the shared files.

---

## 8. Subagent decision

Use **four** subagents:

1. **Worker A** — protocol + stdio + fixture server + protocol tests.
2. **Worker B** — tool rules + fixtures + rule tests + rules docs.
3. **Reviewer** — read-only review of the integrated diff.
4. **Auditor** — independent verification: run tests, run live scan, check claims.

Why not more:

- `src/cli.js` and `test/run.js` are shared integration points; splitting them creates conflicts.
- The task is small enough that two writers cover the independent surfaces.
- Reviewer and auditor must be independent of the writers; that is the value.

Why not fewer:

- Protocol and rules are separable and can be built in parallel.
- A security tool needs an independent audit, not self-certification.

---

## 9. Test plan

### Protocol tests

- `initialize` returns a protocol version and server info.
- `tools/list` returns page 1 + `nextCursor`; page 2 returns the rest.
- Unknown method returns a JSON-RPC error.
- Timeout rejects and kills the child.
- Child exit rejects pending requests.

### Rule tests

- Every rule fires on at least one bad tool.
- Clean tools produce zero findings.
- Evidence is truncated and does not print secrets.
- `readOnlyHint` mismatch is caught.
- Hidden zero-width/base64 content is caught.

### CLI tests

- `--stdio node --arg test/fixtures/protocol/server.js --format json` returns findings.
- `--live fixture` with a fixture config returns findings.
- Config scan still returns 10 findings on the bad fixture.
- Good config still returns 0.

---

## 10. Definition of Done

1. `make check` passes.
2. Protocol tests pass with the fixture server.
3. Ten new rules have fixtures, docs entries, and tests.
4. `--stdio` and `--live` work end-to-end.
5. README, ARCHITECTURE, rules, and PLAN are updated.
6. A lesson is recorded if the work exposed a trap.
7. Reviewer and auditor sign off.
8. No secrets, no internal hostnames, no unbuilt claims.

---

## 11. Risks

| Risk | Mitigation |
|---|---|
| MCP protocol version drift | Send a known version; accept the server's response; document the version |
| Hung server | Per-request timeout + kill on close |
| Shell injection via `--stdio` | No shell; spawn with an argument array |
| Noisy rules | Narrow triggers, evidence, fixtures, false-positive review |
| False confidence | README says "protocol-aware first pass", not a pentest |
| Fixture server drift | The fixture is a real MCP server, tested end-to-end |

---

## 12. Timeline

| Phase | Hours | Output |
|---|---|---|
| Plan + fixtures | 2 | This document, fixture design |
| Worker A (protocol) | 4 | `src/protocol.js`, `src/targets/stdio.js`, tests |
| Worker B (rules) | 4 | `src/tool-rules.js`, fixtures, tests, docs |
| Integrate CLI + docs | 2 | `src/cli.js`, README, ARCHITECTURE, PLAN |
| Review + audit | 2 | Review and audit reports |
| Fixes | 1–2 | Green `make check` |

---

## 13. Implementation note

Implemented on 2026-11-06:

- `src/targets/stdio.js`, `src/protocol.js`, `src/tool-rules.js`, `src/cli.js`.
- `test/fixtures/protocol/server.js`, `test/fixtures/tools/tools.js`.
- `test/protocol.test.js`, `test/tool-rules.test.js`, `test/run.js`.
- Docs: `README.md`, `docs/rules.md`, `docs/ARCHITECTURE.md`, `docs/PLAN.md`, `docs/lessons/L09`, `docs/lessons/L10`.

Subagent quota:

- Worker A, Worker B, Reviewer, and Auditor were dispatched but the free model quota blocked them.
- The integrator implemented the two worker file sets serially and ran the reviewer/auditor checklist manually.
- Independent sign-off is still pending. Re-run the reviewer and auditor when quota is available.
