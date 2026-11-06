import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const aggregate = path.join(root, "scripts", "report", "aggregate.js");
const render = path.join(root, "scripts", "report", "render.js");
const fixtures = path.join(root, "test", "fixtures", "report");

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-scan-report-"));
const aggregateFile = path.join(tmp, "aggregate.json");
const markdownFile = path.join(tmp, "report.md");
const htmlFile = path.join(tmp, "report.html");

try {
  execFileSync(
    process.execPath,
    [aggregate, fixtures, "--out", aggregateFile],
    { cwd: root, encoding: "utf8" },
  );

  const report = JSON.parse(fs.readFileSync(aggregateFile, "utf8"));

  assert.equal(report.totalFindings, 8);
  assert.equal(report.servers, 4);
  assert.equal(report.sourceFiles, 2);
  assert.equal(report.bySeverity.high, 5);
  assert.equal(report.bySeverity.medium, 3);
  assert.equal(report.byRule.length, 7);
  assert.equal(JSON.stringify(report).includes("redacted"), false);
  assert.equal(JSON.stringify(report).includes('"evidence"'), false);

  execFileSync(
    process.execPath,
    [render, aggregateFile, "--format", "md", "--out", markdownFile],
    { cwd: root, encoding: "utf8" },
  );
  const markdown = fs.readFileSync(markdownFile, "utf8");
  assert.match(markdown, /Draft/);
  assert.match(markdown, /MCP-003/);
  assert.match(markdown, /not representative/);
  assert.equal(markdown.includes("redacted"), false);

  execFileSync(
    process.execPath,
    [render, aggregateFile, "--format", "html", "--out", htmlFile],
    { cwd: root, encoding: "utf8" },
  );
  const html = fs.readFileSync(htmlFile, "utf8");
  assert.match(html, /<!doctype html>/);
  assert.match(html, /MCP-003/);
  assert.equal(html.includes("redacted"), false);
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

console.log("ok — report aggregate and render, no evidence leakage");
