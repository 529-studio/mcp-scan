import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const cli = path.join(root, "src", "cli.js");
const bad = path.join(root, "test", "fixtures", "bad.mcp.json");
const good = path.join(root, "test", "fixtures", "good.mcp.json");

const run = (args) =>
  spawnSync(process.execPath, [cli, ...args], {
    cwd: root,
    encoding: "utf8",
  });

const badResult = run([bad, "--format", "json", "--fail-on", "none"]);
assert.equal(badResult.status, 0, badResult.stderr);
const badJson = JSON.parse(badResult.stdout);
assert.equal(
  badJson.findings.length,
  10,
  `expected 10 findings, got ${badJson.findings.length}`,
);
assert.equal(badJson.summary.high >= 4, true);

const badDefault = run([bad, "--format", "json"]);
assert.equal(badDefault.status, 1, "default --fail-on high should exit 1");

const goodResult = run([good, "--format", "json"]);
assert.equal(goodResult.status, 0, goodResult.stderr);
const goodJson = JSON.parse(goodResult.stdout);
assert.equal(goodJson.findings.length, 0, "good fixture should be clean");

const sarifResult = run([bad, "--format", "sarif", "--fail-on", "none"]);
assert.equal(sarifResult.status, 0, sarifResult.stderr);
const sarif = JSON.parse(sarifResult.stdout);
assert.equal(sarif.version, "2.1.0");
assert.equal(sarif.runs[0].results.length, 10);

console.log("ok — 10 rules, JSON/SARIF, exit codes");
