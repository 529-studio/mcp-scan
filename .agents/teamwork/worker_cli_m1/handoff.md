# Handoff — Worker CLI

**Status:** DONE (manual fallback; subagent quota blocked)

## Files

- `src/targets/stdio.js` — spawn, line reader, request timeout, close, stderr.
- `src/protocol.js` — `initialize`, `tools/list`, pagination cap.
- `src/cli.js` — `--live`, `--stdio`, `--arg`, `--timeout`, live output.
- `test/protocol.test.js` — handshake, pagination, JSON-RPC error, timeout.
- `test/fixtures/protocol/server.js` — fixture MCP server with `--hang`.

## API

```js
const client = connectStdio({ command, args, env, cwd, timeoutMs });
await client.initialize();
const tools = await client.listTools();
await client.close();
```

## Verification

```text
$ node test/protocol.test.js
ok — protocol initialize, pagination, error, timeout

$ node src/cli.js --stdio node --arg test/fixtures/protocol/server.js --format json --fail-on none
16 findings (1 low, 8 medium, 7 high) in 1 server.
```

## Caveats

- HTTP/SSE transport is not implemented. `--live` on a `url` server exits 2 with a clear message.
- `--stdio` runs the command the user provides; the README tells users to scan only trusted servers.
