import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  cleanupCanaryDir,
  createCanaryDir,
  diffSnapshots,
  snapshotDir,
} from "../src/dynamic/canary.js";
import {
  buildInput,
  probeTools,
  selectTools,
} from "../src/dynamic/probe.js";
import { evaluateDynamic } from "../src/dynamic/rules.js";
import { buildEvidence } from "../src/dynamic/evidence.js";
import { buildDockerArgs } from "../src/sandbox/docker.js";
import { createProcessSandbox } from "../src/sandbox/process.js";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const server = path.join(root, "test", "fixtures", "dynamic", "server.js");

const canary = createCanaryDir();
const before = snapshotDir(canary.dir);

try {
  assert.ok(before.has("host-file.txt"));
  assert.ok(before.has(".env"));
  assert.ok(before.has("id_rsa"));

  const toolList = [
    {
      name: "read_file",
      description: "Read a file.",
      inputSchema: {
        type: "object",
        properties: { path: { type: "string" } },
        required: ["path"],
      },
      annotations: { readOnlyHint: true },
    },
    {
      name: "write_file",
      description: "Write a file.",
      inputSchema: { type: "object", properties: {} },
      annotations: { readOnlyHint: true },
    },
  ];

  const selected = selectTools(toolList, { maxTools: 5 });
  assert.deepEqual(
    selected.map((entry) => entry.tool.name),
    ["read_file"],
  );

  const allowed = selectTools(toolList, {
    maxTools: 5,
    allowTools: ["write_file"],
  });
  assert.equal(allowed.length, 2);

  const input = buildInput(toolList[0], canary);
  assert.equal(input.path, "host-file.txt");

  const dockerArgs = buildDockerArgs({
    canaryDir: canary.dir,
    command: "node",
    args: ["server.js"],
    env: { TOKEN: "placeholder" },
  });
  for (const flag of [
    "--network",
    "none",
    "--read-only",
    "--cap-drop",
    "ALL",
    "--security-opt",
    "no-new-privileges",
    "--user",
    "65534:65534",
  ]) {
    assert.ok(dockerArgs.includes(flag), `missing docker flag ${flag}`);
  }

  const sandbox = createProcessSandbox({
    cwd: canary.dir,
    timeoutMs: 300,
  });
  const client = sandbox.connect({
    command: process.execPath,
    args: [server],
  });

  try {
    await client.initialize();
    const tools = await client.listTools();
    const probes = await probeTools(client, tools, canary, {
      maxTools: 6,
      allowTools: ["write_outside"],
      timeoutMs: 300,
    });
    const findings = evaluateDynamic("fixture", probes, canary);
    const ids = new Set(findings.map((finding) => finding.id));

    for (const id of ["DYN-001", "DYN-002", "DYN-003", "DYN-004", "DYN-005"]) {
      assert.ok(ids.has(id), `expected ${id} to fire`);
    }

    const evidence = buildEvidence({
      server: "fixture",
      sandbox: "process",
      allowNetwork: false,
      probes,
      findings,
      canary,
    });
    assert.equal(JSON.stringify(evidence).includes(canary.token), false);
  } finally {
    await client.close();
  }

  const cleanSandbox = createProcessSandbox({
    cwd: canary.dir,
    timeoutMs: 300,
  });
  const cleanClient = cleanSandbox.connect({
    command: process.execPath,
    args: [server],
  });

  try {
    await cleanClient.initialize();
    const tools = await cleanClient.listTools();
    const probes = await probeTools(cleanClient, tools, canary, {
      maxTools: 1,
      timeoutMs: 300,
    });
    const findings = evaluateDynamic("fixture", probes, canary);
    assert.equal(findings.length, 0, "clean tool should produce no dynamic findings");
  } finally {
    await cleanClient.close();
  }

  const after = snapshotDir(canary.dir);
  const diff = diffSnapshots(before, after);
  assert.ok(diff.added.includes("escape.txt"));
} finally {
  cleanupCanaryDir(canary.dir);
}

console.log("ok — dynamic canary, selection, Docker flags, DYN-001..005");
