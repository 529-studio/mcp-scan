# Architecture

`mcp-scan` is a small, dependency-free Node.js CLI. The goal is a scanner that a developer can read in one sitting and trust.

---

## 1. Pipeline

### Static config scan

```text
argv
  │
  ▼
parseArgs ──▶ findConfig ──▶ JSON.parse ──▶ extractServers
                                                │
                                                ▼
                                         scanServer (rules)
                                                │
                                                ▼
                                         sort + count
                                                │
                          ┌─────────────────────┼─────────────────────┐
                          ▼                     ▼                     ▼
                        text                  json                  sarif
```

### Live scan

```text
--live / --stdio
  │
  ▼
connectStdio ──▶ initialize ──▶ tools/list ──▶ scanTools
                                                │
                                                ▼
                                         sort + output
```

### Dynamic scan

```text
--dynamic
  │
  ▼
createCanaryDir ──▶ createSandbox (docker/process)
  │
  ▼
connectStdio ──▶ initialize ──▶ tools/list
  │
  ▼
probeTools (read-only tools, canary inputs)
  │
  ▼
evaluateDynamic (DYN-001..DYN-005)
  │
  ▼
evidence bundle + output
```

---

## 2. Components

### `src/cli.js`

- Parses arguments (`--format`, `--fail-on`, `--quiet`).
- Resolves a file or a directory to an MCP config.
- Extracts `mcpServers` / `servers` / a single server object.
- Runs every rule for every server.
- Sorts findings by severity.
- Emits text, JSON, or SARIF.
- Returns exit code `0`, `1`, or `2`.

### `src/rules.js`

- Exports the rule list and `scanServer`.
- Each rule is a pure function: `check(server) -> finding | null`.
- Rules never perform network calls, execute code, or read files outside the config.
- Secret values are masked before they reach output.

### `src/protocol.js`

- Implements the MCP `initialize` handshake and `tools/list` pagination.
- Uses `src/targets/stdio.js` for transport.
- Caps pagination at 20 pages.

### `src/targets/stdio.js`

- Spawns a child process without a shell.
- Speaks newline-delimited JSON-RPC 2.0.
- Enforces a per-request timeout and kills the child on close.
- Captures stderr (truncated) for diagnostics.

### `src/tool-rules.js`

- Runs deterministic rules over `tools/list` entries.
- Checks descriptions, schemas, annotations, hidden content, and destructive primitives.
- Never executes a tool.

### `src/sandbox/`

- `runner.js` selects `docker`, `process`, or `none`.
- `docker.js` builds the isolation flags and runs the server inside the container.
- `process.js` runs the server locally for tests; it is not isolated.

### `src/dynamic/`

- `canary.js` creates disposable canary files and snapshots the directory.
- `probe.js` selects read-only tools, builds canary inputs, calls them, and diffs the canary directory.
- `rules.js` evaluates `DYN-001`..`DYN-005`.
- `evidence.js` writes a masked JSON bundle.

### `test/run.js`

- Runs the CLI against a bad fixture and a good fixture.
- Imports the protocol and tool-rule tests.
- Asserts finding count, exit codes, and SARIF shape.
- No test framework; `node:assert` only.

---

## 3. Config discovery

If the target is a directory, the CLI checks, in order:

```text
mcp.json
.mcp.json
mcp-config.json
claude_desktop_config.json
.cursor/mcp.json
.vscode/mcp.json
config/mcp.json
```

If the target is a file, it parses that file directly.

---

## 4. Finding shape

```json
{
  "id": "MCP-003",
  "title": "Secret-like environment variable is set inline",
  "severity": "high",
  "ref": "Secrets",
  "server": "filesystem",
  "evidence": "API_KEY=sk-l…cdef",
  "impact": "Secrets in config files are easy to leak...",
  "fix": "Load secrets from a secret manager..."
}
```

Every finding must be explainable without an LLM. If a rule cannot produce evidence, it should not ship.

---

## 5. Output contracts

- **Text:** human-readable, one block per finding.
- **JSON:** stable keys, `summary` counts by severity.
- **SARIF:** 2.1.0, `ruleId`, `level`, `message`, `locations`, `properties`.
- **Exit codes:** `0` clean or below threshold, `1` at/above `--fail-on`, `2` usage/config error.

---

## 6. Extension points

- Add a rule in `src/rules.js`.
- Add a fixture in `test/fixtures/`.
- Add a rule doc in `docs/rules.md`.
- Add a test assertion in `test/run.js`.

Live mode (M1) is implemented:

- `src/protocol.js` — `initialize`, `tools/list`, pagination.
- `src/targets/stdio.js` — stdio transport and process lifecycle.
- `src/tool-rules.js` — tool-level rules.
- `--live` and `--stdio` flags.
- HTTP transport is still pending.

Dynamic sandbox (M2) is implemented:

- `src/sandbox/` — Docker and process adapters.
- `src/dynamic/` — canaries, probes, rules, evidence.
- `--dynamic`, `--sandbox`, `--allow-tool`, `--max-tools`, `--allow-network`, `--evidence`.
- Egress detection is best-effort; the static `MCP-015` rule remains the primary signal.

---

## 7. Non-goals

- Full CNAPP.
- Pentest or exploit development.
- Runtime firewall (separate commercial layer).
- Storing customer configs in the OSS CLI.
- LLM-based detection in the critical path.

---

## 8. Security of the scanner

- No network calls in static mode.
- No execution of MCP servers in static mode.
- Dynamic mode is opt-in and runs the server in a sandbox.
- Docker is the default: no network, read-only root, dropped capabilities, non-root user.
- Secrets and canaries are masked in output.
- No telemetry.
- Hosted features are opt-in and separate.
