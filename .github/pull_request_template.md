Close #<issue-number>

<!--
PR linking: use "Close #<issue-number>" at the top.
Do not use "Addresses #..." or "Implement #...".
-->

## Summary & Rationale

Brief 2-3 sentence explanation of what this PR does and why.

## Key Changes

- 

## Verification & Operational Proof

Paste real command output, test results, and the CLI scan output. Tests alone are not enough.

```bash
make check
node src/cli.js test/fixtures/bad.mcp.json --fail-on none
```

## Checklist

- [ ] Sound solutions and root-cause verification over shortcuts (Rule 2)
- [ ] Explicit time estimate provided before work started (Rule 3)
- [ ] End-to-end reproduction or a real config scan verified (Rule 4)
- [ ] Zero hardcoded secrets or credentials (Rule 8)
- [ ] English-only code, comments, logs, and docs; zero emojis
- [ ] Every new rule has a fixture, a docs entry, and a test
- [ ] `README.md` and affected `docs/*` updated
- [ ] Lesson recorded if the work exposed a trap
- [ ] `make docs-lint` and `make public-safety` pass
