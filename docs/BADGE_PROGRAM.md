# MCP Security Verified — badge program

**Status:** Applications open for the first 10 vendors.
**Badge page:** [site/badge/index.html](../site/badge/index.html)
**Apply:** [.github/ISSUE_TEMPLATE/badge-application.md](../.github/ISSUE_TEMPLATE/badge-application.md)

---

## 1. What it is

**MCP Security Verified** is a limited, revocable trust signal for the scanned MCP surface of a server or platform.

It is not an endorsement of the whole product. It is not a certification body. It says: at the time of the scan, the submitted configuration and tool surface passed the checks below.

---

## 2. What it certifies

| Layer | Check |
|---|---|
| Config | `mcp-scan` config rules; no high or critical findings |
| Live tools | `mcp-scan --live` or `--stdio`; no high or critical findings |
| Dynamic | `--dynamic` where permitted; no `DYN-001`..`DYN-004` |

The report must be shareable with the maintainer. It may be public or private; the badge listing links to a public summary if the vendor agrees.

---

## 3. Criteria

A vendor qualifies when:

1. The config scan has no high or critical findings.
2. The live tool scan has no high or critical findings.
3. The dynamic scan, if run, has no `DYN-001`..`DYN-004`.
4. A scan report exists and is reproducible.
5. The vendor accepts a quarterly re-scan.
6. The vendor agrees to the badge rules below.

---

## 4. Process

1. Vendor opens the badge application issue.
2. Maintainer confirms permission and scope.
3. Scanner runs the three layers.
4. Maintainer reviews the report.
5. Pass: badge, listing, and Markdown snippet.
6. Fail: private findings and a 30-day fix window, then re-scan.

No sales call is required.

---

## 5. Badge snippet

```md
[![MCP Security Verified](https://raw.githubusercontent.com/529-studio/mcp-scan/dev/site/badge/badge.svg)](https://github.com/529-studio/mcp-scan/blob/dev/docs/BADGE_PROGRAM.md)
```

Replace the raw URL with the hosted URL after the badge page is deployed. Do not alter the mark.

---

## 6. Rules

- Free for the first 10 vendors.
- No payment for a pass.
- The badge covers the scanned configuration and tool surface only.
- The vendor must not imply that the whole product is certified.
- The vendor must not use the mark after revocation.
- The maintainer may revoke the badge if a new high or critical finding appears.
- Revocation includes a private notice and a 30-day fix window.
- No vendor logo is used without permission.

---

## 7. Re-scan

- Quarterly, or after a major change to the server or tool surface.
- The vendor may request an earlier re-scan.
- A failed re-scan starts the 30-day fix window.
- The listing shows the scan date, not a perpetual “verified” claim.

---

## 8. FAQ

**Is this a certification?**
No. It is a limited, revocable scan result for a specific surface and date.

**Does it mean the server is safe?**
No. It means the scanned configuration and tools passed the current rules.

**Can we pay for a pass?**
No. The first 10 are free; payment never buys a pass.

**What happens if we fail?**
You get private findings and a 30-day fix window. You can re-apply after the fix.

**Do you publish our name?**
Only with permission. The report otherwise uses aggregate data.

**Do you scan without permission?**
No. Live and dynamic scans require explicit permission.

---

## 9. Ethics

- Permission first.
- Responsible disclosure.
- No exploit details.
- No shaming.
- No raw secrets, hostnames, or customer data.
- No claim that the badge replaces a pentest.

---

## 10. Related

- [State of MCP Security 2026](reports/state-of-mcp-security-2026.md)
- [M3 plan](sprints/M3-PUBLIC-REPORT-BADGE.md)
- [Rules](rules.md)
