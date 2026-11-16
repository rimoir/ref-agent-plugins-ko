"""sources.json의 ref와 upstream 최신을 비교해 바뀐 플러그인을 JSON 줄로 출력한다.

사용법: python3 tools/check-updates.py
출력 한 줄: {"name": ..., "repo": ..., "track": ..., "from": <ref>, "to": <최신>}
"""
import base64
import json
import subprocess
import sys


def gh(path, q):
    return subprocess.run(["gh", "api", path, "-q", q], check=True,
                          capture_output=True, text=True).stdout.strip()


def latest(s):
    if s["track"] == "tag":
        return gh(f"repos/{s['repo']}/tags", ".[0].name")
    if s["track"] == "main":
        return gh(f"repos/{s['repo']}/commits/main", ".sha")[:7]
    if s["track"] == "file":
        raw = base64.b64decode(gh(f"repos/{s['repo']}/contents/{s['file']}", ".content"))
        return json.loads(raw)["version"]
    sys.exit(f"알 수 없는 track: {s['track']}")


for name, s in json.load(open("sources.json")).items():
    new = latest(s)
    if new != s["ref"]:
        print(json.dumps({"name": name, "repo": s["repo"], "track": s["track"], "from": s["ref"], "to": new}))
