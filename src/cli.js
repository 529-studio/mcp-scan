#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { rules, scanServer, severityRank, SEVERITIES } from "./rules.js";

const pkg = JSON.parse(
  fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"),
);
const VERSION = pkg.version;

const CONFIG_CANDIDATES = [
  "mcp.json",
  ".mcp.json",
  "mcp-config.json",
  "claude_desktop_config.json",
  ".cursor/mcp.json",
  ".vscode/mcp.json",
  "config/mcp.json",
];

const HELP = `
mcp-scan ${VERSION} — security scanner for MCP servers and AI agents

Usage:
  mcp-scan [path] [options]

  path                 File or directory. Defaults to the current directory.
                       If a directory, looks for mcp.json, .mcp.json,
                       claude_desktop_config.json, .cursor/mcp.json, etc.

Options:
  -f, --format <fmt>   text | json | sarif        (default: text)
      --fail-on <sev>  none | low | medium | high | critical
                       Exit 1 when a finding at or above this severity exists.
                       (default: high)
  -q, --quiet          Only print the summary.
  -h, --help           Show this help.
  -v, --version        Show the version.

Examples:
  mcp-scan .
  mcp-scan ./mcp.json --format json
  mcp-scan . --format sarif --fail-on medium
  npx github:529-studio/mcp-scan .

Exit codes:
  0  no findings at or above --fail-on
  1  findings at or above --fail-on
  2  usage or config error
`;

const parseArgs = (argv) => {
  const options = {
    target: ".",
    format: "text",
    failOn: "high",
    quiet: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "-h" || arg === "--help") {
      options.help = true;
      continue;
    }
    if (arg === "-v" || arg === "--version") {
      options.version = true;
      continue;
    }
    if (arg === "-f" || arg === "--format") {
      options.format = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg.startsWith("--format=")) {
      options.format = arg.split("=")[1];
      continue;
    }
    if (arg === "--fail-on") {
      options.failOn = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg.startsWith("--fail-on=")) {
      options.failOn = arg.split("=")[1];
      continue;
    }
    if (arg === "-q" || arg === "--quiet") {
      options.quiet = true;
      continue;
    }
    if (arg.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`);
    }
    options.target = arg;
  }

  if (!["text", "json", "sarif"].includes(options.format)) {
    throw new Error(`Invalid --format: ${options.format}`);
  }
  if (!["none", ...SEVERITIES].includes(options.failOn)) {
    throw new Error(`Invalid --fail-on: ${options.failOn}`);
  }

  return options;
};

const findConfig = (target) => {
  const resolved = path.resolve(target);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Path does not exist: ${resolved}`);
  }

  const stat = fs.statSync(resolved);
  if (stat.isFile()) return resolved;

  for (const candidate of CONFIG_CANDIDATES) {
    const file = path.join(resolved, candidate);
    if (fs.existsSync(file)) return file;
  }

  throw new Error(
    `No MCP config found in ${resolved}. Looked for: ${CONFIG_CANDIDATES.join(", ")}`,
  );
};

const extractServers = (config) => {
  const candidates = [
    config.mcpServers,
    config.servers,
    config.mcp && config.mcp.servers,
  ];

  for (const candidate of candidates) {
    if (candidate && typeof candidate === "object" && !Array.isArray(candidate)) {
      return candidate;
    }
  }

  if (config.command || config.url || config.httpUrl) {
    return { default: config };
  }

  throw new Error(
    "No MCP servers found. Expected an mcpServers/servers object or a single server config.",
  );
};

const countBySeverity = (findings) => {
  const counts = Object.fromEntries(SEVERITIES.map((severity) => [severity, 0]));
  for (const finding of findings) {
    counts[finding.severity] = (counts[finding.severity] || 0) + 1;
  }
  return counts;
};

const shouldFail = (findings, failOn) => {
  if (failOn === "none") return false;
  const threshold = severityRank(failOn);
  return findings.some((finding) => severityRank(finding.severity) >= threshold);
};

const colorize = (text, color, enabled) =>
  enabled ? `\x1b[${color}m${text}\x1b[0m` : text;

const severityColor = {
  critical: 31,
  high: 31,
  medium: 33,
  low: 36,
  info: 90,
};

const printText = ({ target, servers, findings, quiet }) => {
  const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
  const counts = countBySeverity(findings);

  if (!quiet) {
    console.log("");
    console.log(colorize(`mcp-scan ${VERSION}`, 1, useColor));
    console.log(`Target: ${target}`);
    console.log(`Servers: ${servers}`);
    console.log("");

    if (findings.length === 0) {
      console.log(colorize("No findings. Nice.", 32, useColor));
    }

    for (const finding of findings) {
      const label = finding.severity.toUpperCase().padEnd(8);
      const color = severityColor[finding.severity] || 0;
      console.log(
        `${colorize(`[${label}]`, color, useColor)} ${colorize(finding.id, 1, useColor)}  ${finding.title}`,
      );
      console.log(`  server:   ${finding.server}`);
      console.log(`  evidence: ${finding.evidence}`);
      console.log(`  impact:   ${finding.impact}`);
      console.log(`  fix:      ${finding.fix}`);
      console.log("");
    }
  }

  const summary = SEVERITIES.filter((severity) => counts[severity] > 0)
    .map((severity) => `${counts[severity]} ${severity}`)
    .join(", ");

  console.log(
    `${findings.length} finding${findings.length === 1 ? "" : "s"}${
      summary ? ` (${summary})` : ""
    } in ${servers} server${servers === 1 ? "" : "s"}.`,
  );
};

const buildSarif = ({ target, findings }) => {
  const ruleMetadata = rules.map((rule) => ({
    id: rule.id,
    name: rule.title,
    shortDescription: { text: rule.title },
    fullDescription: { text: `${rule.ref}: ${rule.title}` },
    helpUri: `https://github.com/529-studio/mcp-scan/blob/main/docs/rules.md#${rule.id.toLowerCase()}`,
    properties: { tags: ["security", "mcp", rule.ref] },
  }));

  const levelFor = (severity) => {
    if (severity === "critical" || severity === "high") return "error";
    if (severity === "medium") return "warning";
    return "note";
  };

  return {
    $schema: "https://json.schemastore.org/sarif-2.1.0.json",
    version: "2.1.0",
    runs: [
      {
        tool: {
          driver: {
            name: "mcp-scan",
            version: VERSION,
            informationUri: "https://github.com/529-studio/mcp-scan",
            rules: ruleMetadata,
          },
        },
        artifacts: [
          {
            location: { uri: path.relative(process.cwd(), target) || target },
          },
        ],
        results: findings.map((finding) => ({
          ruleId: finding.id,
          level: levelFor(finding.severity),
          message: {
            text: `${finding.title} (server: ${finding.server}) — ${finding.fix}`,
          },
          locations: [
            {
              physicalLocation: {
                artifactLocation: {
                  uri: path.relative(process.cwd(), target) || target,
                },
                region: { startLine: 1, startColumn: 1 },
              },
              logicalLocations: [{ name: finding.server }],
            },
          ],
          properties: {
            severity: finding.severity,
            evidence: finding.evidence,
            impact: finding.impact,
          },
        })),
      },
    ],
  };
};

const main = () => {
  let options;

  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`mcp-scan: ${error.message}`);
    console.error("Run `mcp-scan --help` for usage.");
    process.exitCode = 2;
    return;
  }

  if (options.help) {
    console.log(HELP.trim());
    return;
  }
  if (options.version) {
    console.log(VERSION);
    return;
  }

  let configPath;
  let config;
  let servers;

  try {
    configPath = findConfig(options.target);
    config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    servers = extractServers(config);
  } catch (error) {
    console.error(`mcp-scan: ${error.message}`);
    process.exitCode = 2;
    return;
  }

  const findings = Object.entries(servers).flatMap(([name, server]) =>
    scanServer(name, server && typeof server === "object" ? server : {}),
  );

  findings.sort(
    (a, b) =>
      severityRank(b.severity) - severityRank(a.severity) ||
      a.id.localeCompare(b.id) ||
      a.server.localeCompare(b.server),
  );

  const serverCount = Object.keys(servers).length;

  if (options.format === "json") {
    console.log(
      JSON.stringify(
        {
          tool: "mcp-scan",
          version: VERSION,
          target: configPath,
          servers: serverCount,
          findings,
          summary: countBySeverity(findings),
        },
        null,
        2,
      ),
    );
  } else if (options.format === "sarif") {
    console.log(
      JSON.stringify(buildSarif({ target: configPath, findings }), null, 2),
    );
  } else {
    printText({
      target: configPath,
      servers: serverCount,
      findings,
      quiet: options.quiet,
    });
  }

  if (shouldFail(findings, options.failOn)) {
    process.exitCode = 1;
  }
};

main();
