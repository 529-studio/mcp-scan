# Handoff — Implementer (M3)

**Status:** DONE (infrastructure; data collection pending)

## Files

- `scripts/report/aggregate.js` — counts only; strips evidence and server names.
- `scripts/report/render.js` — Markdown/HTML drafts; `--publish` is explicit.
- `docs/reports/state-of-mcp-security-2026.md` — draft report with sample data.
- `site/report/index.html` — report page, clearly marked draft.
- `docs/BADGE_PROGRAM.md` — criteria, process, rules, revocation.
- `site/badge/index.html` — badge page.
- `site/badge/badge.svg` — badge mark.
- `.github/ISSUE_TEMPLATE/badge-application.md` — application.
- `test/report.test.js` — aggregate/render/no-evidence test.

## Verification

```text
$ node test/report.test.js
ok — report aggregate and render, no evidence leakage

$ make check
ok — config, tool, protocol, dynamic, report, live CLI
docs-lint: OK
[OK] Public-safety guard passed.
```

## Notes

- The report uses two sample scan files, not ecosystem data.
- No vendor is certified yet; applications are open for the first 10.
- The 20-config sample requires permission and responsible disclosure.
