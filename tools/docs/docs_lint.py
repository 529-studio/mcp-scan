#!/usr/bin/env python3
"""Documentation gate for mcp-scan.

Checks:
- context budget for the always-loaded set
- on-demand document size ceiling
- relative markdown link resolution
- lessons index completeness
- old email aliases
- obvious credential patterns

No third-party dependencies.
"""

from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

ALWAYS_LOADED = [
    "AGENTS.md",
    "CLAUDE.md",
    "GEMINI.md",
    "docs/ONBOARDING.md",
    "docs/lessons/INDEX.md",
]

TOTAL_BUDGET = 32 * 1024
FILE_BUDGET = 16 * 1024
INDEX_BUDGET = 18 * 1024
ON_DEMAND_BUDGET = 25 * 1024

OLD_EMAILS = [
    "security@529studio.site",
    "hello@529studio.site",
    "conduct@529studio.site",
]

SECRET_PATTERNS = [
    re.compile(r"\b(ghp|gho|ghs|ghu)_[A-Za-z0-9]{20,}\b"),
    re.compile(r"\bsk-[A-Za-z0-9]{20,}\b"),
    re.compile(r"\bAKIA[0-9A-Z]{16}\b"),
    re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----"),
    re.compile(r"\bxox[baprs]-[A-Za-z0-9-]{10,}\b"),
    re.compile(r"\bAIza[0-9A-Za-z_-]{35}\b"),
]

SKIP_SECRET_FILES = {
    "scripts/check-public-safe.sh",
    "tools/docs/docs_lint.py",
}

LINK_RE = re.compile(r"\[[^\]]*\]\(([^)]+)\)")
INDEX_ROW_RE = re.compile(r"\[L\d+\]\(([^)]+)\)")
LESSON_FILE_RE = re.compile(r"^L(\d+)-.*\.md$")


def tracked_markdown() -> list[Path]:
    try:
        out = subprocess.check_output(
            ["git", "ls-files", "*.md"], cwd=ROOT, text=True
        )
        return [ROOT / line for line in out.splitlines() if line.strip()]
    except Exception:
        return sorted(ROOT.rglob("*.md"))


def strip_code_fences(text: str) -> str:
    lines = []
    in_fence = False
    for line in text.splitlines():
        if line.strip().startswith("```"):
            in_fence = not in_fence
            continue
        if not in_fence:
            lines.append(line)
    return "\n".join(lines)


def check_budget(paths: list[Path], errors: list[str]) -> None:
    total = 0
    for path in paths:
        rel = path.relative_to(ROOT).as_posix()
        if not path.exists():
            continue
        size = path.stat().st_size
        limit = INDEX_BUDGET if rel == "docs/lessons/INDEX.md" else FILE_BUDGET
        total += size
        if size > limit:
            errors.append(
                f"[budget] {rel} is {size} bytes; limit is {limit} bytes"
            )
    if total > TOTAL_BUDGET:
        errors.append(
            f"[budget] always-loaded set is {total} bytes; limit is {TOTAL_BUDGET} bytes"
        )


def check_on_demand(paths: list[Path], errors: list[str]) -> None:
    always = {str(ROOT / p) for p in ALWAYS_LOADED}
    for path in paths:
        if str(path) in always or not path.exists():
            continue
        rel = path.relative_to(ROOT).as_posix()
        if rel.startswith("node_modules/"):
            continue
        size = path.stat().st_size
        if size > ON_DEMAND_BUDGET:
            errors.append(f"[budget] {rel} is {size} bytes; limit is {ON_DEMAND_BUDGET} bytes")


def check_links(paths: list[Path], errors: list[str]) -> None:
    for path in paths:
        if not path.exists():
            continue
        rel = path.relative_to(ROOT).as_posix()
        text = strip_code_fences(path.read_text(encoding="utf-8", errors="ignore"))
        for target in LINK_RE.findall(text):
            target = target.strip()
            if not target or target.startswith(("#", "http://", "https://", "mailto:", "tel:")):
                continue
            target = target.split("#", 1)[0]
            if not target:
                continue
            resolved = (path.parent / target).resolve()
            if not resolved.exists():
                errors.append(f"[link] {rel} -> {target} does not resolve")


def check_lessons(errors: list[str]) -> None:
    index = ROOT / "docs" / "lessons" / "INDEX.md"
    lessons_dir = ROOT / "docs" / "lessons"
    if not index.exists():
        errors.append("[lessons] docs/lessons/INDEX.md is missing")
        return

    index_text = index.read_text(encoding="utf-8")
    linked = set()
    for target in INDEX_ROW_RE.findall(index_text):
        target = target.split("#", 1)[0]
        linked.add(target)
        if not (lessons_dir / target).exists():
            errors.append(f"[lessons] INDEX links to missing file {target}")

    for path in sorted(lessons_dir.glob("L*.md")):
        if not LESSON_FILE_RE.match(path.name):
            errors.append(f"[lessons] unexpected lesson filename {path.name}")
            continue
        if path.name not in linked:
            errors.append(f"[lessons] {path.name} is not linked from INDEX.md")


def check_text_rules(paths: list[Path], errors: list[str]) -> None:
    agents = ROOT / "AGENTS.md"
    if agents.exists():
        text = agents.read_text(encoding="utf-8")
        if "BEGIN:529studio-engineering-standards" not in text:
            errors.append("[agents] missing 529 standards BEGIN marker")
        if "END:529studio-engineering-standards" not in text:
            errors.append("[agents] missing 529 standards END marker")

    for path in paths:
        if not path.exists():
            continue
        rel = path.relative_to(ROOT).as_posix()
        text = path.read_text(encoding="utf-8", errors="ignore")
        for email in OLD_EMAILS:
            if email in text:
                errors.append(f"[email] {rel} uses retired alias {email}")
        if rel in SKIP_SECRET_FILES:
            continue
        for pattern in SECRET_PATTERNS:
            match = pattern.search(text)
            if match:
                errors.append(f"[secret] {rel} matches {pattern.pattern[:30]}...")
                break


def main() -> int:
    paths = tracked_markdown()
    errors: list[str] = []

    check_budget([ROOT / p for p in ALWAYS_LOADED], errors)
    check_on_demand(paths, errors)
    check_links(paths, errors)
    check_lessons(errors)
    check_text_rules(paths, errors)

    if errors:
        print("docs-lint: FAILED")
        for error in errors:
            print(f"  {error}")
        return 1

    print("docs-lint: OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
