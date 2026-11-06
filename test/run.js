import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "./protocol.test.js";
import "./tool-rules.test.js";
import "./dynamic.test.js";
import "./report.test.js";

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
const dynamicServer = path.join(
  root,
  "test",
  "fixtures",
  "dynamic",
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

const dynamic = run([
  "--stdio",
  process.execPath,
  "--arg",
  dynamicServer,
  "--dynamic",
  "--sandbox",
  "process",
  "--allow-tool",
  "write_outside",
  "--max-tools",
  "6",
  "--timeout",
  "300",
  "--format",
  "json",
  "--fail-on",
  "none",
]);
assert.equal(dynamic.status, 0, dynamic.stderr);
const dynamicJson = JSON.parse(dynamic.stdout);

for (const id of ["DYN-001", "DYN-002", "DYN-003", "DYN-004", "DYN-005"]) {
  assert.ok(
    dynamicJson.findings.some((finding) => finding.id === id),
    `dynamic scan should include ${id}`,
  );
}

const evidencePath = path.join(
  os.tmpdir(),
  `mcp-scan-evidence-${process.pid}.json`,
);
const dynamicEvidence = run([
  "--stdio",
  process.execPath,
  "--arg",
  dynamicServer,
  "--dynamic",
  "--sandbox",
  "process",
  "--allow-tool",
  "write_outside",
  "--max-tools",
  "6",
  "--timeout",
  "300",
  "--format",
  "json",
  "--fail-on",
  "none",
  "--evidence",
  evidencePath,
]);
assert.equal(dynamicEvidence.status, 0, dynamicEvidence.stderr);
assert.ok(fs.existsSync(evidencePath));
const evidence = JSON.parse(fs.readFileSync(evidencePath, "utf8"));
assert.equal(evidence.mode, "dynamic");
assert.equal(evidence.sandbox, "process");
assert.equal(evidence.network, false);
fs.rmSync(evidencePath, { force: true });

const dynamicNoLive = run(["--dynamic", "--format", "json"]);
assert.equal(dynamicNoLive.status, 2);
assert.match(dynamicNoLive.stderr, /--dynamic requires/);

const dynamicNetwork = run([
  "--dynamic",
  "--stdio",
  process.execPath,
  "--arg",
  dynamicServer,
  "--sandbox",
  "process",
  "--allow-network",
  "--format",
  "json",
]);
assert.equal(dynamicNetwork.status, 2);
assert.match(dynamicNetwork.stderr, /--allow-network is not supported/);

const dynamicMax = run([
  "--dynamic",
  "--stdio",
  process.execPath,
  "--arg",
  dynamicServer,
  "--sandbox",
  "process",
  "--max-tools",
  "0",
  "--format",
  "json",
]);
assert.equal(dynamicMax.status, 2);
assert.match(dynamicMax.stderr, /--max-tools/);

console.log("ok — config, tool, protocol, dynamic, live CLI");
