import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * Create a disposable canary directory.
 *
 * The values are random, non-credential strings. They are evidence, not secrets.
 */
export function createCanaryDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-scan-canary-"));
  const token = crypto.randomBytes(8).toString("hex");

  const files = {
    host: path.join(dir, "host-file.txt"),
    env: path.join(dir, ".env"),
    key: path.join(dir, "id_rsa"),
    out: path.join(dir, "out"),
  };

  const values = {
    host: `MCP_SCAN_CANARY_HOST_${token}`,
    secret: `CANARY_SECRET_${token}`,
    key: `MCP_SCAN_CANARY_KEY_${token}`,
  };

  fs.chmodSync(dir, 0o755);
  fs.writeFileSync(files.host, `${values.host}\n`, { mode: 0o644 });
  fs.writeFileSync(files.env, `${values.secret}\n`, { mode: 0o644 });
  fs.writeFileSync(files.key, `${values.key}\n`, { mode: 0o644 });
  fs.mkdirSync(files.out, { recursive: true, mode: 0o777 });
  fs.chmodSync(files.out, 0o777);

  return {
    dir,
    token,
    files,
    values,
    input: `MCP_SCAN_INPUT_${token}`,
  };
}

export function cleanupCanaryDir(dir) {
  if (!dir) return;
  fs.rmSync(dir, { recursive: true, force: true });
}

const hashFile = (file) =>
  crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");

const walk = (dir, base, map) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(base, full);

    if (entry.isDirectory()) {
      walk(full, base, map);
      continue;
    }

    if (entry.isFile()) {
      map.set(rel, hashFile(full));
    }
  }
};

export function snapshotDir(dir) {
  const map = new Map();
  walk(dir, dir, map);
  return map;
}

export function diffSnapshots(before, after) {
  const added = [];
  const modified = [];
  const deleted = [];

  for (const [rel, hash] of after) {
    if (!before.has(rel)) {
      added.push(rel);
    } else if (before.get(rel) !== hash) {
      modified.push(rel);
    }
  }

  for (const rel of before.keys()) {
    if (!after.has(rel)) deleted.push(rel);
  }

  return { added, modified, deleted };
}

export function findCanaryHits(text, canary) {
  const value = typeof text === "string" ? text : "";
  const hits = [];

  if (value.includes(canary.values.host)) hits.push("host");
  if (value.includes(canary.values.secret)) hits.push("secret");
  if (value.includes(canary.values.key)) hits.push("key");

  return hits;
}

export function maskCanary(text, canary) {
  let output = typeof text === "string" ? text : "";

  for (const value of Object.values(canary.values)) {
    output = output
      .split(value)
      .join(`${value.slice(0, 18)}…`);
  }

  if (canary.input) {
    output = output
      .split(canary.input)
      .join(`${canary.input.slice(0, 18)}…`);
  }

  return output;
}
