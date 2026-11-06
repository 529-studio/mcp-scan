import fs from "node:fs";
import { findCanaryHits, maskCanary } from "./canary.js";

const excerpt = (text, canary) => {
  const safe = maskCanary(text || "", canary);
  return safe.length > 500 ? `${safe.slice(0, 497)}...` : safe;
};

const maskInput = (input, canary) =>
  Object.fromEntries(
    Object.entries(input || {}).map(([key, value]) => [
      key,
      typeof value === "string" ? maskCanary(value, canary) : value,
    ]),
  );

export function buildEvidence({
  server,
  sandbox,
  allowNetwork,
  probes,
  findings,
  canary,
}) {
  return {
    tool: "mcp-scan",
    mode: "dynamic",
    sandbox,
    network: Boolean(allowNetwork),
    server,
    canary: {
      dir: "redacted",
      token: "redacted",
      files: ["host-file.txt", ".env", "id_rsa", "out/"],
    },
    tools: probes.map((probe) => ({
      name: probe.name,
      explicit: probe.explicit,
      input: maskInput(probe.input, canary),
      durationMs: probe.durationMs,
      outputExcerpt: excerpt(probe.outputText, canary),
      canaryHits: findCanaryHits(probe.outputText || "", canary),
      filesystemDiff: probe.diff,
      ...(probe.error ? { error: maskCanary(probe.error, canary) } : {}),
    })),
    findings,
  };
}

export function writeEvidence(file, evidence) {
  fs.writeFileSync(file, `${JSON.stringify(evidence, null, 2)}\n`);
}
