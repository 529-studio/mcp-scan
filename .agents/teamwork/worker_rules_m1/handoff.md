# Handoff — Worker Rules

**Status:** DONE (manual fallback; subagent quota blocked)

## Files

- `src/tool-rules.js` — `toolRules` and `scanTools`.
- `test/fixtures/tools/tools.js` — clean and bad tool fixtures.
- `test/tool-rules.test.js` — every rule fires; clean tool returns 0.
- `docs/rules.md` — MCP-011..MCP-020.

## Coverage

| Rule | Fixture signal |
|---|---|
| MCP-011 | `run_shell` "before using this tool"; `hidden_tool` HTML comment |
| MCP-012 | `run_shell` `~/.ssh/id_rsa` |
| MCP-013 | `delete_file` |
| MCP-014 | `run_shell` |
| MCP-015 | `fetch_url` |
| MCP-016 | `write_file` |
| MCP-017 | `run_shell` command, `fetch_url` url, `delete_file` path |
| MCP-018 | `hidden_tool` zero-width + HTML comment |
| MCP-019 | `delete_file` `readOnlyHint: true` |
| MCP-020 | `mystery_tool` empty description |

## Verification

```text
$ node test/tool-rules.test.js
ok — 10 tool rules, clean fixture, bounded evidence
```

## False-Positive Adjustments

- `NETWORK` no longer matches bare `request`; it requires `http request`, `api request`, a URL, or an egress verb.
- `FILE_WRITE` no longer matches bare `create`; it requires a write verb or `create file`.
- Evidence is capped at 160 characters and never prints a credential assignment.
