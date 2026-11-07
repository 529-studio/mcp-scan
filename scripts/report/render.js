#!/usr/bin/env node
/**
 * Render an aggregate JSON file as a draft Markdown or HTML report.
 *
 * Defaults to a draft header. Pass --publish only after the sample is final,
 * permissions are recorded, and a reviewer has checked every claim.
 */
import fs from "node:fs";

const HELP = `
mcp-scan report render

Usage:
  node scripts/report/render.js <aggregate.json> [--format md|html] [--out <file>] [--publish]

Defaults:
  format = md
  status = Draft — sample data only
`;

const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  console.log(HELP.trim());
  process.exit(0);
}

let input = null;
let format = "md";
let outFile = null;
let published = false;

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (arg === "--format") {
    format = args[index + 1];
    index += 1;
    continue;
  }
  if (arg === "--out") {
    outFile = args[index + 1];
    index += 1;
    continue;
  }
  if (arg === "--publish") {
    published = true;
    continue;
  }
  if (!arg.startsWith("-")) input = arg;
}

if (!input) {
  console.error("mcp-scan-report: an aggregate JSON file is required");
  process.exit(2);
}

if (!["md", "html"].includes(format)) {
  console.error(`mcp-scan-report: invalid --format: ${format}`);
  process.exit(2);
}

const data = JSON.parse(fs.readFileSync(input, "utf8"));
const status = published
  ? "Published"
  : "Draft — sample data only; not representative of the ecosystem";

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const severityRows = Object.entries(data.bySeverity || {})
  .filter(([, count]) => count > 0)
  .map(([severity, count]) => ({ severity, count }));

const ruleRows = (data.byRule || []).map((rule) => ({
  id: rule.id,
  title: rule.title,
  severity: rule.severity,
  count: rule.count,
}));

const markdown = `# State of MCP Security 2026

**Status:** ${status}
**Generated:** ${data.generatedAt}
**Sample:** ${data.sourceFiles} scan files, ${data.servers} servers, ${data.totalFindings} findings.

## Severity

| Severity | Count |
|---|---:|
${severityRows.map((row) => `| ${row.severity} | ${row.count} |`).join("\n")}

## Rules

| Rule | Title | Severity | Count |
|---|---|---|---:|
${ruleRows.map((row) => `| ${row.id} | ${row.title} | ${row.severity} | ${row.count} |`).join("\n")}

## Method

1. Run \`mcp-scan --format json\` on each permitted configuration.
2. Aggregate counts with \`scripts/report/aggregate.js\`.
3. Render this draft with \`scripts/report/render.js\`.
4. Review every number against the aggregate before publishing.

## Limitations

- This is a small sample, not a representative study.
- Static, live, and dynamic findings are not equivalent.
- Rules are heuristic and can produce false positives.
- No evidence, server names, or credentials are included.
`;

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>State of MCP Security 2026</title>
  <style>
    :root { --bg:#07090c; --text:#e6edf3; --muted:#8b949e; --line:#1c2430; --mint:#5eead4; }
    body { margin:0; background:var(--bg); color:var(--text); font:16px/1.6 ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
    main { max-width:960px; margin:0 auto; padding:48px 24px 80px; }
    h1 { font-size:clamp(32px,5vw,56px); letter-spacing:-0.04em; line-height:1.05; }
    h2 { margin-top:40px; font-size:24px; letter-spacing:-0.02em; }
    p, li { color:var(--muted); }
    table { width:100%; border-collapse:collapse; margin:16px 0 24px; }
    th, td { text-align:left; padding:9px 10px; border-bottom:1px solid var(--line); }
    th { color:var(--muted); font-weight:600; }
    td:last-child, th:last-child { text-align:right; }
    code { color:var(--mint); font-family:ui-monospace,SFMono-Regular,Menlo,monospace; }
    .status { display:inline-block; border:1px solid var(--line); border-radius:999px; padding:5px 11px; font-size:12px; color:var(--muted); }
  </style>
</head>
<body>
<main>
  <div class="status">${escapeHtml(status)}</div>
  <h1>State of MCP Security 2026</h1>
  <p>Generated ${escapeHtml(data.generatedAt)}. Sample: ${data.sourceFiles} scan files, ${data.servers} servers, ${data.totalFindings} findings.</p>

  <h2>Severity</h2>
  <table><thead><tr><th>Severity</th><th>Count</th></tr></thead><tbody>
  ${severityRows.map((row) => `<tr><td>${escapeHtml(row.severity)}</td><td>${row.count}</td></tr>`).join("\n")}
  </tbody></table>

  <h2>Rules</h2>
  <table><thead><tr><th>Rule</th><th>Title</th><th>Severity</th><th>Count</th></tr></thead><tbody>
  ${ruleRows.map((row) => `<tr><td>${escapeHtml(row.id)}</td><td>${escapeHtml(row.title)}</td><td>${escapeHtml(row.severity)}</td><td>${row.count}</td></tr>`).join("\n")}
  </tbody></table>

  <h2>Method</h2>
  <ol>
    <li>Run <code>mcp-scan --format json</code> on each permitted configuration.</li>
    <li>Aggregate counts with <code>scripts/report/aggregate.js</code>.</li>
    <li>Render this draft with <code>scripts/report/render.js</code>.</li>
    <li>Review every number against the aggregate before publishing.</li>
  </ol>

  <h2>Limitations</h2>
  <ul>
    <li>This is a small sample, not a representative study.</li>
    <li>Static, live, and dynamic findings are not equivalent.</li>
    <li>Rules are heuristic and can produce false positives.</li>
    <li>No evidence, server names, or credentials are included.</li>
  </ul>
</main>
</body>
</html>
`;

const output = format === "html" ? html : markdown;

if (outFile) {
  fs.writeFileSync(outFile, output);
} else {
  process.stdout.write(output);
}
