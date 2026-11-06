# L11: Canary Evidence Must Mask Every Derived Value

## Context & Problem

The dynamic evidence bundle masked the three canary file values but still contained the canary input `MCP_SCAN_INPUT_<token>`. The test that checked for the token failed. The leak was not a credential, but it was a canary-derived value that should not appear verbatim in a report.

## Root Cause

Masking was implemented over the `values` object only. The input value was derived from the same token but stored outside that object, so it escaped the mask.

## Solution

- Treat every canary-derived string as sensitive in evidence: file values, input values, and error messages.
- Mask at the evidence boundary, not at each producer.
- Mask nested inputs, not just top-level output excerpts.
- Keep the raw value only in memory for detection; never serialize it.

## Verification

- The dynamic test asserts that `JSON.stringify(evidence)` does not contain the raw token.
- Evidence inputs show `MCP_SCAN_INPUT_…`, not the full value.
- The report still contains enough context to identify the probe.

## Rule References

- AGENTS.md Rule 4: secrets and configuration.
- AGENTS.md Rule 5: evidence before assertions.
