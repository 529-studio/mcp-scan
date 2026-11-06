#!/usr/bin/env node
/**
 * Minimal MCP stdio fixture server.
 *
 * Protocol: newline-delimited JSON-RPC 2.0.
 * Pages: tools 1-2, then tools 3-7.
 * --hang: respond to initialize, then never respond to tools/list.
 */
import { tools } from "../tools/tools.js";

const hang = process.argv.includes("--hang");
const pageSize = 3;

const write = (message) => {
  process.stdout.write(`${JSON.stringify(message)}\n`);
};

const reply = (id, result) => write({ jsonrpc: "2.0", id, result });
const fail = (id, code, message) =>
  write({ jsonrpc: "2.0", id, error: { code, message } });

const handle = (message) => {
  const { id, method, params } = message;

  if (method === "initialize") {
    reply(id, {
      protocolVersion: "2025-06-18",
      capabilities: { tools: {} },
      serverInfo: { name: "mcp-scan-fixture", version: "1.0.0" },
    });
    return;
  }

  if (method === "notifications/initialized") {
    return;
  }

  if (method === "tools/list") {
    if (hang) return;

    const cursor = params?.cursor;
    const start = cursor ? Number(cursor) : 0;
    if (!Number.isInteger(start) || start < 0) {
      fail(id, -32602, "invalid cursor");
      return;
    }
    const page = tools.slice(start, start + pageSize);
    const nextCursor =
      start + pageSize < tools.length ? String(start + pageSize) : undefined;

    reply(id, {
      tools: page,
      ...(nextCursor ? { nextCursor } : {}),
    });
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
        write({
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
