import assert from "node:assert/strict";
import { tools } from "./fixtures/tools/tools.js";
import { scanTools, toolRules } from "../src/tool-rules.js";

const findings = scanTools("fixture", tools);
const ids = new Set(findings.map((finding) => finding.id));

for (const rule of toolRules) {
  assert.ok(ids.has(rule.id), `expected ${rule.id} to fire on the fixture`);
}

const clean = scanTools("fixture", [tools[0]]);
assert.equal(clean.length, 0, "clean read_file should produce zero findings");

for (const finding of findings) {
  assert.ok(
    finding.evidence.length <= 160,
    `${finding.id} evidence is longer than 160 chars`,
  );
  assert.equal(
    finding.evidence.includes("API_KEY="),
    false,
    "evidence must not print credential assignments",
  );
}

assert.equal(new Set(findings.map((finding) => finding.id)).size, 10);

console.log("ok — 10 tool rules, clean fixture, bounded evidence");
