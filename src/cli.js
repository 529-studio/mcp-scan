#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { rules, scanServer, severityRank, SEVERITIES } from "./rules.js";
import { connectStdio } from "./protocol.js";
import { scanTools } from "./tool-rules.js";
import { createSandbox, SANDBOX_MODES } from "./sandbox/runner.js";
import { cleanupCanaryDir, createCanaryDir } from "./dynamic/canary.js";
import { probeTools } from "./dynamic/probe.js";
import { DYNAMIC_RULES, evaluateDynamic } from "./dynamic/rules.js";
import { buildEvidence, writeEvidence } from "./dynamic/evidence.js";

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
      --live <server>  Connect to a stdio server from the config and scan tools
      --stdio <cmd>    Connect to an arbitrary stdio server command
      --arg <value>    Argument for --stdio (repeatable)
      --timeout <ms>   Handshake and request timeout (default: 10000)
      --dynamic        Run dynamic probes in a sandbox (requires --live/--stdio)
      --sandbox <mode> docker | process | none (default: docker)
      --sandbox-image <image>  Docker image (default: node:20-alpine)
      --allow-network  Allow network in the sandbox (never with process)
      --max-tools <n>  Maximum tools to probe (default: 5)
      --allow-tool <name>  Probe this tool even if it is not read-only
      --evidence <path>  Write a JSON evidence bundle
  -q, --quiet          Only print the summary.
  -h, --help           Show this help.
  -v, --version        Show the version.

Examples:
  mcp-scan .
  mcp-scan ./mcp.json --format json
  mcp-scan . --format sarif --fail-on medium
  mcp-scan . --live filesystem
  mcp-scan --stdio node --arg test/fixtures/protocol/server.js
  mcp-scan . --live filesystem --dynamic --sandbox docker
  mcp-scan --stdio node --arg "$PWD/test/fixtures/dynamic/server.js" --dynamic --sandbox process
  npx github:529-studio/mcp-scan .

  Live mode runs the server command you provide. Only scan servers you trust.
  Dynamic mode executes tools inside the sandbox. Use it only on servers you own.

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
    live: null,
    stdio: null,
    stdioArgs: [],
    timeoutMs: 10_000,
    dynamic: false,
    sandbox: "docker",
    sandboxImage: "node:20-alpine",
    allowNetwork: false,
    maxTools: 5,
    allowTools: [],
    evidence: null,
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
    if (arg === "--live") {
      options.live = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg.startsWith("--live=")) {
      options.live = arg.split("=")[1];
      continue;
    }
    if (arg === "--stdio") {
      options.stdio = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg.startsWith("--stdio=")) {
      options.stdio = arg.split("=")[1];
      continue;
    }
    if (arg === "--arg") {
      options.stdioArgs.push(argv[index + 1]);
      index += 1;
      continue;
    }
    if (arg.startsWith("--arg=")) {
      options.stdioArgs.push(arg.split("=")[1]);
      continue;
    }
    if (arg === "--timeout") {
      options.timeoutMs = Number(argv[index + 1]);
      index += 1;
      continue;
    }
    if (arg.startsWith("--timeout=")) {
      options.timeoutMs = Number(arg.split("=")[1]);
      continue;
    }
    if (arg === "--dynamic") {
      options.dynamic = true;
      continue;
    }
    if (arg === "--sandbox") {
      options.sandbox = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg.startsWith("--sandbox=")) {
      options.sandbox = arg.split("=")[1];
      continue;
    }
    if (arg === "--sandbox-image") {
      options.sandboxImage = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg.startsWith("--sandbox-image=")) {
      options.sandboxImage = arg.split("=")[1];
      continue;
    }
    if (arg === "--allow-network") {
      options.allowNetwork = true;
      continue;
    }
    if (arg === "--max-tools") {
      options.maxTools = Number(argv[index + 1]);
      index += 1;
      continue;
    }
    if (arg.startsWith("--max-tools=")) {
      options.maxTools = Number(arg.split("=")[1]);
      continue;
    }
    if (arg === "--allow-tool") {
      options.allowTools.push(argv[index + 1]);
      index += 1;
      continue;
    }
    if (arg.startsWith("--allow-tool=")) {
      options.allowTools.push(arg.split("=")[1]);
      continue;
    }
    if (arg === "--evidence") {
      options.evidence = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg.startsWith("--evidence=")) {
      options.evidence = arg.split("=")[1];
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
  if (options.live !== null && !options.live) {
    throw new Error("--live requires a server name");
  }
  if (options.stdio !== null && !options.stdio) {
    throw new Error("--stdio requires a command");
  }
  if (options.live && options.stdio) {
    throw new Error("--live and --stdio are mutually exclusive");
  }
  if (options.stdio && options.stdioArgs.some((value) => !value)) {
    throw new Error("--arg requires a value");
  }
  if (options.stdioArgs.length > 0 && !options.stdio) {
    throw new Error("--arg requires --stdio");
  }
  if (!Number.isInteger(options.timeoutMs) || options.timeoutMs <= 0) {
    throw new Error("--timeout must be a positive integer");
  }
  if (options.dynamic && !options.live && !options.stdio) {
    throw new Error("--dynamic requires --live or --stdio");
  }
  if (!SANDBOX_MODES.includes(options.sandbox)) {
    throw new Error(`Invalid --sandbox: ${options.sandbox}`);
  }
  if (!options.sandboxImage) {
    throw new Error("--sandbox-image requires an image name");
  }
  if (
    !Number.isInteger(options.maxTools) ||
    options.maxTools < 1 ||
    options.maxTools > 20
  ) {
    throw new Error("--max-tools must be an integer between 1 and 20");
  }
  if (options.allowNetwork && ["process", "none"].includes(options.sandbox)) {
    throw new Error("--allow-network is not supported with the process sandbox");
  }
  if (options.allowTools.some((name) => !name)) {
    throw new Error("--allow-tool requires a tool name");
  }
  if (options.allowTools.length > 0 && !options.dynamic) {
    throw new Error("--allow-tool requires --dynamic");
  }
  if (options.evidence === undefined) {
    throw new Error("--evidence requires a path");
  }
  if (options.evidence && !options.dynamic) {
    throw new Error("--evidence requires --dynamic");
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

const artifactUri = (target) =>
  target.startsWith("stdio:") || target.includes("#")
    ? target
    : path.relative(process.cwd(), target) || target;

const buildSarif = ({ target, findings }) => {
  const ruleMetadata = [...rules, ...DYNAMIC_RULES].map((rule) => ({
    id: rule.id,
    name: rule.title,
    shortDescription: { text: rule.title },
    fullDescription: { text: `${rule.ref}: ${rule.title}` },
    helpUri: `https://github.com/529-studio/mcp-scan/blob/dev/docs/rules.md#${rule.id.toLowerCase()}`,
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
            location: { uri: artifactUri(target) },
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
                  uri: artifactUri(target),
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

const sortFindings = (findings) => {
  findings.sort(
    (a, b) =>
      severityRank(b.severity) - severityRank(a.severity) ||
      a.id.localeCompare(b.id) ||
      a.server.localeCompare(b.server),
  );
};

const scanConfig = (options) => {
  const configPath = findConfig(options.target);
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  const servers = extractServers(config);

  const findings = Object.entries(servers).flatMap(([name, server]) =>
    scanServer(name, server && typeof server === "object" ? server : {}),
  );

  sortFindings(findings);

  return {
    target: configPath,
    servers: Object.keys(servers).length,
    findings,
  };
};

const scanLive = async (options) => {
  let target;
  let serverName;
  let serverConfig;

  if (options.stdio) {
    serverName = "stdio";
    serverConfig = { command: options.stdio, args: options.stdioArgs };
    target = `stdio:${options.stdio}`;
  } else {
    const configPath = findConfig(options.target);
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    const servers = extractServers(config);

    serverConfig = servers[options.live];

    if (!serverConfig || typeof serverConfig !== "object") {
      throw new Error(`live server not found: ${options.live}`);
    }
    if (!serverConfig.command) {
      throw new Error(
        `live HTTP scan is not implemented for "${options.live}"; use the config scan`,
      );
    }

    serverName = options.live;
    target = `${configPath}#${options.live}`;
  }

  const env =
    serverConfig.env && typeof serverConfig.env === "object"
      ? serverConfig.env
      : {};
  const args = Array.isArray(serverConfig.args) ? serverConfig.args : [];

  let client;
  let canary;
  let tools = [];
  let dynamicFindings = [];

  try {
    if (options.dynamic) {
      canary = createCanaryDir();

      if (options.sandbox === "process" || options.sandbox === "none") {
        console.error(
          "mcp-scan: warning: dynamic mode is not isolated; use --sandbox docker for untrusted servers",
        );
      }

      const sandbox = createSandbox({
        mode: options.sandbox,
        canaryDir: canary.dir,
        allowNetwork: options.allowNetwork,
        image: options.sandboxImage,
        timeoutMs: options.timeoutMs,
        env,
      });

      client = sandbox.connect({
        command: serverConfig.command,
        args,
        env,
      });

      await client.initialize();
      tools = await client.listTools();

      const probes = await probeTools(client, tools, canary, {
        maxTools: options.maxTools,
        allowTools: options.allowTools,
        timeoutMs: options.timeoutMs,
      });

      dynamicFindings = evaluateDynamic(serverName, probes, canary);

      if (options.evidence) {
        writeEvidence(
          options.evidence,
          buildEvidence({
            server: serverName,
            sandbox: options.sandbox,
            allowNetwork: options.allowNetwork,
            probes,
            findings: dynamicFindings,
            canary,
          }),
        );
      }
    } else {
      client = connectStdio({
        command: serverConfig.command,
        args,
        env,
        cwd: process.cwd(),
        timeoutMs: options.timeoutMs,
      });

      await client.initialize();
      tools = await client.listTools();
    }
  } finally {
    if (client) await client.close();
    cleanupCanaryDir(canary?.dir);
  }

  const findings = [
    ...scanServer(serverName, serverConfig),
    ...scanTools(serverName, tools),
    ...dynamicFindings,
  ];
  sortFindings(findings);

  return {
    target,
    servers: 1,
    findings,
  };
};

const printResult = (result, options) => {
  if (options.format === "json") {
    console.log(
      JSON.stringify(
        {
          tool: "mcp-scan",
          version: VERSION,
          target: result.target,
          servers: result.servers,
          findings: result.findings,
          summary: countBySeverity(result.findings),
        },
        null,
        2,
      ),
    );
    return;
  }

  if (options.format === "sarif") {
    console.log(
      JSON.stringify(
        buildSarif({ target: result.target, findings: result.findings }),
        null,
        2,
      ),
    );
    return;
  }

  printText({
    target: result.target,
    servers: result.servers,
    findings: result.findings,
    quiet: options.quiet,
  });
};

const main = async () => {
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

  let result;
  try {
    result =
      options.live || options.stdio
        ? await scanLive(options)
        : scanConfig(options);
  } catch (error) {
    console.error(`mcp-scan: ${error.message}`);
    process.exitCode = 2;
    return;
  }

  printResult(result, options);

  if (shouldFail(result.findings, options.failOn)) {
    process.exitCode = 1;
  }
};

main().catch((error) => {
  console.error(`mcp-scan: ${error.message}`);
  process.exitCode = 2;
});
