# State of MCP Security 2026

**Status:** DRAFT — sample data only; not representative of the ecosystem.
**Generated:** 2026-11-06
**Sample:** 2 scan files, 4 servers, 8 findings.

> This draft validates the report pipeline. Replace the sample with 20 permitted configurations before publishing. Do not cite the numbers below as ecosystem findings.

---

## 1. Executive summary

MCP servers give agents real permissions: files, databases, APIs, shell, and network. The first pass of this project found the same pattern repeatedly: the model is reviewed, the configuration is not.

This draft is a pipeline test, not a market study. It uses two sample scan files to verify aggregation and rendering. The published report will use 20 permitted configurations and will state its limitations.

---

## 2. Method

1. Run `mcp-scan --format json` on each permitted configuration.
2. Run a live scan (`--live` or `--stdio`) where permission allows.
3. Run a dynamic sandbox probe (`--dynamic --sandbox docker`) only with explicit permission.
4. Aggregate counts with `scripts/report/aggregate.js`.
5. Render with `scripts/report/render.js`.
6. Review every number against the aggregate before publishing.

---

## 3. Sample findings

| Severity | Count |
|---|---:|
| Medium | 3 |
| High | 5 |

| Rule | Title | Severity | Count |
|---|---|---|---:|
| `MCP-003` | Secret-like environment variable is set inline | High | 2 |
| `DYN-001` | Tool read a host canary file | High | 1 |
| `DYN-004` | Tool output contains instruction-like content | High | 1 |
| `DYN-005` | Tool exceeded the time budget | Medium | 1 |
| `MCP-002` | `npx` package is not pinned | Medium | 1 |
| `MCP-011` | Tool description contains instruction-like content | High | 1 |
| `MCP-017` | Schema leaves a command, path, or URL unconstrained | Medium | 1 |

These are sample counts. They are not a ranking of the ecosystem.

---

## 4. Top mistakes to check first

These are the mistakes the scanner is designed to catch. The published report will show how often they appeared in the sample.

1. **Secrets in the config.** API keys and tokens in `mcp.json`, dotfiles, or logs.
2. **Unpinned packages.** `npx` or Docker images that can change after review.
3. **Broad filesystem roots.** A tool that can read the whole home directory.
4. **Wildcard binds.** A server exposed to `0.0.0.0` or any origin.
5. **Write access by default.** A tool that can modify files or data without approval.
6. **Instruction-like tool descriptions.** Text the model reads as policy.
7. **Unconstrained command/path/url fields.** Free-form input that widens the injection surface.
8. **Hidden content.** HTML comments, zero-width characters, or encoded blocks.
9. **False read-only annotations.** `readOnlyHint: true` on a write or destructive tool.
10. **No audit trail.** No record of what the agent did.

---

## 5. What this draft is not

- Not a representative study.
- Not a vendor ranking.
- Not a pentest.
- Not a claim that a server is safe.
- Not a substitute for a human review.

---

## 6. Limitations

- The sample is two synthetic scan files.
- Static, live, and dynamic findings are not equivalent.
- Rules are heuristic and can produce false positives.
- No evidence, server names, or credentials are included.
- Dynamic findings require permission and a sandbox.

---

## 7. Publication checklist

Before this report is published:

- [ ] 20 permitted configurations are scanned.
- [ ] Permission is recorded for every live/dynamic scan.
- [ ] Vendors with high/critical findings are notified privately.
- [ ] 30–90 days of disclosure time is allowed.
- [ ] Aggregate is generated from the final scan set.
- [ ] Every number is checked against the aggregate.
- [ ] No raw evidence, server names, secrets, or customer data.
- [ ] Reviewer checks method and claims.
- [ ] Auditor re-runs a sample and checks reproducibility.
- [ ] Report and badge pages are linked from the README and landing page.

---

## 8. Reproduce this draft

```bash
node scripts/report/aggregate.js test/fixtures/report --out /tmp/aggregate.json
node scripts/report/render.js /tmp/aggregate.json --format md
```

Pass `--publish` only after the publication checklist is complete.

---

## 9. Related

- [Badge program](../BADGE_PROGRAM.md)
- [M3 plan](../sprints/M3-PUBLIC-REPORT-BADGE.md)
- [Rules](../rules.md)
