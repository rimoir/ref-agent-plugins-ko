"""claude-code-action의 실행 기록(execution_file)에서 사용량을 뽑아 마크다운 표로 출력한다.

사용법: python3 tools/usage-summary.py <execution_file> <제목> >> "$GITHUB_STEP_SUMMARY"
"""
import json
import sys

path, title = sys.argv[1], sys.argv[2]
text = open(path).read()
try:
    events = json.loads(text)
except json.JSONDecodeError:  # JSONL
    events = [json.loads(l) for l in text.splitlines() if l.strip()]
r = next(e for e in reversed(events) if e.get("type") == "result")
u = r.get("usage", {})
print(f"### {title}\n")
print("| 턴 | 시간 | 추정 비용(USD) | 입력 | 출력 | 캐시 읽기 | 캐시 쓰기 |")
print("|---|---|---|---|---|---|---|")
print(f"| {r.get('num_turns')} | {r.get('duration_ms', 0) / 60000:.1f}분 | {r.get('total_cost_usd', 0):.2f} "
      f"| {u.get('input_tokens', 0):,} | {u.get('output_tokens', 0):,} "
      f"| {u.get('cache_read_input_tokens', 0):,} | {u.get('cache_creation_input_tokens', 0):,} |\n")
