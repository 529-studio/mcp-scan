# Handoff — Spec Miner

**Status:** DONE (manual fallback; subagent quota blocked)

## Protocol Notes

- MCP stdio uses newline-delimited JSON-RPC 2.0: one JSON object per line.
- Client sequence: `initialize`, `notifications/initialized`, `tools/list`.
- `tools/list` may return `nextCursor`; the client follows it until absent.
- Every request needs a timeout; a child that exits early must reject pending requests.
- The client sends `protocolVersion: "2025-06-18"` and accepts the server's response.
- No shell interpolation: spawn with an argument array.

## Rule Specs

| ID | Signal | Severity |
|---|---|---|
| MCP-011 | Instruction-like description | High |
| MCP-012 | Secret path reference | High |
| MCP-013 | Destructive verb | High |
| MCP-014 | Shell/exec primitive | High |
| MCP-015 | Network/egress primitive | Medium |
| MCP-016 | File-write primitive | Medium |
| MCP-017 | Unconstrained command/path/url field | Medium |
| MCP-018 | Hidden or encoded content | High |
| MCP-019 | `readOnlyHint` contradiction | High |
| MCP-020 | Missing or unusable description | Low |

## False-Positive Notes

- Do not match bare `request`; require `http request`, `api request`, or a URL.
- Do not match bare `create`; require `create file` or a write verb.
- Evidence is a short excerpt, never a credential value.
- A `readOnlyHint` mismatch is high severity because it can bypass approval.

## References

- MCP specification: <https://modelcontextprotocol.io>
- OWASP Top 10 for LLM Applications
- `docs/sprints/M1-PROTOCOL-SCANNER.md`
