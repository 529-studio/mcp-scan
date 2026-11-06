import { connectStdio } from "../protocol.js";

export const DEFAULT_IMAGE = "node:20-alpine";

/**
 * Build the Docker CLI arguments for an isolated stdio server.
 *
 * The canary directory is the only writable host mount. The root filesystem is
 * read-only, capabilities are dropped, and the network is disabled by default.
 */
export function buildDockerArgs({
  image = DEFAULT_IMAGE,
  canaryDir,
  allowNetwork = false,
  command,
  args = [],
  env = {},
} = {}) {
  if (!canaryDir) throw new Error("canaryDir is required for the Docker sandbox");
  if (!command) throw new Error("command is required for the Docker sandbox");

  const dockerArgs = ["run", "--rm", "-i"];

  if (!allowNetwork) {
    dockerArgs.push("--network", "none");
  }

  dockerArgs.push(
    "--read-only",
    "--tmpfs",
    "/tmp:rw,noexec,nosuid,size=16m",
    "--cap-drop",
    "ALL",
    "--security-opt",
    "no-new-privileges",
    "--pids-limit",
    "128",
    "--memory",
    "256m",
    "--cpus",
    "0.5",
    "--user",
    "65534:65534",
    "-v",
    `${canaryDir}:/canary:rw`,
    "-w",
    "/canary",
  );

  for (const key of Object.keys(env || {})) {
    dockerArgs.push("-e", key);
  }

  dockerArgs.push(image, command, ...args);
  return dockerArgs;
}

export function createDockerSandbox({
  canaryDir,
  allowNetwork = false,
  image = DEFAULT_IMAGE,
  timeoutMs = 10_000,
  env = {},
} = {}) {
  return {
    kind: "docker",
    connect({ command, args = [], env: extraEnv = {} }) {
      const mergedEnv = { ...env, ...extraEnv };
      const dockerArgs = buildDockerArgs({
        image,
        canaryDir,
        allowNetwork,
        command,
        args,
        env: mergedEnv,
      });

      return connectStdio({
        command: "docker",
        args: dockerArgs,
        env: mergedEnv,
        timeoutMs,
      });
    },
  };
}
