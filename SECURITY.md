# Security policy

## Reporting a vulnerability in mcp-scan

Please **do not open a public issue** for a vulnerability in `mcp-scan` itself.

Email: `contact@529studio.site`

Include:

- a description of the issue;
- steps to reproduce;
- the affected version;
- any proof-of-concept (please keep it minimal and non-destructive).

We aim to acknowledge within 72 hours and to provide a remediation timeline within 7 days.

## Scope

This policy covers the `mcp-scan` scanner, its rules, and its CLI. It does not cover third-party MCP servers that `mcp-scan` scans.

## Safe harbor

We will not pursue legal action for good-faith security research that:

- stays within the scope above;
- does not access, modify, or exfiltrate data that is not yours;
- does not degrade service;
- is reported privately and given reasonable time to fix.

## Scanning third-party systems

`mcp-scan` is a static/config scanner. It does not connect to remote servers, exploit findings, or exfiltrate data. If you add dynamic checks, only run them against systems you own or have explicit permission to test.
