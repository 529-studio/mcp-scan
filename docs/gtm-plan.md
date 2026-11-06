# GTM plan — mcp-scan

**Motion:** open-source + public report + vendor badge. No cold calls.

**Goal (90 days):** 500 GitHub stars, 100 active installs, 3 design partners, 3 paid accounts, 1 public “State of MCP Security” report, 3 vendor badges.

---

## 1. Positioning

> **mcp-scan is the first 5-minute security check for MCP servers.** It finds the mistakes that show up in real agent deployments, gives you a fix, and produces evidence for CI and audits.

Not “AI security platform”. Not “pentest”. Not “runtime firewall”. The wedge is narrow and technical.

---

## 2. Who pays

| Segment | User | Economic buyer | Budget | Price |
|---|---|---|---|---|
| AI-native startup (10–200) | AI/security engineer | CTO/Founder | AI platform, security | $99–$999/mo |
| Mid-market SaaS (200–1,000) | AppSec engineer | CISO/VP Eng | AppSec, compliance | $2k–$10k/mo |
| Enterprise AI platform | Security architect | CISO/CTO | Security, AI platform | $50k–$200k/yr |
| MSSP/consultancy | Security consultant | Partner | Delivery tooling | $1k–$5k/mo/client |

**Who signs the check:** CTO/Founder for startups; CISO/VP Engineering for mid-market; CISO/CTO for enterprise; Partner for MSSPs.

**Who feels the pain:** the engineer who has to answer “is your agent secure?” with a blank page.

---

## 3. The three engines

### Engine A — Open source

**Why:** developers try before they talk. GitHub is the landing page.

**Tactics:**
- Publish `mcp-scan` under Apache-2.0.
- 10 deterministic rules, JSON/SARIF, GitHub Action.
- README with real output and a 30-second demo.
- `npx github:529-studio/mcp-scan .` as the one-liner.
- Issue templates: “new rule”, “false positive”, “server compatibility”.

**Success signal:** 100 stars, 20 installs, 5 issues/feedback in 14 days.

### Engine B — Public report

**Why:** define the problem, become the reference, earn trust without a sales call.

**Report:** “State of MCP Security 2026”.
- Scan 20 popular MCP servers (with permission or public configs).
- Responsible disclosure first: notify vendors, give 30–90 days.
- Publish aggregate findings, not exploitable details.
- Include a “top 10 mistakes” section and a checklist.
- Publish as Markdown + PDF + a landing page.

**Distribution:** Hacker News, r/mcp, r/LocalLLaMA, r/netsec, MCP Discord, OWASP Slack, LinkedIn, newsletter.

**Success signal:** 1,000 report downloads, 10 inbound emails.

### Engine C — Vendor badge

**Why:** vendors want to look secure; their README is your distribution.

**Program:** “MCP Security Verified”.
- Vendor submits a config/server.
- `mcp-scan` runs a standard scan.
- If no high/critical findings, vendor gets a badge + listing.
- Badge links to a public report page.
- Re-scan quarterly.

**Rules:**
- Free for the first 10 vendors.
- No payment for a pass.
- A badge is not an endorsement of the whole product; it certifies the scanned config only.
- Revoke if a high/critical finding appears.

**Success signal:** 3 vendors display the badge; 10 applications.

---

## 4. 90-day plan

### Days 1–14 — ship the wedge

- [x] 10 rules, CLI, JSON/SARIF, tests.
- [x] README + landing page.
- [ ] GitHub Action.
- [ ] 3 public demo configs (good/bad).
- [ ] Publish repo.
- [ ] Post “Show HN: mcp-scan”.

### Days 15–30 — public report

- [ ] Pick 20 MCP servers/configs.
- [ ] Scan, verify, write findings.
- [ ] Responsible disclosure to vendors.
- [ ] Publish “State of MCP Security 2026”.
- [ ] Post on HN/Reddit/Discord/LinkedIn.

### Days 31–60 — design partners

- [ ] 10 async conversations (email/DM, no call).
- [ ] 3 free scans + reports.
- [ ] 3 design partner agreements.
- [ ] Add 5 rules from real findings.
- [ ] Publish 2 case studies (anonymized).

### Days 61–90 — paid + badge

- [ ] Pro plan ($99/mo) + Team plan ($499/mo).
- [ ] 3 paid accounts.
- [ ] 3 vendor badges.
- [ ] GitHub Marketplace listing.
- [ ] “State of MCP Security” Q2 update.

---

## 5. Content calendar

| Week | Asset | Channel |
|---|---|---|
| 1 | “Why MCP is a new attack surface” | Blog, LinkedIn |
| 2 | “10 MCP misconfigurations” | Blog, HN |
| 3 | “State of MCP Security 2026” | Report, HN, Reddit |
| 4 | “Tool poisoning, explained” | Blog, YouTube |
| 5 | “How to add mcp-scan to CI” | Docs, LinkedIn |
| 6 | “What a vendor badge means” | Blog, vendor outreach |
| 7 | “Case study: 3 findings, 3 fixes” | Blog, LinkedIn |
| 8 | “MCP security checklist” | Lead magnet |

---

## 6. Async outreach templates

### To a vendor

> Subject: 3 findings in your MCP server (fix inside)
>
> “Chào [tên], mình chạy `mcp-scan` trên config public của [server] và thấy 3 vấn đề: unpinned npx package, debug flag, và thiếu auth cho remote endpoint. Mình gửi kèm report + fix. Nếu hữu ích, mình có thể cấp badge ‘MCP Security Verified’ miễn phí sau khi fix. Không cần call.”

### To an AI startup

> Subject: security questionnaire for your agent
>
> “Chào [tên], khách hàng của bạn có hỏi agent có an toàn không chưa? Mình có một scanner 5 phút cho MCP config, trả về finding + fix + evidence. Mình có thể gửi một report mẫu. Không cần call.”

### To an MSSP

> Subject: white-label MCP scan for your clients
>
> “Chào [tên], bạn có khách hàng đang dùng MCP/agent chưa? Mình có CLI + report có thể white-label. Bạn giữ quan hệ khách, mình lo scan. Có muốn nhận 1 sample report không?”

---

## 7. Metrics

| Metric | Target (90 days) |
|---|---|
| GitHub stars | 500 |
| Weekly installs | 100 |
| Report downloads | 1,000 |
| Inbound emails/DMs | 30 |
| Design partners | 3 |
| Paid accounts | 3 |
| Vendor badges | 3 |
| MRR | $1k–$3k |

**Kill criteria:**
- <100 stars after 30 days and no inbound.
- 0 design partners after 60 days.
- False positive rate >30% in real configs.

---

## 8. Legal and ethics

- Apache-2.0 for the scanner and rules.
- Responsible disclosure before publishing vendor findings.
- No exploit code, no data exfiltration, no scanning without permission.
- Mask secrets in reports.
- Badge is a limited certification, not an endorsement.
- Do not use vendor logos without permission.

---

## 9. Budget

| Item | Cost |
|---|---|
| Domain | ~$12/year |
| GitHub | $0 |
| Hosting (landing/report) | $0–$20/mo |
| Design | $0 (use the repo’s HTML) |
| Total | <$50/month |

---

## 10. What not to do

- Do not build a dashboard before 3 design partners.
- Do not add 100 rules before 10 are correct.
- Do not publish exploitable findings.
- Do not sell “100% secure”.
- Do not run paid ads before the report has traction.
