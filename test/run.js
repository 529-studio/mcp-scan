import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "./protocol.test.js";
import "./tool-rules.test.js";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const cli = path.join(root, "src", "cli.js");
const bad = path.join(root, "test", "fixtures", "bad.mcp.json");
const good = path.join(root, "test", "fixtures", "good.mcp.json");
const liveDir = path.join(root, "test", "fixtures", "protocol", "live");
const protocolServer = path.join(
  root,
  "test",
  "fixtures",
  "protocol",
  "server.js",
);

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

const live = run([
  "--stdio",
  process.execPath,
  "--arg",
  protocolServer,
  "--format",
  "json",
  "--fail-on",
  "none",
]);
assert.equal(live.status, 0, live.stderr);
const liveJson = JSON.parse(live.stdout);
assert.ok(liveJson.findings.length >= 10, "live scan should produce findings");

for (const id of [
  "MCP-011",
  "MCP-012",
  "MCP-013",
  "MCP-014",
  "MCP-015",
  "MCP-016",
  "MCP-017",
  "MCP-018",
  "MCP-019",
  "MCP-020",
]) {
  assert.ok(
    liveJson.findings.some((finding) => finding.id === id),
    `live scan should include ${id}`,
  );
}

const liveConfig = run([
  liveDir,
  "--live",
  "fixture",
  "--format",
  "json",
  "--fail-on",
  "none",
]);
assert.equal(liveConfig.status, 0, liveConfig.stderr);
const liveConfigJson = JSON.parse(liveConfig.stdout);
assert.ok(liveConfigJson.findings.length >= 10);

const missingLive = run([liveDir, "--live", "missing", "--format", "json"]);
assert.equal(missingLive.status, 2);
assert.match(missingLive.stderr, /live server not found/);

const badTimeout = run(["--timeout", "0", "--format", "json"]);
assert.equal(badTimeout.status, 2);
assert.match(badTimeout.stderr, /--timeout must be a positive integer/);

const hanging = run([
  "--stdio",
  process.execPath,
  "--arg",
  protocolServer,
  "--arg",
  "--hang",
  "--timeout",
  "300",
  "--format",
  "json",
]);
assert.equal(hanging.status, 2);
assert.match(hanging.stderr, /timed out after 300ms/);

console.log("ok — 10 config rules, 10 tool rules, protocol, live CLI");
