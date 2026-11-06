# Lessons Index

One row per engineering lesson. The full text lives in the linked file; this index is the only part an agent should read by default.

| # | Lesson | Mandatory guardrail | File |
|---|---|---|---|
| 1 | Synthetic data is not automatically anonymous | Document a re-identification assessment before calling synthetic data anonymous. | [L01](L01-synthetic-data-is-not-automatically-anonymous.md) |
| 2 | CC BY attribution is not optional | Keep dataset, author, and license notices in every redistribution and derivative. | [L02](L02-cc-by-attribution-is-not-optional.md) |
| 3 | Do not claim more than the scanner checks | Mark alpha scope and unbuilt features honestly in README and landing copy. | [L03](L03-do-not-claim-more-than-the-scanner-checks.md) |
| 4 | Apache-2.0 for an open-core security tool | Keep the CLI and rules permissive; keep the hosted layer commercial. | [L04](L04-apache-2-open-core-for-security-tools.md) |
| 5 | Fake secrets in fixtures can trigger push protection | Use obviously fake values and never token-shaped prefixes in fixtures. | [L05](L05-fake-secrets-in-fixtures-can-trigger-push-protection.md) |
| 6 | Unpinned npx is a supply-chain risk | Pin exact versions for every MCP server and Docker image. | [L06](L06-unpinned-npx-is-a-supply-chain-risk.md) |
| 7 | Tool descriptions are untrusted input | Treat tool descriptions, resources, and outputs as untrusted text. | [L07](L07-tool-descriptions-are-untrusted-input.md) |
| 8 | Landing pages must not sell unbuilt features | Label roadmap and waitlist items; never imply availability. | [L08](L08-landing-pages-must-not-sell-unbuilt-features.md) |
| 9 | Cursor pagination must advance by offset | A cursor is a position, not a boolean; always return a new cursor or stop. | [L09](L09-cursor-pagination-must-advance-by-offset.md) |
| 10 | A live scanner must own process lifecycle | Every live scan needs a timeout, a kill path, and pending-request rejection. | [L10](L10-a-live-scanner-must-own-process-lifecycle.md) |
