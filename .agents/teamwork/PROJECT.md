# Project: mcp-scan M1 — Protocol-Aware Scanner

## Mission

Turn the config-only scanner into a protocol-aware scanner that can inspect a live MCP server's `initialize` response and `tools/list` output, then add ten rules that catch real tool-level risks.

## Current State

- v0.1.0: 10 config rules, text/JSON/SARIF, tests.
- No live connection, no tool-definition parsing, no sandbox.
- Landing page and README are alpha and honest about scope.

## Architecture

```text
src/cli.js        CLI, config discovery, output
src/rules.js      deterministic rules
src/protocol.js   (M1) MCP initialize + tools/list
src/targets/      (M1) stdio and HTTP transports
test/             fixtures + runner
docs/             plan, architecture, lessons, MCP setup
.agents/          skills + teamwork
```

## Feature Inventory

| # | Feature | Description | Milestone |
|---|---|---|---|
| 1 | Protocol handshake | `initialize`, `tools/list` over stdio | M1 |
| 2 | Tool manifest parser | Normalize tool name, description, input schema | M1 |
| 3 | Tool description rules | Instruction-like text, secret paths, schema mismatch | M1 |
| 4 | Tool schema rules | Shell, file write, network, broad object | M1 |
| 5 | CLI flags | `--stdio <command>`, `--url <endpoint>` | M1 |
| 6 | Evidence capture | Raw tool definition + normalized finding | M1 |
| 7 | Tests | Protocol fixtures, schema fixtures, regression | M1 |
| 8 | Docs | `docs/rules.md`, `docs/ARCHITECTURE.md`, README | M1 |

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| M0 | Agent ops bootstrap | AGENTS, skills, lessons, tools, subagents | none | DONE |
| M1 | Protocol-aware scanner | handshake, parser, 10 rules, tests | M0 | IMPLEMENTED (review pending) |
| M2 | Dynamic sandbox | isolated runner, canary prompts | M1 | PLANNED (docs/sprints/M2-DYNAMIC-SANDBOX.md) |
| M3 | Public report + badge | 20 configs, report, badge | M1 | PENDING |

## Interface Contracts

### Protocol target

```js
// src/targets/stdio.js
export async function connectStdio(command, args, env) -> {
  request(method, params) -> Promise<result>,
  close() -> Promise<void>
}
```

### Normalized tool

```js
{
  name: string,
  description: string,
  inputSchema: object,
  server: string
}
```

### Finding

```js
{
  id: "MCP-0xx",
  title: string,
  severity: "info"|"low"|"medium"|"high"|"critical",
  server: string,
  evidence: string,
  impact: string,
  fix: string
}
```

## Code Layout

- `src/protocol.js`: JSON-RPC framing, initialize, tools/list.
- `src/targets/stdio.js`: child process transport.
- `src/targets/http.js`: streamable HTTP transport (M1 stretch).
- `src/rules.js`: add `MCP-011`..`MCP-020`.
- `test/fixtures/protocol/`: recorded initialize/tools/list responses.
- `docs/rules.md`: rule entries.
- `docs/lessons/`: new lessons if a trap appears.
