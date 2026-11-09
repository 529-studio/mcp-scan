# mcp-scan — Plan

**Status:** v0.1.0 shipped (10 config rules). This plan covers the agent-ops bootstrap and the next two milestones.

**Goal:** make `mcp-scan` the default 5-minute security check for MCP servers, then turn the public report and vendor badge into a repeatable distribution engine.

---

## 1. Current state

- CLI: `node src/cli.js <path>` with text, JSON, and SARIF output.
- 20 deterministic rules: 10 config (`MCP-001`..`MCP-010`) and 10 tool (`MCP-011`..`MCP-020`).
- Live mode: `--live <server>` and `--stdio <command>` with `initialize` + `tools/list`.
- Tests: fixtures, protocol server, tool rules, and CLI live tests.
- CI: `test`, `self-scan`, `docs-lint`, `secret-scan`, and `public-safety` pass.
- Landing page: `site/index.html`.
- License: Apache-2.0 core; commercial enterprise layer.
- No sandbox or dynamic prompt-injection tests yet.

---

## 2. Strategy

Three engines, in order:

1. **Open source** — CLI, rules, GitHub Action. Distribution: GitHub, Hacker News, MCP Discord.
2. **Public report** — “State of MCP Security 2026”. Distribution: report, Reddit, LinkedIn.
3. **Vendor badge** — “MCP Security Verified”. Distribution: vendor READMEs.

The paid layer is the hosted dashboard, evidence retention, SSO, policy packs, and runtime guard. The scanner stays open.

---

## 3. Who pays

| Segment | Economic buyer | Budget | Price |
|---|---|---|---|
| AI-native startup | CTO/Founder | AI platform, security | $99–$999/mo |
| Mid-market SaaS | CISO/VP Engineering | AppSec, compliance | $2k–$10k/mo |
| Enterprise AI platform | CISO/CTO | Security, AI platform | $50k–$200k/yr |
| MSSP/consultancy | Partner | Delivery tooling | $1k–$5k/mo/client |

See `docs/gtm-plan.md` for the full buyer map, scripts, and 90-day calendar.

---

## 4. Workstreams and subagents

| Role | Folder | Owns | Output |
|---|---|---|---|
| Product Owner | `.agents/teamwork/po_m1/` | Scope, acceptance criteria, issue list | `handoff.md` with M1 scope |
| Spec Miner | `.agents/teamwork/spec_miner_m1/` | MCP threat model, rule specs, references | Rule spec for `MCP-011`..`MCP-020` |
| Worker — CLI | `.agents/teamwork/worker_cli_m1/` | MCP handshake, parser, output | Code + tests + handoff |
| Worker — Rules | `.agents/teamwork/worker_rules_m1/` | New rules, fixtures, docs | Code + fixtures + handoff |
| Reviewer | `.agents/teamwork/reviewer_m1/` | Code and docs review | Review report |
| Auditor | `.agents/teamwork/auditor_m1/` | Independent verification | Audit report |
| Challenger | `.agents/teamwork/challenger_m1/` | Adversarial configs, false positives | Findings + fixtures |
| Victory Auditor | `.agents/teamwork/victory_auditor_m1/` | Final acceptance against DoD | Pass/fail + evidence |

Rules of engagement:

- One writer per file set. CLI worker owns `src/cli.js`; rules worker owns `src/rules.js` and `docs/rules.md`.
- Reviewer and auditor are read-only. They may run commands, not edit.
- The victory auditor signs off only with empirical evidence.

---

## 5. Milestones

### M0 — Agent ops bootstrap (this PR)

- [x] `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`
- [x] `docs/ONBOARDING.md`, `docs/PLAN.md`, `docs/ARCHITECTURE.md`, `docs/MCP_SETUP.md`
- [x] `docs/lessons/INDEX.md` + L01–L08
- [x] `.agents/skills/` with three project skills
- [x] `.agents/teamwork/` with eight roles
- [x] `.mcp.example.jsonc` + MCP setup guide
- [x] `Makefile`, `tools/docs/docs_lint.py`, `scripts/check-public-safe.sh`
- [x] PR template, CODEOWNERS, branch guard, docs lint, secret scan, public-safety
- [ ] PR opened against `dev`; `@giangdq202` tagged by the human owner after review

### M1 — Protocol-aware scanner (implementation complete)

- [x] Parse a live MCP server: `initialize`, `tools/list`.
- [x] Detect tool descriptions with instruction-like content.
- [x] Parse tool schemas for dangerous primitives (shell, file write, network).
- [x] Add 10 rules (`MCP-011`..`MCP-020`).
- [x] Add `--live` and `--stdio` targets.
- [x] Tests for protocol parsing, pagination, timeouts, and tool rules.
- [ ] HTTP/SSE transport (moved to M2).
- [ ] Independent subagent sign-off (pending quota; manual review/audit done).

### M2 — Dynamic sandbox (implementation complete)

Plan: [docs/sprints/M2-DYNAMIC-SANDBOX.md](sprints/M2-DYNAMIC-SANDBOX.md)

- [x] Sandbox runner with `docker` and `process` adapters.
- [x] Canary files and canary inputs.
- [x] `DYN-001`..`DYN-005`.
- [x] Evidence bundle.
- [x] `--dynamic`, `--sandbox`, `--allow-tool`, `--max-tools`, `--evidence`.
- [x] Docker adapter flags and process adapter tests.
- [x] Docker smoke test on a real image (`make smoke-docker`).
- [ ] Independent reviewer/auditor sign-off (pending quota).

### M3 — Public report + vendor badge (execution)

Plan: [docs/sprints/M3-PUBLIC-REPORT-BADGE.md](sprints/M3-PUBLIC-REPORT-BADGE.md)
Execution: [docs/sprints/M3-EXECUTION-PLAN.md](sprints/M3-EXECUTION-PLAN.md)

- [x] Report aggregate/render scripts.
- [x] Draft report and report page.
- [x] Badge program rules, badge page, and application template.
- [ ] T2 (#9): 20 permitted MCP configs and a public manifest.
- [ ] T3 (#10): scans, aggregate, triage, and responsible disclosure.
- [ ] T4 (#11): publish the report and open badge applications.
- [ ] 3 badge applicants approved.
- [ ] 3 design partners, 3 paid accounts.

### M4 — Hosted evidence layer

- Dashboard, scan history, Slack/Jira, SSO.
- Policy-as-code.
- Pro/Team plans.
- SOC2 readiness.

---

## 6. Definition of Done

A task is done only when:

1. `node test/run.js` passes.
2. `make docs-lint` and `make public-safety` pass.
3. New rules have a fixture, a docs entry, and a test.
4. The CLI output is verified on a real config.
5. `README.md` and affected docs are updated.
6. A lesson is recorded in `docs/lessons/` if the work revealed a trap.
7. No secrets, no internal hostnames, no unbuilt claims.

---

## 7. Risks

| Risk | Mitigation |
|---|---|
| False positives | Narrow rules, evidence, suppression, fixtures |
| MCP spec changes | Versioned parser, CI fixtures |
| Incumbents add MCP scanning | Speed, OSS distribution, badge network |
| Liability | No exploitation, disclaimers, responsible disclosure |
| “AI security” hype | Stay narrow: config + protocol + evidence |
| Enterprise sales cycle | Self-serve + design partners + MSSP |

---

## 8. Metrics

- GitHub stars: 500 in 90 days.
- Weekly installs: 100.
- Report downloads: 1,000.
- Design partners: 3.
- Paid accounts: 3.
- False positive rate: <10%.
- Time to first finding: <5 minutes.

---

## 9. What not to do

- Do not add 100 rules before 10 are correct.
- Do not build a dashboard before 3 design partners.
- Do not publish exploitable findings.
- Do not claim “100% secure”.
- Do not run paid ads before the report has traction.
- Do not put real secrets in fixtures or docs.
