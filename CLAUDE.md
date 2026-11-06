# CLAUDE.md

Entry point only. Rule text lives in `AGENTS.md`; this file imports it so the two cannot drift.

@AGENTS.md

## Skills

Canonical skills live in `.agents/skills/`:

- `mcp-security-review` — review MCP configs and findings.
- `rule-authoring` — add a rule, fixture, docs entry, and test.
- `oss-gtm` — public report, vendor badge, no-call distribution.

`.claude/skills` may be a symlink to `.agents/skills` so Claude Code, OpenCode, and Codex see the same files. Do not duplicate skill text.
