# Contributor Onboarding

**Project:** mcp-scan — security scanner for MCP servers and AI agents.

---

## 1. What this is

`mcp-scan` reads an MCP configuration (for example `mcp.json`, `claude_desktop_config.json`, `.cursor/mcp.json`) and reports deterministic security findings. It does not connect to a live server yet, does not exploit, and does not upload code.

---

## 2. Quick start

```bash
git clone https://github.com/529-studio/mcp-scan.git
cd mcp-scan
node test/run.js
node src/cli.js test/fixtures/bad.mcp.json --fail-on none
node src/cli.js test/fixtures/good.mcp.json
```

Useful commands:

| Command | Purpose |
|---|---|
| `make test` | Run the test suite |
| `make scan` | Scan the repo’s own config |
| `make docs-lint` | Check docs budgets, links, lessons index |
| `make public-safety` | Check for secrets and internal hostnames |
| `make check` | All of the above |

---

## 3. Repository layout

```text
src/cli.js              CLI: args, config discovery, output
src/rules.js            Rules and scan engine
test/run.js             Test runner
test/fixtures/          Good and bad MCP configs
docs/PLAN.md            Product and GTM plan
docs/ARCHITECTURE.md    Scanner architecture
docs/MCP_SETUP.md       MCP servers and placeholders
docs/lessons/           One file per lesson + INDEX
.agents/skills/         Project skills
.agents/teamwork/       Subagent briefs and handoffs
site/index.html         Landing page
tools/docs/docs_lint.py Docs gate
scripts/check-public-safe.sh
```

---

## 4. The rules that matter

Read `AGENTS.md`. The short version:

- English-only code and docs, no emojis.
- No direct push to `main` or `dev`; PR only.
- No secrets in the tree; use `.mcp.example.jsonc` placeholders.
- Every rule needs a fixture, a docs entry, and a test.
- Evidence before assertions; tests alone are not enough.
- Keep the always-loaded docs under the context budget.

---

## 5. How to add a rule

1. Add a `check(server)` function in `src/rules.js`.
2. Add a fixture in `test/fixtures/`.
3. Add the rule to `docs/rules.md`.
4. Add or update a test in `test/run.js`.
5. Run `make check`.
6. Record a lesson if the rule exposed a trap.

See `.agents/skills/rule-authoring/SKILL.md` for the checklist.

---

## 6. Agent teamwork

Work is split into roles under `.agents/teamwork/`:

- `po_m1` — scope and acceptance.
- `spec_miner_m1` — threat model and rule specs.
- `worker_cli_m1` — protocol parsing and CLI.
- `worker_rules_m1` — rules and fixtures.
- `reviewer_m1` — code and docs review.
- `auditor_m1` — independent verification.
- `challenger_m1` — adversarial configs and false positives.
- `victory_auditor_m1` — final acceptance.

Each role has `DISPATCH.md`, `BRIEFING.md`, `progress.md`, and `handoff.md`.

---

## 7. MCP setup

See `docs/MCP_SETUP.md`. Do not commit `.mcp.json`; use `.mcp.example.jsonc` and a secret manager.

---

## 8. Lessons and docs

- Lessons index: `docs/lessons/INDEX.md`.
- Context budget: always-loaded set <= 32 KB, each file <= 16 KB (INDEX 18 KB), on-demand <= 25 KB.
- `make docs-lint` enforces the budget, link resolution, lessons index, and old email aliases.
