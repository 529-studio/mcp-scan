# L05: Fake Secrets in Fixtures Can Trigger Push Protection

## Context & Problem

A test fixture needs a secret-looking value to exercise a rule. If the value uses a real provider prefix and the right length, GitHub push protection can block the push or a scanner can open an alert. The fixture is fake, but the pipeline cannot know that.

## Root Cause

The fixture is written to look realistic instead of obviously fake. The team optimizes for a realistic test, not for a safe repository.

## Solution

- Use values that are clearly fake: `example-token-not-real`, `example-api-key-not-real`.
- Avoid real prefixes and realistic lengths.
- Keep the rule test focused on the shape (key name, non-empty value), not on a real token format.
- If a realistic value is unavoidable, put it in a local-only file and never commit it.

## Verification

- `make public-safety` passes.
- The fixture is tracked and the test still fails before the fix.
- No push-protection alert is raised.

## Rule References

- AGENTS.md Rule 4: secrets and configuration.
- AGENTS.md Rule 5: evidence before assertions.
