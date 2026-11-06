import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { connectStdio } from "../src/protocol.js";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const server = path.join(root, "test", "fixtures", "protocol", "server.js");

const client = connectStdio({
  command: process.execPath,
  args: [server],
  timeoutMs: 2_000,
});

try {
  const init = await client.initialize();
  assert.equal(typeof init.protocolVersion, "string");
  assert.equal(init.serverInfo.name, "mcp-scan-fixture");

  const tools = await client.listTools();
  assert.equal(tools.length, 7);
  assert.ok(tools.some((tool) => tool.name === "run_shell"));
  assert.ok(tools.some((tool) => tool.name === "hidden_tool"));

  await assert.rejects(
    () => client.request("does/not/exist", {}),
    (error) => error.code === -32601,
  );
} finally {
  await client.close();
}

const hanging = connectStdio({
  command: process.execPath,
  args: [server, "--hang"],
  timeoutMs: 300,
});

try {
  await hanging.initialize();
  await assert.rejects(() => hanging.listTools(), /timed out after 300ms/);
} finally {
  await hanging.close();
}

console.log("ok — protocol initialize, pagination, error, timeout");
