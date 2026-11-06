# mcp-scan rules

Rules are deterministic checks against an MCP server declaration (usually a `mcp.json` / `claude_desktop_config.json` entry). Each rule has an ID, a severity, a reference, a fixture, and a fix.

Rules are not a substitute for a pentest. They are a fast first pass that catches common, high-signal mistakes.

---

## MCP-001 — Remote endpoint uses plain HTTP

**Severity:** High (Medium for localhost)

**Why:** HTTP traffic can be read or modified by anyone on the path. MCP tool calls often carry credentials, customer data, or write actions.

**Example:**

```json
{ "url": "http://mcp.example.com" }
```

**Fix:** Use HTTPS for remote servers. Use stdio for local servers. Never send credentials over plain HTTP.

---

## MCP-002 — npx/bunx package is not pinned

**Severity:** Medium

**Why:** A floating package can change after review. This is the MCP version of a supply-chain rug pull.

**Example:**

```json
{ "command": "npx", "args": ["-y", "@scope/server"] }
```

**Fix:** Pin an exact version:

```json
{ "command": "npx", "args": ["-y", "@scope/server@1.2.3"] }
```

---

## MCP-003 — Secret-like env var is set inline

**Severity:** High

**Why:** Config files get committed, backed up, screenshotted, and shared. An inline secret is one copy away from a leak.

**Example:**

```json
{ "env": { "API_KEY": "sk-live-..." } }
```

**Fix:** Load secrets from a secret manager or the runtime environment. Keep only a reference in the config.

---

## MCP-004 — Debug/inspector flag is enabled

**Severity:** Medium

**Why:** Debug endpoints and inspector protocols can expose internal state or allow code execution.

**Example:**

```json
{ "args": ["server.js", "--inspect"] }
```

**Fix:** Disable debug/inspector flags in production. Enable them only in an isolated dev environment.

---

## MCP-005 — Server is launched through a shell

**Severity:** High

**Why:** Shell interpolation turns tool input into a command-injection surface and makes behavior hard to audit.

**Example:**

```json
{ "command": "bash", "args": ["-c", "node server.js"] }
```

**Fix:** Launch the binary directly with an argument array.

---

## MCP-006 — Broad filesystem root

**Severity:** Medium

**Why:** A broad root lets a compromised or prompt-injected tool read or modify unrelated files.

**Example:**

```json
{ "args": ["server-filesystem", "/"] }
```

**Fix:** Scope the server to the smallest directory it needs.

---

## MCP-007 — Wildcard host or origin

**Severity:** Medium

**Why:** A wildcard bind exposes the server to untrusted networks or browser origins.

**Example:**

```json
{ "args": ["server.js", "--host", "0.0.0.0"] }
```

**Fix:** Bind to `127.0.0.1` or a specific interface. Allow only trusted origins.

---

## MCP-008 — Docker image is unpinned or `:latest`

**Severity:** Medium

**Why:** A floating image tag can change without review and pull a compromised or incompatible build.

**Example:**

```json
{ "command": "docker", "args": ["run", "-i", "mcp/server"] }
```

**Fix:** Pin a digest or an immutable version tag:

```json
{ "command": "docker", "args": ["run", "-i", "mcp/server@sha256:..."] }
```

---

## MCP-009 — Remote endpoint has no visible authentication

**Severity:** Medium

**Why:** An unauthenticated remote endpoint can be called by anyone who knows the URL, including through a malicious agent.

**Example:**

```json
{ "url": "https://mcp.example.com" }
```

**Fix:** Add OAuth, a scoped bearer token, or mTLS. Document the auth flow.

---

## MCP-010 — Explicit write access

**Severity:** High

**Why:** Write access lets a prompt-injected agent modify files, data, or external systems.

**Example:**

```json
{ "args": ["server.js", "--allow-write"] }
```

**Fix:** Default to read-only. Require an explicit, reviewed approval for write tools.

---

## Adding a rule

1. Add a `check(server)` function in `src/rules.js`.
2. Add a fixture in `test/fixtures/`.
3. Add the rule to `docs/rules.md`.
4. Run `node test/run.js`.

A good rule has:

- a clear, narrow trigger;
- evidence that a human can verify;
- an actionable fix;
- a low false-positive rate;
- a reference (spec, CVE, vendor advisory, or threat model).
