import { connectStdio } from "../protocol.js";

/**
 * Local process adapter.
 *
 * This adapter does not isolate the child. It exists for tests and for machines
 * without Docker. The CLI prints a warning when it is selected.
 */
export function createProcessSandbox({
  cwd,
  env = {},
  timeoutMs = 10_000,
} = {}) {
  return {
    kind: "process",
    connect({ command, args = [], env: extraEnv = {} }) {
      return connectStdio({
        command,
        args,
        env: { ...env, ...extraEnv },
        cwd,
        timeoutMs,
      });
    },
  };
}
