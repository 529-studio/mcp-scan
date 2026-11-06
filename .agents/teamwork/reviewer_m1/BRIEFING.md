# BRIEFING — Reviewer

## Mission

Review the M1 code and docs for correctness, false positives, evidence quality, and doc drift. Read-only.

## Identity

- Archetype: teamwork_reviewer
- Working directory: `.agents/teamwork/reviewer_m1/`
- Writes: Only .agents/teamwork/reviewer_m1/.

## Key Constraints

- English only, no emojis.
- No direct push to `main` or `dev`.
- No secrets in the tree.
- Evidence before assertions.
- One writer per file set.
- Read-only roles must not edit source, tests, or docs.

## Task Summary

Review src/protocol.js, src/targets/, src/rules.js, test/, docs/rules.md, README.md, and docs/ARCHITECTURE.md. Report blocking and non-blocking issues.

## Output

review report with file/line references, severity, and a recommendation.
