---
name: rule-authoring
description: >-
  Use this skill when adding or changing a rule in mcp-scan. It enforces the
  rule contract: narrow trigger, evidence, impact, fix, fixture, docs entry, and
  a test that fails before and passes after.
---

# Rule Authoring

A rule is a small, deterministic function with a stable ID. If it cannot produce evidence, it does not ship.

## When to activate

- Adding `MCP-0xx`.
- Changing an existing rule's trigger or severity.
- Removing a noisy rule.

## Contract

Every rule must have:

1. A stable ID (`MCP-0xx`).
2. A title that names the problem.
3. A severity (`info`, `low`, `medium`, `high`, `critical`).
4. A reference (`Transport security`, `Supply chain`, etc.).
5. A `check(server)` function that returns `null` or `{ evidence, impact, fix }`.
6. A fixture that triggers it.
7. An entry in `docs/rules.md`.
8. A test assertion in `test/run.js` or a dedicated fixture.

## Procedure

1. Write the failing fixture first.
2. Add the rule in `src/rules.js`.
3. Run `node src/cli.js test/fixtures/bad.mcp.json --fail-on none`.
4. Add the docs entry.
5. Add the test.
6. Run `make check`.
7. Record a lesson if the rule exposed a trap.

## Quality bar

- Narrow trigger: one problem per rule.
- Deterministic: no LLM, no network, no timing.
- Evidence: a human can verify it from the config.
- Fix: a concrete change, not "be careful".
- False positives: document the edge cases.
- No exploitation.

## Anti-patterns

- A rule that flags every server.
- A rule that depends on a remote API.
- A rule that hides a failure.
- A rule with no fixture.
- A rule that claims more than it checks.
