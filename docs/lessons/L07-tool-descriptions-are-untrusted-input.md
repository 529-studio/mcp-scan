# L07: Tool Descriptions Are Untrusted Input

## Context & Problem

An MCP tool description is text the model reads. A malicious server can put an instruction in the description: read a file, send a token, ignore the user. The model may treat it as policy. The config scanner sees a string; the agent sees an instruction.

## Root Cause

The description is treated as documentation, not as input. The threat model focuses on code execution and forgets the prompt surface.

## Solution

- Treat tool descriptions, resources, and outputs as untrusted text.
- Flag instruction-like content, secret paths, and unusual verbs.
- Compare the description with the schema; a mismatch is a signal.
- Prefer servers with a clear, minimal description and a narrow schema.
- Add dynamic canary tests in the sandbox milestone.

## Verification

- A fixture with an instruction in the description produces a finding.
- The rule is documented and tested.
- The report explains the impact in plain language.

## Rule References

- AGENTS.md Rule 6: rule quality.
- AGENTS.md Rule 10: scope control.
