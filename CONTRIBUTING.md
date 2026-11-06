# Contributing

Thanks for helping make MCP deployments safer.

## Development

Requirements: Node.js 18+.

```bash
git clone https://github.com/529-studio/mcp-scan.git
cd mcp-scan
node test/run.js
node src/cli.js test/fixtures/bad.mcp.json --fail-on none
```

There are no runtime dependencies. Keep it that way unless there is a strong reason.

## Adding a rule

1. Add a `check(server)` function in `src/rules.js`.
2. Give it a stable ID (`MCP-0xx`), a title, a severity, and a reference.
3. Return an object with `evidence`, `impact`, and `fix`.
4. Add a fixture in `test/fixtures/`.
5. Add the rule to `docs/rules.md`.
6. Run `node test/run.js`.

A good rule:

- has a narrow, deterministic trigger;
- produces evidence a human can verify;
- has a low false-positive rate;
- includes a concrete fix;
- is safe: no exploitation, no network calls, no secret exfiltration.

## Pull requests

- Keep changes focused.
- Add or update tests.
- Update the README or docs if behavior changes.
- Sign off your commits with the Developer Certificate of Origin (DCO):

```text
Signed-off-by: Your Name <you@example.com>
```

Use `git commit -s` to add the sign-off.

## Code style

- ESM, Node.js built-ins only.
- Small functions, explicit names.
- No `console.log` in library code; the CLI owns output.
- Prefer readable code over clever code.

## Security

Do not include real secrets, customer data, or exploit payloads in issues, fixtures, or PRs. See [SECURITY.md](SECURITY.md).
