<!-- BEGIN:529studio-engineering-standards -->
# 529 Studio Engineering Standards & Agent Protocol

This repository is governed by the official **529 Studio Engineering Standards**.
Every developer and AI Coding Agent (Antigravity CLI, OpenCode, Claude Code, Cursor) MUST comply with the following mandatory rules.

## 1. Mandatory Pre-Flight Skill Review
Before planning (`/plan`) or implementing any task, feature, or bugfix, the agent MUST review the applicable Senior Skills from the 529 Studio Hub:
- `resilient-networking-and-waf`: For any HTTP client, WAF timeouts, or test mocks.
- `env-and-auth-ops-debugging`: For `.env` loading, CWD path safety, and fail-closed auth debugging.
- `module-boundary-and-concurrency`: For Go/backend module boundaries, `deps.go` interfaces, and `SELECT FOR UPDATE` locking.
- `frontend-4file-and-resilient-ui`: For Next.js/React APIs, 4-file pattern, 3 UI states (Skeleton/Error/Empty), and 48px touch targets.
- `docker-runtime-patching-and-secrets`: For Docker Compose, runtime asset patching, and zero-leak cryptographic secrets.
- `evidence-based-dod-and-llm-guardrails`: For Definition of Done verification, avoiding LLM outdated training hallucinations, and scope control.

## 2. Zero-Leak Security Policy
- NEVER hardcode or commit API keys, passwords, private keys, or tokens in git.
- All secrets MUST be loaded via `.env` (guarded by `.gitignore`).

## 3. Evidence Before Assertions (Hardened DoD)
- Passing unit tests alone is NEVER sufficient to close an issue or declare production readiness.
- You must produce empirical verification evidence (an actual cURL response, log trace, or UI screenshot from the running environment) before claiming completion.

## 4. Two-Way Knowledge Synchronization Hook (Mandatory AI Rule)
- When you fix a significant bug, solve an elusive operational failure, or make an architectural decision in this repository:
  1. Record the post-mortem in this repository's `lesson_learn.md` (or `docs/lesson_learn.md`).
  2. If the lesson has cross-repo organizational value, YOU MUST automatically sync it to the central hub by running:
     ```bash
     bash ~/repos/529-engineering-skills/scripts/harvest-lessons.sh
     ```
     or by directly updating the relevant skill in `~/repos/529-engineering-skills/skills/`.
<!-- END:529studio-engineering-standards -->

# mcp-scan Project Rules

## 1. Mission

`mcp-scan` is a security scanner for MCP servers and AI agents. It is an open-source, developer-first tool. Keep it narrow, deterministic, and honest about what it checks.

## 2. Language and style

- Code, comments, commit messages, docs, and tests are English.
- No emojis in code, logs, CLI output, or documentation.
- User-facing copy may be direct, but never hype. State what the tool does and what it does not do.
- The landing page is `site/index.html`. Keep it accurate: mark unbuilt features as waitlist or roadmap.

## 3. Git flow

- Direct pushes to `main` and `dev` are prohibited. Use `feat/*`, `fix/*`, `docs/*`, or `chore/*` branches.
- Open a PR against `dev`. AI agents must never auto-merge.
- PR descriptions start with `Close #<issue-number>` when the PR resolves an issue.
- Use the PR template in `.github/pull_request_template.md`.

## 4. Secrets and configuration

- Never commit real tokens, keys, customer data, or internal hostnames.
- `.mcp.json` is gitignored. Use `.mcp.example.jsonc` with placeholders only.
- Test fixtures use obviously fake values (`example-token-not-real`), never patterns that look like live credentials.
- `make public-safety` scans the tracked tree for credential material.

## 5. Evidence before assertions

- `node test/run.js` must pass.
- Run the CLI on a real config and include the output in the PR.
- Do not claim a rule works without a fixture that fails before and passes after.
- Do not claim “100% secure”. The scanner is a first pass, not a pentest.

## 6. Rule quality

Every rule must have:

- a stable ID (`MCP-0xx`);
- a narrow, deterministic trigger;
- evidence a human can verify;
- an actionable fix;
- a fixture in `test/fixtures/`;
- an entry in `docs/rules.md`;
- a test in `test/run.js` or a dedicated fixture.

If a rule is noisy, remove or narrow it. A small number of correct rules beats a long list of maybes.

## 7. Documentation and lessons

- Update `README.md` when behavior, commands, or outputs change.
- Record a new lesson as `docs/lessons/L<NN>-<slug>.md` plus one row in `docs/lessons/INDEX.md`.
- Never append to a single monolithic lesson file.
- Keep the always-loaded set (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `docs/ONBOARDING.md`, `docs/lessons/INDEX.md`) at or below 32 KB total, and each file at or below 16 KB (INDEX 18 KB).
- Keep on-demand docs at or below 25 KB. Read them in ranges, not wholesale.

## 8. Subagents and teamwork

- Teamwork state lives in `.agents/teamwork/<role>/`.
- Each subagent writes `DISPATCH.md`, `BRIEFING.md`, `progress.md`, and `handoff.md`.
- One writer per file set. Reviewer and auditor are read-only.
- The victory auditor signs off only with empirical evidence.

## 9. License and commercial boundary

- Core scanner and rules: Apache-2.0.
- Hosted dashboard, SSO, policy packs, runtime guard, and enterprise connectors: commercial.
- Do not move an existing open feature into the commercial layer.
- License changes require an ADR and human approval.

## 10. Scope control

- The wedge is MCP config and protocol security, not general AI security.
- Do not add a dashboard, billing, or SSO before three design partners.
- Do not add a rule without a real config or a reproducible fixture.
- YAGNI applies.
