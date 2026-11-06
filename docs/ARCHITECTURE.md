# Architecture

`mcp-scan` is a small, dependency-free Node.js CLI. The goal is a scanner that a developer can read in one sitting and trust.

---

## 1. Pipeline

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

### `test/run.js`

- Runs the CLI against a bad fixture and a good fixture.
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

Protocol-aware scanning (M1) will add:

- `src/protocol.js` — `initialize`, `tools/list`, schema parsing.
- `src/targets/` — stdio and HTTP transports.
- `--stdio` and `--url` flags.

Dynamic sandbox (M2) will add:

- `src/sandbox/` — isolated runner.
- `--dynamic` opt-in flag.
- Canary prompts and egress checks.

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
- Secrets masked in output.
- No telemetry.
- Hosted features are opt-in and separate.
