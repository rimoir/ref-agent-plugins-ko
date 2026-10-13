"""폴더 안 .md 파일의 `](경로#앵커)` 링크가 대상 파일의 GitHub slug나 <a id>를 가리키는지 검사한다.

사용법: python3 tools/check-anchors.py <폴더>...
깨진 링크가 있으면 종료 코드 1로 끝난다.
"""
import glob
import os
import re
import sys


def anchors(path):
    out, seen, code = set(), {}, False
    for line in open(path, encoding="utf8"):
        if line.lstrip().startswith("```"):
            code = not code
            continue
        if code:
            continue
        out.update(re.findall(r'<a (?:id|name)="([^"]+)"', line))
        m = re.match(r"#{1,6}\s+(.*?)\s*#*\s*$", line)
        if m:
            text = re.sub(r"<[^>]+>", "", m.group(1)).strip().lower()
            text = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", text)
            slug = re.sub(r"[^\w\- ]", "", text).replace(" ", "-")
            # GitHub은 같은 slug가 다시 나오면 -1, -2를 붙인다.
            k = seen.get(slug, 0)
            seen[slug] = k + 1
            out.add(slug if k == 0 else f"{slug}-{k}")
    return out


broken = total = 0
for root in sys.argv[1:]:
    for path in glob.glob(f"{root}/**/*.md", recursive=True):
        if "/node_modules/" in path:
            continue
        for target, anchor in re.findall(r"\]\(([^)\s]*?)#([^)\s]+)\)", open(path, encoding="utf8").read()):
            if re.match(r"[a-z]+:", target):
                continue
            total += 1
            dest = os.path.normpath(os.path.join(os.path.dirname(path), target)) if target else path
            if not os.path.isfile(dest) or anchor not in anchors(dest):
                broken += 1
                print(f"{path}\t{target}#{anchor}")
print(f"links {total}, broken {broken}")
sys.exit(1 if broken else 0)
