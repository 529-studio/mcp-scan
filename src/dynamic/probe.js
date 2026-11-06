import { diffSnapshots, snapshotDir } from "./canary.js";

const UNSAFE =
  /\b(delete|remove|drop|truncate|rm|unlink|wipe|exec|shell|spawn|bash|powershell|cmd|upload|write|save|append)\b/i;

export function selectTools(tools, { maxTools = 5, allowTools = [] } = {}) {
  const allowed = new Set(allowTools);
  const selected = [];

  for (const tool of Array.isArray(tools) ? tools : []) {
    if (!tool || typeof tool !== "object") continue;

    const text = `${tool.name || ""} ${tool.description || ""}`;
    const explicit = allowed.has(tool.name);
    const readOnly = tool.annotations?.readOnlyHint === true;

    if (!explicit && !readOnly) continue;
    if (!explicit && UNSAFE.test(text)) continue;

    selected.push({ tool, explicit });
    if (selected.length >= maxTools) break;
  }

  return selected;
}

export function buildInput(tool, canary) {
  const schema =
    tool.inputSchema && typeof tool.inputSchema === "object"
      ? tool.inputSchema
      : {};
  const properties =
    schema.properties && typeof schema.properties === "object"
      ? schema.properties
      : {};
  const keys = Array.isArray(schema.required)
    ? schema.required
    : Object.keys(properties);

  const input = {};

  for (const key of keys) {
    const definition = properties[key] || {};
    const lower = key.toLowerCase();
    const type = definition.type;

    if (type === "number" || type === "integer") {
      input[key] = 1;
    } else if (type === "boolean") {
      input[key] = false;
    } else if (type === "array") {
      input[key] = [];
    } else if (type === "object") {
      input[key] = {};
    } else if (/path|file|filename/.test(lower)) {
      input[key] = "host-file.txt";
    } else if (/url|uri|endpoint/.test(lower)) {
      input[key] = "http://127.0.0.1:9/canary";
    } else if (/command|cmd|script/.test(lower)) {
      input[key] = `echo ${canary.input}`;
    } else {
      input[key] = canary.input;
    }
  }

  if (Object.keys(input).length === 0) {
    input.input = canary.input;
  }

  return input;
}

export async function probeTools(
  client,
  tools,
  canary,
  { maxTools = 5, allowTools = [], timeoutMs = 10_000 } = {},
) {
  const selected = selectTools(tools, { maxTools, allowTools });
  const probes = [];

  for (const { tool, explicit } of selected) {
    const input = buildInput(tool, canary);
    const before = snapshotDir(canary.dir);
    const started = Date.now();

    let result;
    let error;

    try {
      result = await client.request(
        "tools/call",
        { name: tool.name, arguments: input },
        { timeoutMs },
      );
    } catch (caught) {
      error = caught.message;
    }

    const durationMs = Date.now() - started;
    const after = snapshotDir(canary.dir);
    const diff = diffSnapshots(before, after);

    probes.push({
      name: tool.name,
      explicit,
      input,
      durationMs,
      outputText: result ? JSON.stringify(result) : "",
      error,
      diff,
    });
  }

  return probes;
}
