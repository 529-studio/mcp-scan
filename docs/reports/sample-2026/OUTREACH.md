# Sample outreach protocol (M3-T2)

**Status:** Ready to use.
**Issue:** [#9](https://github.com/529-studio/mcp-scan/issues/9)
**Manifest:** `docs/reports/sample-2026/MANIFEST.md` (created in T2).

This protocol keeps the 20-config sample respectful, transparent, and legal. It is not a sales script. It is a permission request with a clear opt-out.

---

## 1. Permission ladder

Ask one step at a time. Do not bundle all four into one message.

| Step | Ask | What runs | Risk |
|---|---|---|---|
| 1 | Static scan of a public artifact | `mcp-scan --format json` | Low |
| 2 | Live `tools/list` | `mcp-scan --live` or `--stdio` | Medium: reads the tool manifest |
| 3 | Dynamic sandbox | `--dynamic --sandbox docker` | Higher: calls read-only tools with canaries |
| 4 | Public quote, name, or logo | Written consent | Reputational |

Rules:

- Step 1 is the default. Steps 2–4 are separate asks.
- Never run step 2 or 3 without explicit permission.
- A “no” at any step does not remove the earlier permission, unless the vendor says so.
- If a vendor asks to be excluded entirely, remove the entry and stop contacting them.

---

## 2. What to say before you ask

1. Who you are and a link to the repository.
2. Why you are collecting the sample.
3. What you already ran, and what you found (category only, no exploit details).
4. What you will publish, and what you will not publish.
5. The opt-out: “If you prefer, I will exclude you.”
6. No call. One clear yes/no.

Do not lead with “can I scan your server?”. Lead with the private report.

---

## 3. Channels

| Audience | Channel | Notes |
|---|---|---|
| Open-source maintainer | GitHub issue or project Discord | Public and low-pressure; do not DM without context |
| Company / DevRel | Security contact or DevRel email | Mention responsible disclosure and private report |
| Vietnamese team | Email or LinkedIn message | Polite, direct, no hard sell |
| Community | MCP Discord, OWASP Slack | Share the method, not a scan request |

---

## 4. Template — open-source maintainer (English)

```text
Hi [name],

I'm [name], maintainer of mcp-scan, an open-source security scanner for MCP servers:
https://github.com/529-studio/mcp-scan

I'm preparing a small report on 20 public MCP configurations. I ran the static scan on your public config and found [N] issue(s), including [one category, no exploit details].

I can send you the full private report. No public vendor name, no call, no obligation.

If you're open to it, I'd also like permission to run a read-only `tools/list` scan — it reads the tool manifest only and does not execute tools. Dynamic sandbox probing is separate and optional.

If you'd rather I exclude [server] entirely, just say so and I'll remove it.

— [name]
```

Do not post exploit details in a public issue. Ask for a private channel first.

---

## 5. Template — company / DevRel (English)

```text
Subject: Permission request: private MCP security scan for [product]

Hello [name],

I'm [name], maintainer of mcp-scan (link). I'm preparing a report on MCP security and would like to include [product].

What I would run:
1. Static scan of the public config.
2. Read-only `tools/list` scan — no tool execution.
3. Optional dynamic sandbox — read-only tools with canary inputs, no network, no exploit.

What I would publish: aggregate counts and anonymized examples only. No vendor name, hostnames, evidence, or customer data without your written consent. High/critical findings go to you privately first, with a 30-day window.

If you're not comfortable, I'll exclude [product]. No call needed.

— [name]
```

---

## 6. Template — Vietnamese team

```text
Chào anh/chị [tên],

Mình là [tên], đang làm mcp-scan — công cụ scan bảo mật cho MCP server (link). Mình đang tổng hợp một báo cáo nhỏ từ 20 cấu hình MCP công khai.

Mình đã chạy static scan trên config public của [server] và thấy [N] điểm cần xem. Mình có thể gửi report riêng — không public tên vendor, không cần call, không ràng buộc gì.

Nếu anh/chị đồng ý, mình xin phép chạy thêm live `tools/list` (chỉ đọc danh sách tool, không gọi tool). Dynamic sandbox là bước riêng, chỉ chạy nếu anh/chị cho phép.

Nếu không muốn, mình bỏ [server] khỏi danh sách ngay.
```

Use “anh/chị” for a company; use “bạn” if you already know the person. Do not use “cho mình xin config” or “gửi server đây”.

---

## 7. Follow-up policy

- One follow-up after 7–10 days.
- No “just checking in” loops.
- If no reply after the follow-up, mark `no-response` and move to an alternate.
- If declined, record `declined` and do not contact again.
- Never pressure, never imply urgency, never mention a competitor’s participation.

---

## 8. Tracking fields

Private register, outside the repository:

| Field | Example |
|---|---|
| ID | `S01` |
| Source | public URL |
| Contact | private |
| Static permission | `public` / `granted` / `declined` |
| Live permission | `granted` / `pending` / `declined` |
| Dynamic permission | `granted` / `pending` / `declined` |
| Public name permission | `yes` / `no` |
| Last contact | date |
| Status | `selected` / `bench` / `excluded` |
| Notes | private |

The public manifest contains only ID, category, public source URL, and permission status. No contacts.

---

## 9. Disclosure

- High/critical findings go to the vendor privately first.
- Allow 30–90 days before publication.
- The report uses aggregate counts and anonymized examples.
- No vendor name without written consent.
- If the vendor fixes the issue, record the fix date.
- If the vendor does not respond, record the disclosure attempt and exclude the vendor name.

---

## 10. Do and do not

| Do | Do not |
|---|---|
| Identify yourself and link the repo | Use an anonymous account |
| State exactly what will run | Say “just a scan” |
| State what will be published | Publish a vendor name without consent |
| Offer an opt-out immediately | Send three follow-ups |
| Send the private report first | Post exploit details publicly |
| Ask one step at a time | Bundle static, live, dynamic, and quote |
| Respect “no” | “Just checking in” repeatedly |
| Keep the ask short | Write a sales pitch |

---

## 11. Checklist before sending

- [ ] The recipient is the right person or security contact.
- [ ] The message includes a repo link and a clear scope.
- [ ] The message includes an opt-out.
- [ ] No exploit details in a public channel.
- [ ] No PII in the public manifest.
- [ ] The private register is outside the repository.
- [ ] The next step is one ask, not four.
