# L04: Apache-2.0 for an Open-Core Security Tool

## Context & Problem

The license decision is a business decision disguised as a legal one. A copyleft license can block enterprise adoption; a permissive license can let a competitor host the code. For a security scanner, distribution and trust matter more than blocking every clone.

## Root Cause

The team optimizes for protection before distribution. It picks AGPL or BSL to stop a hypothetical competitor, then loses the vendors and enterprises that would have embedded the tool.

## Solution

- Core CLI, rules, tests, and docs: Apache-2.0.
- Hosted dashboard, SSO, policy packs, runtime guard: commercial.
- Publish the boundary in `docs/license-decision.md`.
- Use DCO, not a CLA, until dual licensing is actually needed.
- Protect the name and badge with trademark rules.

## Verification

- `LICENSE` is Apache-2.0.
- `NOTICE` exists.
- The open-core boundary is documented.
- No feature that exists in the CLI is moved behind the commercial layer.

## Rule References

- AGENTS.md Rule 9: license and commercial boundary.
- AGENTS.md Rule 10: scope control.
