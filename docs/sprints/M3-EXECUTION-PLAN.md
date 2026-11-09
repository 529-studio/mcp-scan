# M3 Execution Plan — Report and Badge

**Status:** READY
**Owner:** thdat-vu
**Date:** 2026-11-07
**Parent plan:** [M3-PUBLIC-REPORT-BADGE.md](M3-PUBLIC-REPORT-BADGE.md)

This plan splits the post-#8 work into three executable tasks:

| Task | Issue | Depends on | Estimate | Output |
|---|---|---|---|---|
| T2 — Sample and permission | [#9](https://github.com/529-studio/mcp-scan/issues/9) | none | 3–4 days | 20 permitted configs |
| T3 — Scan, aggregate, disclose | [#10](https://github.com/529-studio/mcp-scan/issues/10) | #9 | 3–5 days | Real aggregate + disclosure log |
| T4 — Publish and badge | [#11](https://github.com/529-studio/mcp-scan/issues/11) | #10 | 2–3 days | Published report + applications |

No task starts before its dependency is done. No live or dynamic scan runs without permission.

---

## 1. Task T2 — Sample and permission

### Goal

Select 20 MCP configurations or servers and record what each vendor permits: config scan, live `tools/list`, dynamic sandbox.

### Inclusion criteria

- A public config, public repository, or shareable artifact.
- A real server, not a toy demo.
- Active in 2025–2026.
- Variety across transport (stdio/HTTP), vendor, tool count, and category.
- At least 10 candidates that permit live scanning.
- At least 5 candidates that permit dynamic scanning.

### Process

1. Build a candidate list of 30.
2. Record the public source URL and category.
3. Ask for permission asynchronously: email or GitHub issue, no calls.
4. Record per-layer status: `granted`, `pending`, `denied`.
5. Select 20 with enough live/dynamic coverage.
6. Keep a bench of 10 alternates.

### Data handling

- Public manifest: anonymized IDs (`S01`..`S20`) and public source URLs only.
- Private register: contact, permission message, date, and notes, stored outside the repository.
- Never commit names, emails, hostnames, tokens, or customer data.

### Deliverables

- `docs/reports/sample-2026/MANIFEST.md` with 20 anonymized entries.
- A private permission register outside the repo.
- A short selection rationale and exclusion list.

### Gate

- 20 entries with a permission status.
- No PII in the public manifest.
- Reviewer checks the manifest and the selection rationale.

---

## 2. Task T3 — Scan, aggregate, disclose

### Goal

Turn the permitted sample into evidence: run the permitted layers, aggregate counts, triage false positives, and disclose high/critical findings privately.

### Scan matrix

| Layer | Command | Permission |
|---|---|---|
| Config | `mcp-scan --format json <config>` | required |
| Live | `mcp-scan --live <server>` or `--stdio` | required |
| Dynamic | `mcp-scan --live <server> --dynamic --sandbox docker` | explicit, separate |

### Data handling

- Raw scan outputs: `~/.mcp-scan/report-2026/raw/` outside the repo.
- Aggregate: `docs/reports/aggregate-2026.json` with counts only.
- Disclosure log: outside the repo, with vendor, date, finding IDs, and status.
- Repo never contains evidence, server names, hostnames, secrets, or customer data.

### Process

1. Run config scans.
2. Run live scans where permitted.
3. Run dynamic scans where explicitly permitted.
4. Aggregate with `scripts/report/aggregate.js`.
5. Triage every high/critical finding; document false positives.
6. Notify vendors privately; allow 30–90 days.
7. Update the draft report with the real aggregate.
8. Reviewer checks counts; auditor reproduces a sample.

### Gate

- 20 configs scanned at the permitted layers.
- Counts reproduce from the raw outputs.
- Every high/critical finding has a disclosure record.
- No raw evidence in the repo.
- `make public-safety` passes.

---

## 3. Task T4 — Publish and badge

### Goal

Publish the report and open MCP Security Verified applications for the first 10 vendors.

### Process

1. Finalize the report: method, sample, findings, top mistakes, limitations.
2. Replace sample counts in `site/report/index.html` with the real aggregate.
3. Run the publication checklist.
4. Remove the draft label only after the checklist is complete.
5. Publish the report and badge pages.
6. Prepare the async distribution kit.
7. Open badge applications; target 3 applicants.
8. Do not name a vendor without written permission.

### Distribution kit

- Hacker News post: “State of MCP Security 2026: 20 configs, 10 mistakes”.
- Reddit: r/mcp, r/netsec, r/LocalLLaMA.
- LinkedIn: top five findings.
- MCP Discord and OWASP Slack.
- Vendor email: badge criteria and application link.

### Gate

- Report is not labeled draft.
- Every number matches the aggregate.
- No vendor is described as certified without a completed scan.
- Badge criteria and revocation rules are visible.
- Reviewer and auditor sign off.
- `make check` and `make public-safety` pass.

---

## 4. Timeline

| Day | Work | Task |
|---|---|---|
| 1 | Candidate list of 30 | T2 |
| 2 | Permission outreach | T2 |
| 3 | Select 20; manifest | T2 |
| 4 | Buffer for replies; reviewer | T2 |
| 5 | Config scans; aggregate | T3 |
| 6 | Live scans | T3 |
| 7 | Dynamic scans where permitted | T3 |
| 8 | Triage; disclosure | T3 |
| 9 | Report finalization; page update | T4 |
| 10 | Publish; badge applications; distribution | T4 |

Disclosure wait time is outside the active-day estimate. T4 can publish only after the disclosure window or a documented vendor response.

---

## 5. Three-agent model

| Role | Model | Writes | Output |
|---|---|---|---|
| Implementer/editor | OpenCode direct, opencode-go | manifest, aggregate, report, pages | Task deliverables |
| Reviewer | opencode-go, read-only | none | Method, claims, PII, disclosure review |
| Auditor | opencode-go, read-only | none | Reproduces counts and checks the published assets |

No 8-role teamwork. The tasks are sequential and share files; more writers would add conflict and handoff loss. The reviewer and auditor must be independent.

---

## 6. Quality gates

- `make check` passes.
- `make public-safety` passes.
- `docs-lint` passes.
- Every report number matches `aggregate-2026.json`.
- No evidence or PII in the repo.
- High/critical findings have a disclosure record before publication.
- Badge page says “applications open”, not “certified vendors”, until a vendor completes a scan.

---

## 7. Metrics

- 20 permitted configs.
- 10 live-permitted configs.
- 5 dynamic-permitted configs.
- 3 badge applications.
- 3 approved badges.
- 1,000 report downloads.
- 10 inbound emails/DMs.

---

## 8. Risks

| Risk | Mitigation |
|---|---|
| Permission delays | Bench of 10 alternates; start outreach on day 1 |
| PII in the manifest | IDs and public URLs only; private register outside the repo |
| Evidence leak | Raw outputs outside the repo; public-safety gate |
| False positives | Triage before disclosure; document exclusions |
| Disclosure wait | T4 blocked until the window or a documented response |
| Badge perceived as pay-to-play | “No payment for a pass” visible; first 10 free |
| Overclaiming | Keep sample, method, and limitations in the report |
