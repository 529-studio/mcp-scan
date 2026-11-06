# L14: Aggregate Reports Must Strip Evidence at the Boundary

## Context & Problem

The report pipeline needs counts, not raw findings. A naive aggregation that copies each finding into a report can carry evidence, server names, hostnames, and secrets into a public document.

The first test also caught a smaller version of the same problem: the word “evidence” appeared in a notes string, which made a blunt `includes("evidence")` assertion fail. The lesson is broader than the test: the report boundary must be explicit.

## Root Cause

The report tool consumed the scanner's finding objects directly instead of projecting them onto a small, safe schema.

## Solution

- Aggregate only an allowlist: `id`, `title`, `severity`, `count`.
- Never copy `evidence`, `server`, `impact`, or `fix` into the aggregate.
- Keep notes explicit: “No evidence, server names, or credentials are included.”
- Test for the absence of the `"evidence"` key, not the absence of the word.
- Render only from the aggregate, never from raw scan files.

## Verification

- `test/report.test.js` asserts no `"evidence"` key and no `redacted` value.
- The draft report is generated from the aggregate.
- A reviewer checks the published report for hostnames and secrets.

## Rule References

- AGENTS.md Rule 4: secrets and configuration.
- AGENTS.md Rule 5: evidence before assertions.
