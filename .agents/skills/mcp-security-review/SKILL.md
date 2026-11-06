---
name: mcp-security-review
description: >-
  Use this skill to review an MCP server configuration, tool manifest, or
  mcp-scan finding before treating it as complete. It checks transport,
  permissions, secrets, supply chain, prompt surface, and evidence quality.
---

# MCP Security Review

Review an MCP configuration or finding set. Report violations clearly; do not silently fix them.

## When to activate

- Before merging a change to `src/rules.js` or a fixture.
- Before publishing a scan report or vendor badge.
- When a user asks "is this MCP server safe?".

## Checklist

### 1. Transport

- Is the endpoint HTTPS, or stdio?
- Is the host bound to `127.0.0.1` or a specific interface?
- Is CORS/origin restricted?

### 2. Authentication

- Does a remote endpoint have OAuth, a scoped token, or mTLS?
- Is the token passed through from the client? If so, why?
- Does the token expire?

### 3. Permissions

- Does the server need filesystem access? How broad?
- Does it need shell, network, or write access?
- Is read-only the default?
- Is there a human approval step for write actions?

### 4. Secrets

- Are secrets inline in the config?
- Are they masked in the report?
- Are they loaded from a secret manager at runtime?

### 5. Supply chain

- Is the package pinned to an exact version?
- Is the Docker image pinned by digest or immutable tag?
- Is the source/provenance verified?

### 6. Prompt surface

- Does the tool description contain instructions, secret paths, or unusual verbs?
- Does the description match the schema?
- Do resources or outputs contain untrusted text?

### 7. Evidence

- Does every finding include target, evidence, impact, and fix?
- Is the severity justified?
- Is the false-positive risk documented?

## Output format

```text
## MCP Security Review

### Passed
- ...

### Findings
1. [severity] [rule] — [target]
   Evidence: ...
   Impact: ...
   Fix: ...
   Confidence: high/medium/low

### Needs review
- ...
```

## Guardrails

- Do not exploit a finding.
- Do not run a remote server unless you have permission.
- Mask secrets.
- If uncertain, say so.
