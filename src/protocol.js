import { spawnStdio } from "./targets/stdio.js";

export const PROTOCOL_VERSION = "2025-06-18";
export const CLIENT_INFO = { name: "mcp-scan", version: "0.2.0" };

/**
 * Connect to a local MCP server over stdio, initialize the session, and expose
 * tools/list with cursor pagination.
 */
export function connectStdio({
  command,
  args = [],
  env = {},
  cwd,
  timeoutMs = 10_000,
} = {}) {
  const client = spawnStdio({ command, args, env, cwd, timeoutMs });

  const initialize = async () => {
    const result = await client.request(
      "initialize",
      {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: {},
        clientInfo: CLIENT_INFO,
      },
      { timeoutMs },
    );

    client.notify("notifications/initialized", {});
    return result;
  };

  const listTools = async () => {
    const tools = [];
    let cursor;

    for (let page = 0; page < 20; page += 1) {
      const result = await client.request(
        "tools/list",
        cursor ? { cursor } : {},
        { timeoutMs },
      );

      if (Array.isArray(result?.tools)) {
        tools.push(...result.tools);
      }

      cursor = result?.nextCursor;
      if (!cursor) return tools;
    }

    throw new Error("tools/list exceeded 20 pages");
  };

  return {
    ...client,
    initialize,
    listTools,
  };
}
