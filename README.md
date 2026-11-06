# mcp-scan

**Security scanner for MCP servers and AI agents.**

[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![Status: alpha](https://img.shields.io/badge/status-alpha-orange.svg)](#status)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-339933.svg)](https://nodejs.org)

`mcp-scan` finds the security mistakes that show up in real MCP deployments: unpinned packages, secrets in config files, shell wrappers, broad filesystem roots, wildcard network binds, unauthenticated remote endpoints, debug flags, and write access granted by default.

It is deterministic, CI-friendly, and designed to produce **evidence** — not just a score.

```bash
npx github:529-studio/mcp-scan .
```

> Alpha: the first release covers config-level checks. Dynamic sandbox testing and runtime policy enforcement are on the roadmap.

---

## Why

MCP gives an agent real permissions: read files, query databases, call APIs, run code. That means every MCP server is a new attack surface:

- **Tool poisoning** — a tool description contains hidden instructions.
- **Prompt injection via resources** — a document or email tells the agent to do something else.
- **Over-permission** — a server can read or write more than the task needs.
- **Secret leakage** — API keys live in `mcp.json`, dotfiles, or logs.
- **Supply chain** — `npx` or `docker run` pulls a floating package.
- **No audit trail** — nobody can reconstruct what the agent did.

Most AppSec tools do not understand MCP. `mcp-scan` starts with the highest-signal, deterministic checks, then adds sandboxed dynamic tests.

---

## Quick start

### Run from GitHub (no install)

```bash
npx github:529-studio/mcp-scan .
```

### Run from source

```bash
git clone https://github.com/529-studio/mcp-scan.git
cd mcp-scan
node src/cli.js .
```

### Point at a specific config

```bash
node src/cli.js ./mcp.json
node src/cli.js ~/.config/Claude/claude_desktop_config.json
node src/cli.js .cursor/mcp.json
```

If you pass a directory, `mcp-scan` looks for:

```text
mcp.json
.mcp.json
mcp-config.json
claude_desktop_config.json
.cursor/mcp.json
.vscode/mcp.json
config/mcp.json
```

---

## What it checks

| ID | Check | Severity |
|---|---|---|
| `MCP-001` | Remote endpoint uses plain HTTP | High |
| `MCP-002` | `npx`/`bunx` package is not pinned | Medium |
| `MCP-003` | Secret-like env var is set inline | High |
| `MCP-004` | Debug/inspector flag is enabled | Medium |
| `MCP-005` | Server is launched through a shell (`sh -c`) | High |
| `MCP-006` | Server is granted a broad filesystem root | Medium |
| `MCP-007` | Server binds to a wildcard host/origin | Medium |
| `MCP-008` | Docker image is unpinned or uses `:latest` | Medium |
| `MCP-009` | Remote endpoint has no visible auth | Medium |
| `MCP-010` | Server is explicitly granted write access | High |

See [docs/rules.md](docs/rules.md) for the full rule reference.

---

## Output

### Text

```text
mcp-scan 0.1.0
Target: /Users/me/project/mcp.json
Servers: 4

[HIGH    ] MCP-001  Remote MCP endpoint uses plain HTTP
  server:   filesystem
  evidence: http://0.0.0.0:8080
  impact:   Tokens, tool calls, and tool outputs can be intercepted or modified in transit.
  fix:      Use HTTPS for remote MCP servers, or use a local stdio transport.

[MEDIUM  ] MCP-002  npx/bunx package is not pinned to a version
  server:   filesystem
  evidence: npx -y @modelcontextprotocol/server-filesystem /
  impact:   A floating package can change after review (rug pull) or resolve to a compromised release.
  fix:      Pin an exact version (for example @scope/server@1.2.3) and review updates deliberately.

10 findings (4 high, 6 medium) in 4 servers.
```

### JSON

```bash
mcp-scan . --format json
```

```json
{
  "tool": "mcp-scan",
  "version": "0.1.0",
  "target": "/path/to/mcp.json",
  "servers": 4,
  "findings": [
    {
      "id": "MCP-003",
      "title": "Secret-like environment variable is set inline",
      "severity": "high",
      "server": "filesystem",
      "evidence": "API_KEY=sk-l…cdef",
      "impact": "Secrets in config files are easy to leak through git, backups, logs, screenshots, or shared dotfiles.",
      "fix": "Load secrets from a secret manager or environment at runtime; keep only a reference in the config."
    }
  ],
  "summary": { "info": 0, "low": 0, "medium": 6, "high": 4, "critical": 0 }
}
```

### SARIF (GitHub code scanning)

```bash
mcp-scan . --format sarif > mcp-scan.sarif
```

---

## CI usage

```yaml
name: mcp-scan

on:
  pull_request:
  push:
    branches: [main]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Scan MCP config
        run: npx github:529-studio/mcp-scan . --fail-on high
```

Exit codes:

| Code | Meaning |
|---|---|
| `0` | No findings at or above `--fail-on` |
| `1` | Findings at or above `--fail-on` |
| `2` | Usage or config error |

Use `--fail-on none` for a report-only run.

---

## Design principles

1. **Deterministic first.** Every finding must be explainable without an LLM.
2. **Evidence, not vibes.** Each finding includes the target, the evidence, the impact, and a fix.
3. **Small rules, versioned.** A rule is a function with an ID and a test fixture.
4. **Safe by default.** `mcp-scan` never exploits, never exfiltrates, and masks secrets.
5. **CI-native.** Text for humans, JSON/SARIF for machines.
6. **Open core.** The scanner and rules are Apache-2.0. Hosted/enterprise features are separate.

---

## Roadmap

- [x] Config-level scanner (10 rules)
- [x] JSON + SARIF output
- [x] GitHub Action workflow
- [ ] MCP protocol handshake and tool-definition parsing
- [ ] Sandboxed dynamic tests (prompt injection, tool abuse)
- [ ] Rule packs (auth, data flow, supply chain)
- [ ] Hosted dashboard + evidence retention
- [ ] Policy-as-code (OPA/Rego)
- [ ] Runtime guard (proxy)

---

## Status

Alpha. The current release is a **config-level** scanner. It is useful today, but it is not a complete MCP security assessment.

- It does not connect to a live MCP server yet.
- It does not test prompt injection or tool abuse yet.
- It does not replace a pentest.

Use it as a fast first pass in CI, then add dynamic testing and human review.

---

## License

The core scanner and rules are licensed under the **Apache License 2.0**. See [LICENSE](LICENSE) and [NOTICE](NOTICE). The rationale and the open-core boundary are documented in [docs/license-decision.md](docs/license-decision.md).

Apache-2.0 was chosen because it is:

- OSI-approved and enterprise-friendly;
- permissive enough for CI/CD and vendor integration;
- includes an express patent grant;
- compatible with an open-core model.

The hosted dashboard, SSO, policy packs, runtime guard, and enterprise connectors are planned as separate commercial offerings. They are not part of this repository.

If you need a different license for a commercial embedding, open an issue or contact the maintainers.

---

## Repository operations

- `make check` — tests, docs gate, and public-safety scan.
- `AGENTS.md` — project rules and the 529 Studio standards.
- `docs/ONBOARDING.md` — how the repo is organized.
- `.agents/skills/` — MCP security review, rule authoring, OSS GTM.
- `.agents/teamwork/` — subagent briefs and handoffs.
- `docs/lessons/INDEX.md` — one row per engineering lesson.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). New rules are welcome, especially ones backed by a real MCP server and a reproducible fixture.

## Security

Please do not open a public issue for a vulnerability in `mcp-scan` itself. See [SECURITY.md](SECURITY.md).

## Links

- GitHub: <https://github.com/529-studio/mcp-scan>
- 529 Studio: <https://529studio.site>
- MCP specification: <https://modelcontextprotocol.io>

---

Built by [529 Studio](https://529studio.site). Not affiliated with Anthropic, NVIDIA, or the MCP maintainers.
