/**
 * mcp-scan rules
 *
 * Design principles:
 * - Deterministic first. No LLM required to produce a finding.
 * - Every finding has evidence and a fix.
 * - Rules are small, testable, and versioned.
 */

export const SEVERITIES = ["info", "low", "medium", "high", "critical"];

export const severityRank = (severity) => {
  const index = SEVERITIES.indexOf(severity);
  return index === -1 ? 0 : index;
};

export const mask = (value) => {
  if (typeof value !== "string" || value.length === 0) return "";
  if (value.length <= 8) return "********";
  return `${value.slice(0, 4)}…${value.slice(-4)}`;
};

const baseCommand = (command) =>
  String(command || "")
    .split(/[\\/]/)
    .pop()
    .toLowerCase();

const getArgs = (server) =>
  Array.isArray(server.args) ? server.args.map((arg) => String(arg)) : [];

const getUrl = (server) => server.url || server.httpUrl || server.endpoint;

const isLocalUrl = (url) => {
  if (typeof url !== "string") return false;
  try {
    const parsed = new URL(url);
    return ["localhost", "127.0.0.1", "::1", "[::1]"].includes(parsed.hostname);
  } catch {
    return /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])/i.test(url);
  }
};

const SECRET_KEY =
  /(api[_-]?key|token|secret|password|passwd|credential|private[_-]?key|access[_-]?key|client[_-]?secret)/i;

const DEBUG_FLAGS = new Set([
  "--debug",
  "--inspect",
  "--inspect-brk",
  "--enable-debug",
  "--dev",
]);

const WRITE_FLAGS = new Set([
  "--allow-write",
  "--write",
  "--enable-write",
  "--dangerously-allow-write",
  "--allow-write-all",
]);

const SHELLS = new Set([
  "sh",
  "bash",
  "zsh",
  "fish",
  "cmd",
  "cmd.exe",
  "powershell",
  "powershell.exe",
  "pwsh",
]);

const findPackageArg = (args) => {
  const packageFlag = args.findIndex((arg) => arg === "-p" || arg === "--package");
  if (packageFlag !== -1 && args[packageFlag + 1]) {
    return { arg: args[packageFlag + 1], pinned: isPinned(args[packageFlag + 1]) };
  }

  for (const arg of args) {
    if (arg.startsWith("-")) continue;
    return { arg, pinned: isPinned(arg) };
  }

  return null;
};

const isPinned = (arg) => {
  if (typeof arg !== "string" || arg.length === 0) return false;
  if (arg.startsWith("@")) {
    return arg.indexOf("@", 1) !== -1;
  }
  return arg.indexOf("@") > 0;
};

const hasValue = (value) => {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
};

const hasAuth = (server) =>
  hasValue(server.headers) ||
  hasValue(server.auth) ||
  hasValue(server.oauth) ||
  hasValue(server.token) ||
  hasValue(server.apiKey);

export const rules = [
  {
    id: "MCP-001",
    title: "Remote MCP endpoint uses plain HTTP",
    severity: "high",
    ref: "Transport security",
    check(server) {
      const url = getUrl(server);
      if (typeof url !== "string" || !/^http:\/\//i.test(url)) return null;
      const local = isLocalUrl(url);
      return {
        severity: local ? "medium" : "high",
        evidence: url,
        impact:
          "Tokens, tool calls, and tool outputs can be intercepted or modified in transit.",
        fix: "Use HTTPS for remote MCP servers, or use a local stdio transport. Never send credentials over plain HTTP.",
      };
    },
  },
  {
    id: "MCP-002",
    title: "npx/bunx package is not pinned to a version",
    severity: "medium",
    ref: "Supply chain",
    check(server) {
      const command = baseCommand(server.command);
      if (!["npx", "bunx", "pnpx"].includes(command)) return null;

      const pkg = findPackageArg(getArgs(server));
      if (!pkg) return null;
      if (pkg.pinned && !pkg.arg.endsWith("@latest")) return null;

      return {
        evidence: `${server.command} ${getArgs(server).join(" ")}`,
        impact:
          "A floating package can change after review (rug pull) or resolve to a compromised release.",
        fix: "Pin an exact version (for example @scope/server@1.2.3) and review updates deliberately.",
      };
    },
  },
  {
    id: "MCP-003",
    title: "Secret-like environment variable is set inline",
    severity: "high",
    ref: "Secrets",
    check(server) {
      const env = server.env && typeof server.env === "object" ? server.env : {};
      const hits = Object.entries(env).filter(([key, value]) => {
        if (!SECRET_KEY.test(key)) return false;
        if (!hasValue(value)) return false;
        if (typeof value === "string" && /^\$\{?[A-Z0-9_]+\}?$/.test(value)) return false;
        return true;
      });

      if (hits.length === 0) return null;

      return {
        evidence: hits
          .map(([key, value]) => `${key}=${mask(String(value))}`)
          .join(", "),
        impact:
          "Secrets in config files are easy to leak through git, backups, logs, screenshots, or shared dotfiles.",
        fix: "Load secrets from a secret manager or environment at runtime; keep only a reference in the config.",
      };
    },
  },
  {
    id: "MCP-004",
    title: "Debug or inspector flag is enabled",
    severity: "medium",
    ref: "Runtime exposure",
    check(server) {
      const args = getArgs(server);
      const flag = args.find((arg) => DEBUG_FLAGS.has(arg));
      if (!flag) return null;
      return {
        evidence: `${server.command} ${args.join(" ")}`,
        impact:
          "Debug endpoints and inspector protocols can expose internal state or allow code execution.",
        fix: "Disable debug/inspector flags in production configs; enable them only in an isolated dev environment.",
      };
    },
  },
  {
    id: "MCP-005",
    title: "MCP server is launched through a shell",
    severity: "high",
    ref: "Command injection",
    check(server) {
      const command = baseCommand(server.command);
      const args = getArgs(server);
      const shellFlag = args.some((arg) => arg === "-c" || arg === "/c");
      if (!SHELLS.has(command) || !shellFlag) return null;
      return {
        evidence: `${server.command} ${args.join(" ")}`,
        impact:
          "Shell interpolation turns tool input into a command-injection surface and makes behavior hard to audit.",
        fix: "Launch the server binary directly with an argument array; avoid sh -c / cmd /c wrappers.",
      };
    },
  },
  {
    id: "MCP-006",
    title: "Server is granted a broad filesystem root",
    severity: "medium",
    ref: "Least privilege",
    check(server) {
      const args = getArgs(server);
      const roots = new Set(["/", "~", "/*", "~/*", "C:\\", "C:/", "$HOME", "%USERPROFILE%"]);
      const hit = args.find((arg) => roots.has(arg));
      if (!hit) return null;
      return {
        evidence: `${server.command} ${args.join(" ")}`,
        impact:
          "A broad root lets a compromised or prompt-injected tool read or modify unrelated files.",
        fix: "Scope the server to the smallest directory it needs; prefer an explicit project path.",
      };
    },
  },
  {
    id: "MCP-007",
    title: "Server binds to a wildcard host or origin",
    severity: "medium",
    ref: "Network exposure",
    check(server) {
      const args = getArgs(server);
      const hostFlags = new Set(["--host", "--bind", "--cors", "--allow-origin", "--origin"]);
      let wildcard = false;

      for (let i = 0; i < args.length; i += 1) {
        const arg = args[i];
        if (arg === "0.0.0.0" || arg === "::" || arg === "*") wildcard = true;
        if (hostFlags.has(arg) && ["0.0.0.0", "::", "*"].includes(args[i + 1])) {
          wildcard = true;
        }
      }

      if (!wildcard) return null;
      return {
        evidence: `${server.command} ${args.join(" ")}`,
        impact:
          "A wildcard bind exposes the MCP server to untrusted networks or browser origins.",
        fix: "Bind to 127.0.0.1 or a specific interface; allow only trusted origins.",
      };
    },
  },
  {
    id: "MCP-008",
    title: "Docker image is unpinned or uses :latest",
    severity: "medium",
    ref: "Supply chain",
    check(server) {
      const command = baseCommand(server.command);
      if (command !== "docker" && command !== "podman") return null;

      const args = getArgs(server);
      const runIndex = args.indexOf("run");
      if (runIndex === -1) return null;

      const image = args.slice(runIndex + 1).find((arg) => !arg.startsWith("-"));
      if (!image) return null;

      const lastSegment = image.split("/").pop() || "";
      const pinned = lastSegment.includes(":") || image.includes("@sha256:");
      if (pinned && !lastSegment.endsWith(":latest")) return null;

      return {
        evidence: `${server.command} ${args.join(" ")}`,
        impact:
          "A floating image tag can change without review and pull a compromised or incompatible build.",
        fix: "Pin a digest (image@sha256:...) or an immutable version tag.",
      };
    },
  },
  {
    id: "MCP-009",
    title: "Remote MCP endpoint has no visible authentication",
    severity: "medium",
    ref: "Authentication",
    check(server) {
      const url = getUrl(server);
      if (typeof url !== "string" || !/^https?:\/\//i.test(url)) return null;
      if (isLocalUrl(url)) return null;
      if (hasAuth(server)) return null;

      return {
        evidence: url,
        impact:
          "An unauthenticated remote endpoint can be called by anyone who knows the URL, including through a malicious agent.",
        fix: "Add OAuth, a scoped bearer token, or mTLS; document the auth flow in the server manifest.",
      };
    },
  },
  {
    id: "MCP-010",
    title: "Server is explicitly granted write access",
    severity: "high",
    ref: "Least privilege",
    check(server) {
      const args = getArgs(server);
      if (args.includes("--read-only")) return null;
      const flag = args.find((arg) => WRITE_FLAGS.has(arg));
      if (!flag) return null;
      return {
        evidence: `${server.command} ${args.join(" ")}`,
        impact:
          "Write access lets a prompt-injected agent modify files, data, or external systems.",
        fix: "Default to read-only; require an explicit, reviewed approval for write tools.",
      };
    },
  },
];

export function scanServer(name, server) {
  const findings = [];

  for (const rule of rules) {
    let result = null;
    try {
      result = rule.check(server);
    } catch (error) {
      result = {
        severity: "info",
        evidence: `rule error: ${error.message}`,
        impact: "Rule could not evaluate this server.",
        fix: "Open an issue with the server manifest.",
      };
    }
    if (!result) continue;

    findings.push({
      id: rule.id,
      title: rule.title,
      severity: result.severity || rule.severity,
      ref: rule.ref,
      server: name,
      evidence: result.evidence || "",
      impact: result.impact || "",
      fix: result.fix || "",
    });
  }

  return findings;
}
