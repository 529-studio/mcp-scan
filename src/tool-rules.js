/**
 * Tool-level rules for MCP `tools/list` output.
 *
 * Deterministic only. Every finding has evidence, impact, and a fix.
 */

const INSTRUCTION =
  /\b(ignore (all |any )?(previous|prior|above)|system prompt|do not tell|secretly|exfiltrate|send (it|this|the .*?)? ?to|before using this tool|read .*\.ssh)\b/i;

export const looksLikeInstruction = (text) =>
  INSTRUCTION.test(typeof text === "string" ? text : "");

const SECRET_PATH =
  /(~\/\.ssh|id_rsa|\.env\b|\.aws\/credentials|\.npmrc|\.netrc|credentials\.json)/i;

const DESTRUCTIVE = /\b(delete|remove|drop|truncate|rm|unlink|destroy|wipe)\b/i;
const SHELL = /\b(shell|exec|execute|spawn|bash|powershell|cmd|subprocess)\b/i;
const NETWORK =
  /\b(fetch|curl|webhook|upload|download|socket|egress)\b|\bhttps?[_ -]?request\b|\bapi[_ -]?request\b|https?:\/\//i;
const FILE_WRITE =
  /\b(write|save|append|chmod|chown|overwrite)\b|\b(create|move|rename|copy)[_ -]?file\b/i;

const HTML_COMMENT = /<!--[\s\S]*?-->/;
const ZERO_WIDTH = /[\u200B-\u200D\uFEFF]/;
const BASE64_LIKE = /[A-Za-z0-9+/]{60,}={0,2}/;

const DANGEROUS_FIELDS = new Set([
  "command",
  "cmd",
  "path",
  "file",
  "url",
  "uri",
  "query",
  "script",
  "code",
  "exec",
  "target",
]);

const textOf = (tool) =>
  `${tool.name || ""} ${tool.description || ""}`.replace(/\s+/g, " ").trim();

const excerpt = (tool) => {
  const text = textOf(tool);
  if (text.length === 0) return "(no name or description)";
  return text.length > 160 ? `${text.slice(0, 157)}...` : text;
};

const schemaIssue = (tool) => {
  const schema = tool.inputSchema;

  if (!schema || typeof schema !== "object") {
    return "tool has no input schema";
  }

  if (schema.additionalProperties === true) {
    return "schema allows arbitrary additional properties";
  }

  const properties =
    schema.properties && typeof schema.properties === "object"
      ? schema.properties
      : {};

  for (const [name, definition] of Object.entries(properties)) {
    if (!DANGEROUS_FIELDS.has(name.toLowerCase())) continue;
    if (!definition || typeof definition !== "object") continue;
    if (definition.enum || definition.pattern || definition.format) continue;
    return `field "${name}" is a free-form value`;
  }

  return null;
};

export const toolRules = [
  {
    id: "MCP-011",
    title: "Tool description contains instruction-like content",
    severity: "high",
    ref: "Prompt surface",
    check(tool) {
      if (!INSTRUCTION.test(textOf(tool))) return null;
      return {
        evidence: excerpt(tool),
        impact:
          "A tool description is read by the model. Instructions in it can override the user's intent or hide a second action.",
        fix: "Remove instructions from the description. Treat tool text as data, not policy.",
      };
    },
  },
  {
    id: "MCP-012",
    title: "Tool references a secret path",
    severity: "high",
    ref: "Secrets",
    check(tool) {
      if (!SECRET_PATH.test(textOf(tool))) return null;
      return {
        evidence: excerpt(tool),
        impact:
          "A tool that points at SSH keys, .env files, or cloud credentials invites exfiltration through a prompt injection.",
        fix: "Remove the path. Require a scoped secret reference from a secret manager.",
      };
    },
  },
  {
    id: "MCP-013",
    title: "Tool exposes a destructive verb",
    severity: "high",
    ref: "Least privilege",
    check(tool) {
      if (!DESTRUCTIVE.test(textOf(tool))) return null;
      return {
        evidence: excerpt(tool),
        impact:
          "A destructive tool can be triggered by a prompt injection or a mistaken agent plan.",
        fix: "Scope the tool to a specific object and require an explicit approval step.",
      };
    },
  },
  {
    id: "MCP-014",
    title: "Tool exposes a shell or exec primitive",
    severity: "high",
    ref: "Command injection",
    check(tool) {
      if (!SHELL.test(textOf(tool))) return null;
      return {
        evidence: excerpt(tool),
        impact:
          "A generic shell tool turns any injected text into a command execution surface.",
        fix: "Replace it with a narrow, typed tool that performs one operation.",
      };
    },
  },
  {
    id: "MCP-015",
    title: "Tool exposes a network or egress primitive",
    severity: "medium",
    ref: "Data flow",
    check(tool) {
      if (!NETWORK.test(textOf(tool))) return null;
      return {
        evidence: excerpt(tool),
        impact:
          "An unrestricted network tool can send data to an unexpected destination.",
        fix: "Add a destination allowlist and document the data that leaves the system.",
      };
    },
  },
  {
    id: "MCP-016",
    title: "Tool exposes a file-write primitive",
    severity: "medium",
    ref: "Least privilege",
    check(tool) {
      if (!FILE_WRITE.test(textOf(tool))) return null;
      return {
        evidence: excerpt(tool),
        impact:
          "A write tool lets an injected instruction modify files or configuration.",
        fix: "Default to read-only. Require approval for write tools and scope the path.",
      };
    },
  },
  {
    id: "MCP-017",
    title: "Schema leaves a command, path, or URL unconstrained",
    severity: "medium",
    ref: "Input validation",
    check(tool) {
      const issue = schemaIssue(tool);
      if (!issue) return null;
      return {
        evidence: `${tool.name || "(unnamed)"}: ${issue}`,
        impact:
          "A free-form command, path, or URL accepts arbitrary input and widens the injection surface.",
        fix: "Add an enum, a pattern, or an allowlist to the field.",
      };
    },
  },
  {
    id: "MCP-018",
    title: "Tool contains hidden or encoded content",
    severity: "high",
    ref: "Prompt surface",
    check(tool) {
      const text = textOf(tool);
      if (
        !HTML_COMMENT.test(text) &&
        !ZERO_WIDTH.test(text) &&
        !BASE64_LIKE.test(text)
      ) {
        return null;
      }
      return {
        evidence: excerpt(tool),
        impact:
          "Hidden text can carry instructions or data that a human reviewer will not see.",
        fix: "Remove the hidden content. Decode and review it before shipping.",
      };
    },
  },
  {
    id: "MCP-019",
    title: "readOnlyHint contradicts the tool",
    severity: "high",
    ref: "Annotation integrity",
    check(tool) {
      if (tool.annotations?.readOnlyHint !== true) return null;
      const text = textOf(tool);
      if (!DESTRUCTIVE.test(text) && !FILE_WRITE.test(text) && !SHELL.test(text)) {
        return null;
      }
      return {
        evidence: excerpt(tool),
        impact:
          "A false read-only annotation can convince a reviewer or a host to skip approval for a write or destructive action.",
        fix: "Fix the annotation or the tool. Never mark a write tool as read-only.",
      };
    },
  },
  {
    id: "MCP-020",
    title: "Tool has no usable description",
    severity: "low",
    ref: "Auditability",
    check(tool) {
      if (tool.description && tool.description.trim().length >= 10) return null;
      return {
        evidence: `${tool.name || "(unnamed)"}: missing or empty description`,
        impact:
          "A tool without a description is hard to review and easy to misuse.",
        fix: "Add a description that states what the tool does and what it does not do.",
      };
    },
  },
];

export function scanTools(serverName, tools) {
  const findings = [];

  for (const tool of Array.isArray(tools) ? tools : []) {
    if (!tool || typeof tool !== "object") continue;

    for (const rule of toolRules) {
      const result = rule.check(tool);
      if (!result) continue;

      findings.push({
        id: rule.id,
        title: rule.title,
        severity: rule.severity,
        ref: rule.ref,
        server: serverName,
        evidence: result.evidence,
        impact: result.impact,
        fix: result.fix,
      });
    }
  }

  return findings;
}
