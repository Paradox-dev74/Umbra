#!/usr/bin/env python3
"""Replay main onto a fresh orphan branch — new SHAs, Paradox-dev74 only."""

from __future__ import annotations

import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AUTHOR_NAME = "Paradox-dev74"
AUTHOR_EMAIL = "Paradox-dev74@users.noreply.github.com"


def run(*args: str, check: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(args, cwd=ROOT, text=True, capture_output=True, check=check)


def main() -> int:
    hashes = run("git", "log", "--reverse", "--format=%H", "main").stdout.splitlines()
    if not hashes:
        print("No commits to replay.", file=sys.stderr)
        return 1

    commits: list[tuple[str, str, str]] = []
    for commit_hash in hashes:
        ts = run("git", "log", "-1", "--format=%at", commit_hash).stdout.strip()
        message = run("git", "log", "-1", "--format=%B", commit_hash).stdout.rstrip()
        commits.append((commit_hash, ts, message))

    run("git", "branch", "main-backup", "main")
    run("git", "checkout", "--orphan", "main-new")

    for i, (old_hash, ts, message) in enumerate(commits):
        # Populate index + working tree from historical commit
        run("git", "checkout", old_hash, "--", ".")
        run("git", "add", "-A")
        env = {
            **dict(subprocess.os.environ),
            "GIT_AUTHOR_NAME": AUTHOR_NAME,
            "GIT_AUTHOR_EMAIL": AUTHOR_EMAIL,
            "GIT_COMMITTER_NAME": AUTHOR_NAME,
            "GIT_COMMITTER_EMAIL": AUTHOR_EMAIL,
            "GIT_AUTHOR_DATE": f"@{ts} +0000",
            "GIT_COMMITTER_DATE": f"@{ts} +0000",
        }
        with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as f:
            f.write(message + "\n")
            msg_path = f.name
        result = subprocess.run(
            ["git", "commit", "-F", msg_path],
            cwd=ROOT,
            env=env,
            capture_output=True,
            text=True,
        )
        Path(msg_path).unlink(missing_ok=True)
        if result.returncode != 0:
            print(result.stderr or result.stdout, file=sys.stderr)
            run("git", "checkout", "main")
            run("git", "branch", "-D", "main-new", check=False)
            return result.returncode
        print(f"Replayed {i + 1}/{len(commits)}: {message.splitlines()[0][:70]}")

    run("git", "branch", "-D", "main")
    run("git", "branch", "-m", "main")
    run("git", "branch", "-D", "main-backup")
    print("\nNew history:")
    print(run("git", "log", "--format=%h %ad %an <%ae> %s", "--date=iso").stdout)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
