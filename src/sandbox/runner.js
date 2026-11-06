import { createProcessSandbox } from "./process.js";
import { createDockerSandbox, DEFAULT_IMAGE } from "./docker.js";

export const SANDBOX_MODES = ["docker", "process", "none"];

export function createSandbox({
  mode = "docker",
  canaryDir,
  allowNetwork = false,
  image = DEFAULT_IMAGE,
  timeoutMs = 10_000,
  env = {},
} = {}) {
  if (mode === "docker") {
    return createDockerSandbox({
      canaryDir,
      allowNetwork,
      image,
      timeoutMs,
      env,
    });
  }

  if (mode === "process" || mode === "none") {
    return createProcessSandbox({ cwd: canaryDir, env, timeoutMs });
  }

  throw new Error(`unknown sandbox mode: ${mode}`);
}
