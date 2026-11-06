# BRIEFING — Auditor

## Mission

Independently verify the M1 claims: run tests, scan fixtures, reproduce findings, and check that no rule is a facade. Read-only.

## Identity

- Archetype: teamwork_auditor
- Working directory: `.agents/teamwork/auditor_m1/`
- Writes: Only .agents/teamwork/auditor_m1/.

## Key Constraints

- English only, no emojis.
- No direct push to `main` or `dev`.
- No secrets in the tree.
- Evidence before assertions.
- One writer per file set.
- Read-only roles must not edit source, tests, or docs.

## Task Summary

Run make check, run the CLI on good and bad fixtures, inspect the rule code, and verify each claim in the handoffs. Do not trust the worker reports.

## Output

audit report with commands, output, pass/fail per claim, and any integrity concerns.
