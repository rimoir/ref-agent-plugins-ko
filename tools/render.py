"""sources.json에서 README 플러그인 표와 .claude-plugin/marketplace.json을 만든다.

사용법: python3 tools/render.py          파일을 고친다
        python3 tools/render.py --check  결과가 다르면 종료 코드 1
"""
import json
import re
import sys

S = json.load(open("sources.json"))
BEGIN, END = "<!-- plugins:begin -->", "<!-- plugins:end -->"


def version(s):
    return f"main `{s['ref']}`" if s["track"] == "main" else s["ref"] if s["ref"].startswith("v") else f"v{s['ref']}"


def readme(old):
    rows = ["| 플러그인 | upstream | 번역 기준 | 설명 |", "| --- | --- | --- | --- |"]
    for n, s in S.items():
        url = f"https://github.com/{s['repo']}" + (f"/tree/main/{s['path']}" if "path" in s else "")
        rows.append(f"| [`{n}/`]({n}/) | [{s['repo']}]({url}) | {version(s)} | {s['summary']} |")
    table = "\n".join(rows)
    return re.sub(f"{BEGIN}.*?{END}", lambda _: f"{BEGIN}\n{table}\n{END}", old, flags=re.S)


def marketplace():
    plugins = [{"name": n, "source": f"./{n}", **{k: v for k, v in s["marketplace"].items() if k != "license"},
                "description": f"{s['summary']} (한국어 번역, upstream {version(s).replace('`', '')})",
                "license": s["marketplace"]["license"]}
               for n, s in S.items() if "marketplace" in s]
    d = {"name": "ref-agent-plugins-ko", "owner": {"name": "rimoir"},
         "description": "참고용 외부 에이전트 플러그인의 한국어 번역본", "plugins": plugins}
    return json.dumps(d, ensure_ascii=False, indent=2) + "\n"


out = {"README.md": readme(open("README.md").read()), ".claude-plugin/marketplace.json": marketplace()}
if "--check" in sys.argv:
    stale = [p for p, t in out.items() if open(p).read() != t]
    if stale:
        sys.exit(f"render.py를 다시 돌려야 한다: {', '.join(stale)}")
else:
    for p, t in out.items():
        open(p, "w").write(t)
