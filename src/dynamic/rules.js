import { looksLikeInstruction } from "../tool-rules.js";
import { findCanaryHits, maskCanary } from "./canary.js";

export const DYNAMIC_RULES = [
  {
    id: "DYN-001",
    title: "Tool read a host canary file",
    severity: "high",
    ref: "Dynamic behavior",
  },
  {
    id: "DYN-002",
    title: "Tool modified a file outside its output directory",
    severity: "high",
    ref: "Dynamic behavior",
  },
  {
    id: "DYN-003",
    title: "Tool leaked a canary secret",
    severity: "high",
    ref: "Dynamic behavior",
  },
  {
    id: "DYN-004",
    title: "Tool output contains instruction-like content",
    severity: "high",
    ref: "Dynamic behavior",
  },
  {
    id: "DYN-005",
    title: "Tool exceeded the time budget",
    severity: "medium",
    ref: "Dynamic behavior",
  },
];

const byId = Object.fromEntries(DYNAMIC_RULES.map((rule) => [rule.id, rule]));

const changedPaths = (diff) =>
  [...diff.added, ...diff.modified, ...diff.deleted].filter(
    (file) => file !== "out" && !file.startsWith("out/"),
  );

const excerpt = (text, canary) => {
  const safe = maskCanary(text || "", canary).replace(/\s+/g, " ").trim();
  if (safe.length === 0) return "(empty output)";
  return safe.length > 160 ? `${safe.slice(0, 157)}...` : safe;
};

export function evaluateDynamic(serverName, probes, canary) {
  const findings = [];

  const add = (id, evidence, impact, fix) => {
    const rule = byId[id];
    findings.push({
      id: rule.id,
      title: rule.title,
      severity: rule.severity,
      ref: rule.ref,
      server: serverName,
      evidence,
      impact,
      fix,
    });
  };

  for (const probe of probes) {
    const output = probe.outputText || "";
    const hits = findCanaryHits(output, canary);
    const changed = changedPaths(probe.diff);

    if (hits.includes("host")) {
      add(
        "DYN-001",
        `tool=${probe.name}; canary=host-file.txt; excerpt=${excerpt(output, canary)}`,
        "The tool read a file outside its declared scope. A prompt injection could turn this into host data exfiltration.",
        "Scope the tool to an explicit directory. Do not accept arbitrary paths.",
      );
    }

    if (hits.includes("secret") || hits.includes("key")) {
      add(
        "DYN-003",
        `tool=${probe.name}; canary=id_rsa; excerpt=${excerpt(output, canary)}`,
        "The tool returned a secret-like file. This is a direct credential exfiltration path.",
        "Remove the secret path. Require a scoped secret reference from a secret manager.",
      );
    }

    if (changed.length > 0) {
      add(
        "DYN-002",
        `tool=${probe.name}; changed=${changed.join(",")}`,
        "The tool wrote or deleted a file outside its output directory.",
        "Mount only a dedicated output directory and reject paths outside it.",
      );
    }

    if (looksLikeInstruction(output)) {
      add(
        "DYN-004",
        `tool=${probe.name}; excerpt=${excerpt(output, canary)}`,
        "Tool output contains text that looks like an instruction to the model.",
        "Treat tool output as untrusted data. Strip or escape instruction-like content.",
      );
    }

    if (probe.error && /timed out/i.test(probe.error)) {
      add(
        "DYN-005",
        `tool=${probe.name}; error=${probe.error}`,
        "The tool did not return within the time budget. A malicious or broken server can stall the agent.",
        "Enforce a per-call timeout and isolate slow tools.",
      );
    }
  }

  return findings;
}
