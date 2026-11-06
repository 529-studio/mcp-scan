#!/usr/bin/env node
/**
 * Aggregate mcp-scan JSON outputs into a report-safe summary.
 *
 * Input: one or more JSON files from `mcp-scan --format json`.
 * Output: counts by rule and severity. No evidence, server names, or secrets.
 */
import fs from "node:fs";
import path from "node:path";

const HELP = `
mcp-scan report aggregate

Usage:
  node scripts/report/aggregate.js <file-or-dir> [--out <file>]

Output:
  JSON with sourceFiles, servers, totalFindings, bySeverity, and byRule.
  Evidence, server names, and secrets are intentionally omitted.
`;

const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  console.log(HELP.trim());
  process.exit(0);
}

let target = ".";
let outFile = null;

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (arg === "--out") {
    outFile = args[index + 1];
    index += 1;
    continue;
  }
  if (!arg.startsWith("-")) target = arg;
}

const listFiles = (input) => {
  const resolved = path.resolve(input);
  const stat = fs.statSync(resolved);

  if (stat.isFile()) return [resolved];

  return fs
    .readdirSync(resolved)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => path.join(resolved, file));
};

const files = listFiles(target);

if (files.length === 0) {
  console.error(`mcp-scan-report: no JSON files in ${target}`);
  process.exit(2);
}

const severityRank = {
  info: 0,
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

const bySeverity = {
  info: 0,
  low: 0,
  medium: 0,
  high: 0,
  critical: 0,
};

const byRule = new Map();
let servers = 0;
let totalFindings = 0;
let sourceFiles = 0;

for (const file of files) {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    console.error(`mcp-scan-report: skip ${file}: ${error.message}`);
    continue;
  }

  if (!Array.isArray(data.findings)) {
    console.error(`mcp-scan-report: skip ${file}: no findings array`);
    continue;
  }

  sourceFiles += 1;
  servers += Number.isInteger(data.servers) ? data.servers : 1;

  for (const finding of data.findings) {
    if (!finding || typeof finding.id !== "string") continue;

    totalFindings += 1;
    const severity = finding.severity || "info";
    bySeverity[severity] = (bySeverity[severity] || 0) + 1;

    const current = byRule.get(finding.id);
    if (!current) {
      byRule.set(finding.id, {
        id: finding.id,
        title: finding.title || "",
        severity,
        count: 1,
      });
      continue;
    }

    current.count += 1;
    if (
      (severityRank[severity] || 0) >
      (severityRank[current.severity] || 0)
    ) {
      current.severity = severity;
    }
  }
}

const report = {
  tool: "mcp-scan-report",
  generatedAt: new Date().toISOString(),
  sourceFiles,
  servers,
  totalFindings,
  bySeverity,
  byRule: [...byRule.values()].sort(
    (a, b) => b.count - a.count || a.id.localeCompare(b.id),
  ),
  notes: [
    "Aggregated counts only.",
    "No evidence, server names, or credentials are included.",
  ],
};

const output = `${JSON.stringify(report, null, 2)}\n`;

if (outFile) {
  fs.writeFileSync(outFile, output);
} else {
  process.stdout.write(output);
}
