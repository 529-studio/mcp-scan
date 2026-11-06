# L09: Cursor Pagination Must Advance by Offset

## Context & Problem

The first fixture server returned the same `"page2"` cursor on every page after the first. The client followed it, received the same page again, and looped until the 20-page cap. The unit test that expected seven tools failed with a page-limit error.

## Root Cause

The cursor token was treated as a boolean ("there is more") instead of a position ("start here"). A fixed token cannot tell the client where the next page begins, so the loop has no progress guarantee.

## Solution

- Encode the next offset in the cursor: `"3"`, `"6"`, and so on.
- The server returns `nextCursor` only when there is a next page.
- The client follows the cursor until it is absent.
- Keep a hard page cap as a backstop.
- Reject a non-integer or negative cursor with a JSON-RPC error.

## Verification

- The fixture has seven tools and three pages.
- The protocol test asserts seven tools and no page-limit error.
- A malformed cursor returns `-32602`.
- The 20-page cap remains as a guard against a broken server.

## Rule References

- AGENTS.md Rule 5: evidence before assertions.
- AGENTS.md Rule 6: rule quality.
