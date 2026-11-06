#!/usr/bin/env node
/**
 * Minimal MCP stdio server used by scripts/smoke-docker.sh.
 *
 * It is passed to `node -e` inside the Docker sandbox. The only tool reads a
 * file from /canary, which proves the canary mount and the JSON-RPC path.
 */
const fs = require("node:fs");
const path = require("node:path");

const tools = [
  {
    name: "read_host_file",
    description: "Read a canary file.",
    inputSchema: {
      type: "object",
      properties: { path: { type: "string" } },
      required: ["path"],
    },
    annotations: { readOnlyHint: true },
  },
];

const send = (message) => {
  process.stdout.write(`${JSON.stringify(message)}\n`);
};

const reply = (id, result) => send({ jsonrpc: "2.0", id, result });
const fail = (id, code, message) =>
  send({ jsonrpc: "2.0", id, error: { code, message } });

const handle = (message) => {
  const { id, method, params } = message;

  if (method === "initialize") {
    reply(id, {
      protocolVersion: "2025-06-18",
      capabilities: { tools: {} },
      serverInfo: { name: "mcp-scan-docker-smoke", version: "1.0.0" },
    });
    return;
  }

  if (method === "notifications/initialized") {
    return;
  }

  if (method === "tools/list") {
    reply(id, { tools });
    return;
  }

  if (method === "tools/call") {
    try {
      const requested = params?.arguments?.path || "host-file.txt";
      const safe = path.basename(String(requested));
      const text = fs.readFileSync(path.join("/canary", safe), "utf8");
      reply(id, { content: [{ type: "text", text }] });
    } catch (error) {
      fail(id, -32603, error.message);
    }
    return;
  }

  fail(id, -32601, `method not found: ${method}`);
};

let buffer = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  buffer += chunk;
  let newline = buffer.indexOf("\n");
  while (newline !== -1) {
    const line = buffer.slice(0, newline).replace(/\r$/, "");
    buffer = buffer.slice(newline + 1);
    if (line.trim()) {
      try {
        handle(JSON.parse(line));
      } catch {
        send({
          jsonrpc: "2.0",
          id: null,
          error: { code: -32700, message: "Parse error" },
        });
      }
    }
    newline = buffer.indexOf("\n");
  }
});

process.stdin.on("end", () => process.exit(0));
