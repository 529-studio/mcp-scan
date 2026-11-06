# License decision — mcp-scan

**Decision:** Apache License 2.0 for the open-source core (CLI, rules, tests, docs). Commercial license for the hosted dashboard, SSO, policy packs, runtime guard, and enterprise connectors.

This document records why, so the choice is not re-litigated every six months.

---

## 1. What we need

| Requirement | Weight |
|---|---|
| Developers can try it without asking legal | High |
| Enterprises can adopt it | High |
| Vendors can embed it in CI | High |
| We can sell a hosted/enterprise layer | High |
| Competitors cannot simply host our code as a service | Medium |
| Patent protection | Medium |
| Trademark protection | Medium |
| Community contributions | High |

No single license satisfies all of these perfectly. The question is which trade-off fits a security tool with an open-core business.

---

## 2. Options considered

| License | OSI-approved | Commercial use | Patent grant | Copyleft | SaaS clone risk | Enterprise friction | Verdict |
|---|---|---|---|---|---|---|---|
| MIT | Yes | Yes | No | No | High | Low | Too permissive for a security brand |
| Apache-2.0 | Yes | Yes | Yes | No | High | Low | **Chosen for the core** |
| MPL-2.0 | Yes | Yes | Yes (implicit) | File-level | Medium | Low–medium | Good, but less familiar to buyers |
| AGPL-3.0 | Yes | Yes | Yes (implicit) | Network | Low | High | Rejected for the core |
| BSL 1.1 | No | Yes, with limits | No | No | Low | Medium | Rejected: not open source |
| Elastic 2.0 | No | Yes, with limits | No | No | Low | Medium | Rejected: not open source |
| SSPL | No | Yes, with limits | No | Network | Low | High | Rejected: not open source |

---

## 3. Why Apache-2.0

### 3.1 Adoption is the distribution

A security scanner is only useful if it runs everywhere: local dev, CI, GitHub Actions, vendor pipelines. Apache-2.0 is the default license enterprises and platform teams can approve without a legal review.

### 3.2 Patent grant

Apache-2.0 includes an express patent grant. For a security tool that may implement techniques covered by patents, this reduces friction for adopters and contributors.

### 3.3 Trademark and notice

Apache-2.0 requires preservation of notices and does not grant trademark rights. That lets us protect the `mcp-scan` name and the “MCP Security Verified” badge while keeping the code permissive.

### 3.4 Open-core is the business model

The moat is not the 10 rules. It is:

- the hosted evidence layer and scan history;
- policy packs and custom rules;
- SSO, audit logs, and enterprise controls;
- runtime guard and integrations;
- support, SLA, and security review.

Those are separate commercial offerings. The core scanner stays Apache-2.0.

---

## 4. Why not AGPL-3.0

AGPL would make a hosted clone publish its modifications. That sounds attractive, but:

- many enterprises ban AGPL outright;
- it creates friction for vendors embedding the scanner;
- it signals “we don’t trust our business model”;
- the actual moat is the hosted layer, not the scanner source.

AGPL is a reasonable choice for a server product with no open-core plan. It is the wrong default for a developer tool that wants distribution.

If we later find a hosted clone competing directly, we can add a separate server component under AGPL or a commercial license — without relicensing the CLI.

---

## 5. Why not BSL / SSPL / Elastic

Those licenses are **source-available**, not open source. They:

- fail the OSI definition;
- create ambiguity in procurement;
- make “open source” in the README misleading;
- are harder to explain to a community.

For a security tool, trust and clarity matter more than blocking every clone.

---

## 6. Why not MIT

MIT is simpler, but it lacks:

- an express patent grant;
- a trademark clause;
- the notice discipline that enterprises expect.

Apache-2.0 is only slightly more complex and materially better for a commercial open-source project.

---

## 7. Open-core boundary

| Path | License | Notes |
|---|---|---|
| `src/` | Apache-2.0 | CLI, rules, scanner core |
| `test/` | Apache-2.0 | Fixtures and tests |
| `docs/` | Apache-2.0 | Documentation |
| `site/` | Apache-2.0 | Landing page |
| `ee/` (future) | Commercial | SSO, policy packs, audit, runtime guard |
| Hosted service | Commercial | Dashboard, history, alerts |

Rule: **no open-core bait-and-switch.** Features that exist in the CLI today stay Apache-2.0.

---

## 8. Contributions

We use the Developer Certificate of Origin (DCO), not a CLA.

- Low friction for contributors.
- Enough provenance for a small project.
- If we later need dual licensing, we can revisit with a CLA — but that is a deliberate, visible change.

---

## 9. Trademark

The code is open. The name is not.

- “mcp-scan” and the logo are trademarks of 529 Studio.
- Forks may use the code under Apache-2.0 but must not imply endorsement.
- The “MCP Security Verified” badge is a separate certification mark with its own criteria.

---

## 10. Revisit triggers

Revisit this decision only if:

1. a hosted clone takes meaningful revenue with no contribution;
2. an enterprise customer requires a different license for procurement;
3. the open-core boundary needs to move;
4. the project adopts a foundation or a consortium.

Until then: Apache-2.0, DCO, open core.
