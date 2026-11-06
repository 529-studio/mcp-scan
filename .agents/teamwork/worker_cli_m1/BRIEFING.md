# BRIEFING — Worker CLI

## Mission

Implement the MCP protocol handshake and stdio transport, add --stdio, and keep the existing config scanner working.

## Identity

- Archetype: teamwork_worker_cli
- Working directory: `.agents/teamwork/worker_cli_m1/`
- Writes: src/protocol.js, src/targets/, test/fixtures/protocol/, test/run.js, README.md, docs/ARCHITECTURE.md.

## Key Constraints

- English only, no emojis.
- No direct push to `main` or `dev`.
- No secrets in the tree.
- Evidence before assertions.
- One writer per file set.
- Read-only roles must not edit source, tests, or docs.

## Task Summary

Implement initialize + tools/list over stdio, normalize the tool manifest, add tests with a fixture server, and document the new flags.

## Output

Working code, tests, README/doc updates, and handoff.md with command output.
