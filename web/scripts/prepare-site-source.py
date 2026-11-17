"""Fallback for environments without the Sites source helper.

Run from the GitHub repository root in a PTY. Send the native Sites credential
as one JSON line on stdin after the ready message. No secrets are written to
disk, passed in process arguments, or printed. Builds must already be complete.
"""
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tarfile
import termios


def git(*args, env=None, input=None):
    return subprocess.check_output(
        ["git", *args], env=env, input=input, text=True, stderr=subprocess.PIPE
    ).strip()


if sys.stdin.isatty():
    settings = termios.tcgetattr(sys.stdin)
    settings[3] &= ~termios.ECHO
    termios.tcsetattr(sys.stdin, termios.TCSANOW, settings)
print("Ready for Site workflow JSON on stdin (input is hidden).", flush=True)
payload = json.loads(sys.stdin.readline())
credential = payload["credential"]
repo = Path(git("rev-parse", "--show-toplevel"))
prefix = payload.get("prefix", "web")
checkout = repo / prefix
manifest = json.loads((checkout / ".openai/hosting.json").read_text())
project_id = manifest["project_id"]
remote = credential["remote_url"]
branch = credential["branch"]
if not re.fullmatch(r"[A-Za-z0-9_./-]+", branch):
    raise ValueError("Unexpected source branch")
if git("status", "--porcelain", "--", str(checkout)):
    raise ValueError("Commit the exact website source before packaging")

environment = os.environ.copy()
environment["GIT_TERMINAL_PROMPT"] = "0"
if credential.get("auth_mode") != "work_proxy":
    count = int(environment.get("GIT_CONFIG_COUNT", "0"))
    environment[f"GIT_CONFIG_KEY_{count}"] = f"http.{remote}.extraheader"
    environment[f"GIT_CONFIG_VALUE_{count}"] = "Authorization: Bearer " + credential["token"]
    environment["GIT_CONFIG_COUNT"] = str(count + 1)

try:
    previous = git("ls-remote", remote, f"refs/heads/{branch}", env=environment)
    parents = []
    if previous:
        git("fetch", "--no-tags", remote, f"refs/heads/{branch}", env=environment)
        parents = ["-p", previous.split()[0]]
    github_commit = git("rev-parse", "HEAD")
    tree = git("rev-parse", f"HEAD:{prefix}" if prefix else "HEAD^{tree}")
    source_commit = git(
        "commit-tree", tree, *parents, "-m",
        f"Publish MaestroMate source from {github_commit}", env=environment
    )
    git("push", remote, f"{source_commit}:refs/heads/{branch}", env=environment)
    observed = git("ls-remote", remote, f"refs/heads/{branch}", env=environment).split()[0]
    if observed != source_commit:
        raise ValueError("Remote source does not match packaged commit")
    output = checkout / "dist"
    if manifest.get("static"):
        output = checkout / manifest["static"]["directory"]
        client = output
    else:
        client = output / "client"
        if not (output / "server/index.js").is_file() or not (output / ".openai/drizzle/meta/_journal.json").is_file():
            raise ValueError("Complete Worker build and database migrations are required")
        if json.loads((output / ".openai/hosting.json").read_text()) != manifest:
            raise ValueError("Built hosting metadata must match the source")
    if not (client / "index.html").is_file() or not (client / "audio/aquarium.mp3").is_file():
        raise ValueError("Complete client build with audio is required")
    archive = checkout / ".tmp/deployment.tgz"
    archive.parent.mkdir(exist_ok=True)
    with tarfile.open(archive, "w:gz") as package:
        package.add(checkout / ".openai/hosting.json", arcname=".openai/hosting.json")
        package.add(output, arcname=manifest.get("static", {}).get("directory", "dist"))
    print(json.dumps({
        "project_id": project_id, "commit_sha": source_commit,
        "github_commit": github_commit, "archive": str(archive),
        "archive_bytes": archive.stat().st_size
    }), flush=True)
except subprocess.CalledProcessError as error:
    # Git receives credentials through environment only; stderr contains no header.
    print(error.stderr, file=sys.stderr)
    raise SystemExit(error.returncode)
