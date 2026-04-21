#!/usr/bin/env python3
"""Check for AhmedAmer72 references in git history."""

import subprocess
import os

os.chdir("e:/AKINDO/Umbra")

def run(cmd):
    result = subprocess.run(cmd, capture_output=True, text=True, shell=True)
    return result.stdout.strip(), result.stderr.strip(), result.returncode

# Check git config
print("=== Git Config ===")
out, err, rc = run("git config user.name")
print(f"user.name: {out}")
out, err, rc = run("git config user.email")
print(f"user.email: {out}")

# Check all refs
print("\n=== All Refs ===")
out, err, rc = run("git for-each-ref")
print(out)

# Check branches
print("\n=== Branches ===")
out, err, rc = run("git branch -a")
print(out)

# Check remote branches
print("\n=== Remote Branches ===")
out, err, rc = run("git branch -r")
print(out)

# Check tags
print("\n=== Tags ===")
out, err, rc = run("git tag")
print(out)

# Check for AhmedAmer72 in all refs
print("\n=== Searching for AhmedAmer72 in all history ===")
out, err, rc = run('git log --all --format="%H %an <%ae> %cn <%ce> %s"')
lines = out.split("\n")
found = [line for line in lines if "AhmedAmer72" in line]
if found:
    print(f"FOUND {len(found)} references:")
    for line in found:
        print(f"  {line}")
else:
    print("No AhmedAmer72 references found in local history")

# Check reflog
print("\n=== Reflog entries ===")
out, err, rc = run("git reflog show --all --format='%h %an %s'")
lines = out.split("\n")
found = [line for line in lines if "AhmedAmer72" in line]
if found:
    print(f"FOUND {len(found)} reflog entries:")
    for line in found:
        print(f"  {line}")
else:
    print("No AhmedAmer72 in reflog")

# Check stashes
print("\n=== Stashes ===")
out, err, rc = run("git stash list")
print(out if out else "No stashes")

# Check remote URL
print("\n=== Remote URL ===")
out, err, rc = run("git remote -v")
print(out)

# Check latest commit
print("\n=== Latest commit ===")
out, err, rc = run('git log -1 --format="%H %an <%ae> %cn <%ce> %s"')
print(out)

print("\nDone.")
