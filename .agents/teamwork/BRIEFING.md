# BRIEFING — mcp-scan M1

## Mission

Ship a protocol-aware scanner: connect to an MCP server, read `tools/list`, and report tool-level risks with evidence.

## Team

| Role | Folder | Writes |
|---|---|---|
| Product Owner | `po_m1/` | Scope, issues, acceptance |
| Spec Miner | `spec_miner_m1/` | Rule specs, references |
| Worker CLI | `worker_cli_m1/` | `src/protocol.js`, `src/targets/` |
| Worker Rules | `worker_rules_m1/` | `src/rules.js`, fixtures, docs |
| Reviewer | `reviewer_m1/` | Review report only |
| Auditor | `auditor_m1/` | Audit report only |
| Challenger | `challenger_m1/` | Adversarial findings only |
| Victory Auditor | `victory_auditor_m1/` | Acceptance report only |

## Constraints

- English only, no emojis.
- No direct push to `main` or `dev`.
- No secrets in the tree.
- One writer per file set.
- Every rule needs a fixture, docs entry, and test.
- Reviewer, auditor, challenger, and victory auditor are read-only.
- Evidence before assertions.

## Definition of Done

1. `make check` passes.
2. Protocol handshake works against a local fixture server.
3. 10 new rules have fixtures and docs.
4. CLI output is verified on a real config and a fixture.
5. README and docs are updated.
6. A lesson is recorded if the work exposed a trap.
7. No unbuilt claims.

## Working Directory

Each role writes only inside its own `.agents/teamwork/<role>/` folder. Code changes go to the paths assigned in its `DISPATCH.md`.

## Integrity

Do not cheat. Do not hardcode test results, create facade implementations, or bypass the task. The auditor will independently verify.
