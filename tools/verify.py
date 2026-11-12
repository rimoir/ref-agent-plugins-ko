"""번역 갱신 하나를 검증한다. 앵커, 추가한 줄의 em대시·세미콜론, sources.json의 test 명령.

사용법: python3 tools/verify.py <플러그인> [base]   (base 기본값 main)
em대시·세미콜론은 원문 그대로 둔 값일 수 있어 경고만 하고, 앵커와 테스트 실패는 종료 코드 1이다.
"""
import json
import subprocess
import sys

name = sys.argv[1]
base = sys.argv[2] if len(sys.argv) > 2 else "main"
src = json.load(open("sources.json"))[name]
failed = False

if subprocess.run([sys.executable, "tools/check-anchors.py", name]).returncode:
    failed = True

diff = subprocess.run(["git", "diff", "-U0", base, "--", f"{name}/*.md"],
                      capture_output=True, text=True, check=True).stdout
for line in diff.splitlines():
    if line.startswith("+") and not line.startswith("+++") and ("—" in line or ";" in line):
        print(f"경고: em대시/세미콜론 {line[:120]}")

for cmd in src.get("test", []):
    print(f"$ {cmd}")
    if subprocess.run(cmd, shell=True, cwd=name).returncode:
        failed = True

sys.exit(1 if failed else 0)
