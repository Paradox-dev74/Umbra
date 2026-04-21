# Rewrite commit dates and authors for Paradox-dev74 only.
$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

$commits = git log --reverse --format="%H" HEAD
$count = ($commits | Measure-Object).Count
if ($count -eq 0) { throw "No commits found." }

$start = [datetime]::Parse("2026-04-20T10:00:00Z").ToUniversalTime()
$end = [datetime]::Parse("2026-05-30T18:00:00Z").ToUniversalTime()
$spanSeconds = ($end - $start).TotalSeconds
$rng = [System.Random]::new(20260530)

$offsets = 1..$count | ForEach-Object { $rng.NextDouble() * $spanSeconds } | Sort-Object
$dates = @()
for ($i = 0; $i -lt $count; $i++) {
    $dt = $start.AddSeconds($offsets[$i])
    $dates += $dt.ToString("yyyy-MM-dd HH:mm:ss +0000")
}

$envFilterPath = Join-Path $env:TEMP "umbra-env-filter.sh"
$msgFilterPath = Join-Path $env:TEMP "umbra-msg-filter.sh"

$envLines = @(
    '#!/bin/sh',
    'export GIT_AUTHOR_NAME="Paradox-dev74"',
    'export GIT_AUTHOR_EMAIL="Paradox-dev74@users.noreply.github.com"',
    'export GIT_COMMITTER_NAME="Paradox-dev74"',
    'export GIT_COMMITTER_EMAIL="Paradox-dev74@users.noreply.github.com"',
    'case "$GIT_COMMIT" in'
)

for ($i = 0; $i -lt $count; $i++) {
    $hash = $commits[$i]
    $date = $dates[$i]
    $envLines += "  $hash)"
    $envLines += "    export GIT_AUTHOR_DATE=`"$date`""
    $envLines += "    export GIT_COMMITTER_DATE=`"$date`""
    $envLines += "    ;;"
}
$envLines += "esac"
$envLines | Set-Content -Encoding ascii $envFilterPath

@(
    '#!/bin/sh',
    'sed "/^Co-authored-by:/d" | sed "/^AhmedAmer72/d" | sed "/^ahmedamerr/d"'
) | Set-Content -Encoding ascii $msgFilterPath

$env:GIT_FILTER_BRANCH_SQUELCH_WARNING = "1"
& git filter-branch -f --env-filter "sh `"$envFilterPath`"" --msg-filter "sh `"$msgFilterPath`"" HEAD

Write-Host "`nUpdated commit timeline:"
git log --format="%h %ad %s" --date=iso
