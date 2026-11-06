# MCP setup

This repository uses MCP servers for development and documentation. Do not commit `.mcp.json`; it is gitignored. Use `.mcp.example.jsonc` as a template and keep secrets in a secret manager or environment.

---

## 1. Files

| File | Committed | Purpose |
|---|---|---|
| `.mcp.example.jsonc` | Yes | Template with placeholders |
| `.mcp.json` | No | Local config with real values |
| `docs/MCP_SETUP.md` | Yes | This guide |

---

## 2. Recommended servers

### Filesystem

Read and write files inside the repo.

```jsonc
{
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-filesystem@<pinned-version>", "${workspaceFolder}"]
}
```

### GitHub

Read issues, pull requests, and repository metadata.

```jsonc
{
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-github@<pinned-version>"],
  "env": {
    "GITHUB_PERSONAL_ACCESS_TOKEN": "<from-secret-manager>"
  }
}
```

### Playwright

Browser automation for the landing page and docs.

```jsonc
{
  "command": "npx",
  "args": ["-y", "@playwright/mcp@<pinned-version>", "--headless", "--isolated"]
}
```

### Outline

Read and write docs at `docs.529studio.site`.

```jsonc
{
  "command": "npx",
  "args": ["-y", "outline-mcp-server@<pinned-version>", "outline-mcp-server-stdio"],
  "env": {
    "OUTLINE_API_KEY": "<from-secret-manager>",
    "OUTLINE_API_URL": "https://docs.529studio.site/api"
  }
}
```

### Fetch

Fetch public URLs for research.

```jsonc
{
  "command": "uvx",
  "args": ["mcp-server-fetch@<pinned-version>"]
}
```

---

## 3. Rules

1. Pin every package version. `npx -y @scope/server` is a supply-chain risk and `mcp-scan` will flag it.
2. Keep tokens in `.mcp.json` or the environment, never in the repo.
3. Scope filesystem servers to the repo path, not `/`.
4. Prefer stdio for local servers; use HTTPS for remote.
5. Run `node src/cli.js .` after changing the config.

---

## 4. Wiring

### OpenCode

Add the servers to your OpenCode MCP config, or copy `.mcp.example.jsonc` to `.mcp.json` and point your client at it.

### Claude Code / Claude Desktop

Claude Desktop uses `claude_desktop_config.json`. `mcp-scan` discovers it automatically if you pass the directory.

### Cursor / VS Code

Use `.cursor/mcp.json` or `.vscode/mcp.json`. Both are in the discovery list.

---

## 5. Verification

```bash
node src/cli.js . --fail-on high
node src/cli.js . --format sarif --fail-on none > mcp-scan.sarif
```

If the config contains an unpinned `npx` package, expect `MCP-002`. Fix it before merging.
