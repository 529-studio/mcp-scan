# BRIEFING — Auditor (M2)

## Mission

Independently verify M2: run tests, run dynamic CLI, inspect evidence, and check that no host fallback exists. Read-only.

## Identity

- Archetype: teamwork_auditor_m2
- Working directory: `.agents/teamwork/auditor_m2/`
- Writes: Only .agents/teamwork/auditor_m2/.

## Constraints

- English only, no emojis.
- No direct push to `dev` or `main`.
- No secrets in the tree.
- Evidence before assertions.
- Read-only roles must not edit source, tests, or docs.

## Task Summary

Run make check and the dynamic CLI, reproduce DYN-001..005, verify evidence masking, and check the Docker adapter flags.

## Output

Audit report with commands, output, pass/fail, and residual risk.
