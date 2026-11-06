import { spawn } from "node:child_process";

/**
 * Minimal newline-delimited JSON-RPC 2.0 client over stdio.
 *
 * The child is spawned without a shell. Every request has a timeout. On close,
 * the child is terminated and all pending requests are rejected.
 */
export function spawnStdio({
  command,
  args = [],
  env = {},
  cwd,
  timeoutMs = 10_000,
} = {}) {
  if (!command || typeof command !== "string") {
    throw new Error("stdio command is required");
  }

  const child = spawn(command, args, {
    cwd,
    env: { ...process.env, ...env },
    stdio: ["pipe", "pipe", "pipe"],
    shell: false,
  });

  let nextId = 1;
  let stderr = "";
  let closed = false;
  let buffer = "";
  const pending = new Map();

  const rejectAll = (error) => {
    for (const entry of pending.values()) {
      clearTimeout(entry.timer);
      entry.reject(error);
    }
    pending.clear();
  };

  const handleLine = (line) => {
    if (!line.trim()) return;

    let message;
    try {
      message = JSON.parse(line);
    } catch {
      rejectAll(new Error("invalid JSON-RPC line from server"));
      return;
    }

    // Notifications have no id; the client does not act on them.
    if (message.id === undefined || message.id === null) return;

    const entry = pending.get(message.id);
    if (!entry) return;

    clearTimeout(entry.timer);
    pending.delete(message.id);

    if (message.error) {
      const error = new Error(
        message.error.message || "JSON-RPC error from server",
      );
      error.code = message.error.code;
      error.data = message.error.data;
      entry.reject(error);
      return;
    }

    entry.resolve(message.result);
  };

  child.stdout.setEncoding("utf8");
  child.stdout.on("data", (chunk) => {
    buffer += chunk;
    let newline = buffer.indexOf("\n");
    while (newline !== -1) {
      const line = buffer.slice(0, newline).replace(/\r$/, "");
      buffer = buffer.slice(newline + 1);
      handleLine(line);
      newline = buffer.indexOf("\n");
    }
  });

  child.stderr.setEncoding("utf8");
  child.stderr.on("data", (chunk) => {
    if (stderr.length < 8_192) stderr += chunk;
  });

  child.on("error", (error) => {
    closed = true;
    rejectAll(error);
  });

  child.on("exit", (code, signal) => {
    closed = true;
    rejectAll(
      new Error(
        `server exited before response (code=${code}, signal=${signal})`,
      ),
    );
  });

  const request = (method, params = {}, options = {}) => {
    if (closed) {
      return Promise.reject(new Error("stdio client is closed"));
    }

    const id = nextId;
    nextId += 1;
    const timeout = options.timeoutMs ?? timeoutMs;

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(new Error(`${method} timed out after ${timeout}ms`));
      }, timeout);

      pending.set(id, { resolve, reject, timer });

      try {
        child.stdin.write(
          `${JSON.stringify({ jsonrpc: "2.0", id, method, params })}\n`,
        );
      } catch (error) {
        clearTimeout(timer);
        pending.delete(id);
        reject(error);
      }
    });
  };

  const notify = (method, params = {}) => {
    if (closed) return;
    try {
      child.stdin.write(
        `${JSON.stringify({ jsonrpc: "2.0", method, params })}\n`,
      );
    } catch {
      // The exit handler will reject any pending requests.
    }
  };

  const close = () =>
    new Promise((resolve) => {
      if (closed) {
        resolve();
        return;
      }

      closed = true;
      rejectAll(new Error("stdio client closed"));

      if (child.exitCode !== null) {
        resolve();
        return;
      }

      const killTimer = setTimeout(() => {
        try {
          child.kill("SIGKILL");
        } catch {
          // Already gone.
        }
      }, 500);

      child.once("exit", () => {
        clearTimeout(killTimer);
        resolve();
      });

      try {
        child.stdin.end();
        child.kill("SIGTERM");
      } catch {
        clearTimeout(killTimer);
        resolve();
      }
    });

  return {
    request,
    notify,
    close,
    getStderr: () => stderr,
    getPid: () => child.pid ?? null,
  };
}
