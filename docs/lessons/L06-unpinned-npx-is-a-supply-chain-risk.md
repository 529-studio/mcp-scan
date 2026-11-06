# L06: Unpinned npx Is a Supply-Chain Risk

## Context & Problem

`npx -y @scope/server` resolves whatever is latest at install time. A reviewed server can change after review, or a compromised release can be published under the same name. The config looks stable; the dependency is not.

## Root Cause

Convenience wins over reproducibility. The team pins application dependencies but forgets the MCP server that runs with filesystem or network access.

## Solution

- Pin an exact version: `@scope/server@1.2.3`.
- Pin Docker images by digest or immutable tag.
- Review updates deliberately.
- Run `mcp-scan` in CI to catch a floating package.

## Verification

- `MCP-002` and `MCP-008` are clean on the repo config.
- The lockfile or config contains an exact version.
- An update PR shows the diff and the test result.

## Rule References

- AGENTS.md Rule 4: secrets and configuration.
- AGENTS.md Rule 6: rule quality.
