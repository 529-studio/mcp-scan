# M3 — Public Report & Vendor Badge

**Status:** IMPLEMENTED (infrastructure; data collection pending)
**Owner:** thdat-vu
**Date:** 2026-11-06
**Estimate:** 8–12 active hours (2 working days)

---

## 1. Goal

Turn the M1/M2 scanner into distribution:

1. Publish **“State of MCP Security 2026”** — a small, honest, reproducible report.
2. Launch **“MCP Security Verified”** — a limited badge that vendors can display and users can verify.

The report defines the problem. The badge gives vendors a reason to link back. Neither requires a sales call.

---

## 2. Why now

M1 and M2 are working:

- config rules,
- live `tools/list` rules,
- dynamic sandbox probes.

The missing piece is evidence at the market level. A report with 20 real configs is more persuasive than another README. A badge is a distribution loop: every vendor that displays it sends traffic back to the scanner.

---

## 3. Scope

### In scope

- Data collection from 20 public MCP configurations/servers.
- Permission and responsible disclosure workflow.
- “State of MCP Security 2026” report (Markdown + HTML).
- Report landing page.
- Badge program rules and criteria.
- Badge SVG + Markdown snippet.
- Badge application issue template.
- Public badge listing page.
- Async distribution kit: HN post, Reddit post, LinkedIn post, vendor email.

### Out of scope

- Paid ads.
- Cold calls.
- A hosted dashboard.
- A paid certification body.
- Naming-and-shaming vendors.
- Publishing exploit details.

---

## 4. Report design

### Sample

- 20 public MCP configurations/servers.
- Prefer real, widely used servers and public configs.
- Exclude anything without permission for live/dynamic scanning.
- Record the sample source, date, and limitations.

### Method

1. Static config scan (`mcp-scan .`).
2. Live `tools/list` scan (`--live` or `--stdio`).
3. Dynamic probe only with explicit permission (`--dynamic --sandbox docker`).
4. Aggregate by rule ID and severity.
5. Remove raw evidence, secrets, hostnames, and vendor names.
6. Re-run a sample to check reproducibility.

### Structure

1. Executive summary.
2. Why MCP is a new attack surface.
3. Method and sample.
4. Findings: transport, secrets, supply chain, tool surface, dynamic behavior.
5. Top 10 mistakes.
6. Three anonymized case studies.
7. Remediation checklist.
8. Limitations.
9. Appendix: rules, commands, disclosure policy.

### Claims policy

- No “representative of the ecosystem” claim.
- Say “20 public configs, scanned on this date”.
- Distinguish static, live, and dynamic findings.
- Include the false-positive caveat.
- Link to the raw method and commands.

---

## 5. Badge design

### Name

**MCP Security Verified**

### Criteria

A vendor qualifies when:

1. Config scan: no high or critical findings.
2. Live tool scan: no high or critical findings.
3. Dynamic scan (if run): no `DYN-001`..`DYN-004`.
4. A public or shareable scan report exists.
5. Re-scan is accepted quarterly.

### Process

1. Vendor opens the badge application issue.
2. Scanner runs the three layers with permission.
3. Report is reviewed by the maintainer.
4. Pass: badge + listing + Markdown snippet.
5. Fail: private findings + 30-day fix window, then re-scan.

### Rules

- Free for the first 10 vendors.
- No payment for a pass.
- Badge certifies the scanned config/tool surface, not the whole product.
- Revoke on a new high/critical finding; 30-day fix window.
- No vendor logo use without permission.

### Assets

- `site/badge/index.html` — criteria and application.
- `site/badge/badge.svg` — the mark.
- `docs/BADGE_PROGRAM.md` — full rules.
- `.github/ISSUE_TEMPLATE/badge-application.md` — application form.

---

## 6. Code and content assets

| Path | Purpose |
|---|---|
| `scripts/report/aggregate.js` | Read scan JSON, aggregate by rule/severity, strip evidence |
| `scripts/report/render.js` | Render Markdown/HTML from aggregates |
| `docs/reports/state-of-mcp-security-2026.md` | Canonical report |
| `site/report/index.html` | Report landing page |
| `site/badge/index.html` | Badge program page |
| `site/badge/badge.svg` | Badge mark |
| `docs/BADGE_PROGRAM.md` | Badge rules |
| `.github/ISSUE_TEMPLATE/badge-application.md` | Application |

The scripts must be deterministic and dependency-free. They must never write raw evidence or secrets.

---

## 7. Distribution

### Report

- Hacker News: “State of MCP Security 2026: 20 configs, 10 mistakes”.
- Reddit: r/mcp, r/netsec, r/LocalLLaMA.
- MCP Discord and OWASP Slack.
- LinkedIn: one carousel with the top 5 findings.
- Newsletter: one issue with the checklist.

### Badge

- Vendor README snippet.
- Badge listing page.
- “Who is verified” section in the report.
- Vendor announcement template.

### No calls

- All distribution is async: posts, email, GitHub issues.
- The badge application is a GitHub issue, not a meeting.
- The report is the sales asset.

---

## 8. Who it is for

| Audience | Why they care |
|---|---|
| AI startups | A badge helps answer enterprise security questionnaires |
| Platform teams | A report gives them a baseline and a checklist |
| AppSec teams | A reproducible method and evidence |
| MSSPs | A white-label scan and badge workflow |
| MCP server vendors | A visible trust signal and a distribution link |

---

## 9. Ethics and legal

- Permission before live/dynamic scans.
- Responsible disclosure before publishing vendor findings.
- Aggregate only; no raw secrets, hostnames, or customer data.
- No exploit details.
- No defamation; no vendor shaming.
- Badge is a limited certification, not an endorsement.
- Report includes limitations and false-positive caveats.
- Dataset and tool licenses are respected.

---

## 10. Ten-day timeline

| Day | Work |
|---|---|
| 1 | Select 20 configs; permission outreach |
| 2 | Run static scans; aggregate |
| 3 | Run live scans; aggregate |
| 4 | Run dynamic scans where permitted |
| 5 | Write report draft |
| 6 | Build report and badge pages |
| 7 | Reviewer pass on method and claims |
| 8 | Auditor pass on data and disclosures |
| 9 | Publish report; launch badge |
| 10 | HN/Reddit/LinkedIn; vendor outreach |

---

## 11. Three-agent plan

| Role | Model | Writes | Output |
|---|---|---|---|
| Implementer/editor | OpenCode direct, opencode-go | report, pages, badge, scripts | Published assets |
| Reviewer | opencode-go, read-only | none | Method, claims, legal review |
| Auditor | opencode-go, read-only | none | Data accuracy, disclosure, reproducibility |

Why three:

- The report is a credibility asset; an independent method review is mandatory.
- The badge is a trust claim; an independent data audit is mandatory.
- The content and the pages are tightly coupled; one writer is faster than three.

---

## 12. Definition of Done

1. 20 configs scanned with permission.
2. Report published with method, limitations, and aggregate data.
3. Badge page and rules published.
4. Badge application template exists.
5. Three vendors can apply without a call.
6. No raw secrets, hostnames, or customer data.
7. Reviewer and auditor sign off.
8. `make check` and `make public-safety` pass.
9. Links from README and landing page work.

---

## 13. Metrics

- Report downloads: 1,000.
- GitHub stars: +200.
- Badge applications: 10.
- Badges issued: 3.
- Inbound emails/DMs: 10.
- Design partners: 3.

---

## 14. Risks

| Risk | Mitigation |
|---|---|
| Permission delays | Start with public configs and owned servers |
| Report bias | State the sample and limitations; no ecosystem claim |
| Vendor backlash | Responsible disclosure; aggregate only |
| Badge seen as pay-to-play | Free for first 10; no payment for a pass |
| Data leak | Strip evidence; auditor pass |
| Low distribution | Badge links + HN/Reddit/LinkedIn |
| Claims drift | Reviewer checks every number against the aggregate |

---

## 15. Relation to M1 and M2

M1 and M2 produce the evidence. M3 turns the evidence into distribution. The report is not a marketing brochure; it is a reproducible scan summary with a method and a checklist.

The badge is not a certification body. It is a limited, revocable trust signal for the scanned surface.

---

## 16. Implementation note

Implemented on 2026-11-06:

- `scripts/report/aggregate.js` — counts only; strips evidence and server names.
- `scripts/report/render.js` — Markdown/HTML drafts; `--publish` is explicit.
- `docs/reports/state-of-mcp-security-2026.md` — draft report with sample data.
- `site/report/index.html` — report landing page, clearly marked draft.
- `docs/BADGE_PROGRAM.md`, `site/badge/index.html`, `site/badge/badge.svg`.
- `.github/ISSUE_TEMPLATE/badge-application.md`.
- `test/report.test.js` and lesson L14.

Remaining:

- 20 permitted configs have not been scanned yet.
- Responsible disclosure has not started.
- No vendor is certified; applications are open for the first 10.
- Independent reviewer/auditor sign-off is pending due to the free model quota.
- The report page must not be cited as ecosystem data until the sample is replaced.
