# BRIEFING — Auditor (M3)

## Mission

Independently verify M3: run tests, aggregate the sample, render the report, and check that no raw evidence appears. Read-only.

## Identity

- Archetype: teamwork_auditor_m3
- Working directory: `.agents/teamwork/auditor_m3/`
- Writes: Only .agents/teamwork/auditor_m3/.

## Constraints

- English only, no emojis.
- No direct push to `dev` or `main`.
- No raw evidence, server names, hostnames, or secrets in the report.
- Do not claim ecosystem representativeness.
- Read-only roles must not edit source, tests, or docs.

## Task Summary

Run make check and the report scripts, reproduce the sample counts, and check the published assets.

## Output

Audit report with commands, output, pass/fail, and residual risk.
