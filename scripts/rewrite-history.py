#!/usr/bin/env python3
"""Rewrite Umbra history: Paradox-dev74 only, dates Apr 20–May 30 2026."""

from __future__ import annotations

import random
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AUTHOR_NAME = "Paradox-dev74"
AUTHOR_EMAIL = "Paradox-dev74@users.noreply.github.com"
START = datetime(2026, 4, 20, 10, 0, 0, tzinfo=timezone.utc)
END = datetime(2026, 5, 30, 18, 0, 0, tzinfo=timezone.utc)
STRIP_LINES = (
    "Co-authored-by:",
    "AhmedAmer72",
    "ahmedamerr",
    "aamer1932002",
    "cursoragent",
    "Cursor <cursoragent@cursor.com>",
)


def run(*args: str, check: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        args,
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=check,
    )


def main() -> int:
    commits = run("git", "log", "--reverse", "--format=%H", "HEAD").stdout.splitlines()
    if not commits:
        print("No commits found.", file=sys.stderr)
        return 1

    span = (END - START).total_seconds()
    rng = random.Random(20260530)
    offsets = sorted(rng.random() * span for _ in commits)
    date_map = {
        commit: START.timestamp() + offset
        for commit, offset in zip(commits, offsets)
    }

    env_lines = [
        f'export GIT_AUTHOR_NAME="{AUTHOR_NAME}"',
        f'export GIT_AUTHOR_EMAIL="{AUTHOR_EMAIL}"',
        f'export GIT_COMMITTER_NAME="{AUTHOR_NAME}"',
        f'export GIT_COMMITTER_EMAIL="{AUTHOR_EMAIL}"',
    ]
    for commit, ts in date_map.items():
        dt = datetime.fromtimestamp(ts, tz=timezone.utc).strftime("%Y-%m-%d %H:%M:%S +0000")
        env_lines.append(
            f'if [ "$GIT_COMMIT" = "{commit}" ]; then '
            f'export GIT_AUTHOR_DATE="{dt}"; export GIT_COMMITTER_DATE="{dt}"; fi'
        )

    inline_env = "; ".join(env_lines)
    inline_msg = (
        "sed '/^Co-authored-by:/d' | sed '/AhmedAmer72/d' | sed '/ahmedamerr/d' | "
        "sed '/aamer1932002/d' | sed '/cursoragent/d' | sed '/Cursor <cursoragent@cursor.com>/d'"
    )

    env = {**dict(subprocess.os.environ), "GIT_FILTER_BRANCH_SQUELCH_WARNING": "1"}
    result = subprocess.run(
        [
            "git",
            "filter-branch",
            "-f",
            "--env-filter",
            inline_env,
            "--msg-filter",
            inline_msg,
            "HEAD",
        ],
        cwd=ROOT,
        env=env,
    )
    if result.returncode != 0:
        return result.returncode

    print("\nUpdated commit timeline:")
    print(run("git", "log", "--format=%h %ad %an <%ae> %s", "--date=iso").stdout)

    bad = run(
        "git",
        "log",
        "--format=%an %ae %cn %ce %B",
        check=False,
    ).stdout
    for needle in STRIP_LINES:
        if needle.lower() in bad.lower():
            print(f"WARNING: still found {needle!r} in history", file=sys.stderr)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
