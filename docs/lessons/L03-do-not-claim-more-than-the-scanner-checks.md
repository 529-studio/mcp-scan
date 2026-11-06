# L03: Do Not Claim More Than the Scanner Checks

## Context & Problem

A security tool is easy to oversell. "Scans your agents" sounds better than "checks ten config-level rules". If the README or landing page implies a full pentest, the first real config exposes the gap and the brand loses trust.

## Root Cause

Marketing copy is written from the roadmap, not from the code. The team describes the product it wants, not the product it ships.

## Solution

- State the current scope in the first screen: config-level, ten rules, alpha.
- Mark unbuilt features as roadmap or waitlist.
- Use "first pass", not "complete assessment".
- Include a "what it does not do" section.
- Re-read the copy on every release.

## Verification

- The landing page has an alpha label.
- The README has a Status section.
- The FAQ says it is not a pentest.
- A new user can tell what is available without asking.

## Rule References

- AGENTS.md Rule 5: evidence before assertions.
- AGENTS.md Rule 10: scope control.
