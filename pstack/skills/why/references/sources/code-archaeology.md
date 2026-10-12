# 코드 고고학 (git + 레포 내부)

## 이 출처에 담긴 것

- 커밋 이력(메시지, 날짜, 작성자, diff)
- PR 설명, 리뷰 코멘트, 토론 스레드(`gh`로 조회)
- 인라인 코드 주석, TODO, FIXME, 폐기 예정 메모
- 레포가 관리한다면 ADR(아키텍처 결정 기록)
- 테스트. 이름과 단언문에 변경을 부른 엣지 케이스가 담겨 있는 경우가 많다
- 같은 커밋에서 함께 수정된 관련 파일(동시 변경 신호)
- 레포 안의 CHANGELOG 항목과 릴리스 노트
- 커밋 메시지와 PR 본문의 이슈·티켓 ID

코드와 직접 묶여 있어 가장 믿을 만하고, 가장 완전한 출처다. 레포를 거쳐 간 모든 것이 여기 있어야 한다.

## 검색 방법

씨앗 커밋 목록을 넓힌다.

```bash
# 이름 변경을 따라간 이력
git log --follow --oneline -- <file>

# pickaxe. 이 텍스트를 정확히 추가하거나 지운 커밋
git log -S '<exact_string_from_code>' -- <file>

# 패턴으로 찾으려면
git log -G '<regex>' -- <file>

# 각 줄을 누가 언제 썼는가
git blame -L <start>,<end> <file>

# 커밋 하나의 전체 diff
git show <hash>

# 두 지점 사이에서 이 파일에 영향을 준 커밋
git log <old>..<new> -p -- <file>
```

코드 밖의 문서를 찾는다.

```bash
# ADR은 보통 docs/adr/ 같은 곳에 있다
rg -l -i 'architecture.decision' --glob '*.md'

# 대상 근처의 TODO와 FIXME
rg -n -C2 '(TODO|FIXME|HACK|XXX|NOTE)' <target_file>

# 관련 테스트
rg -l '<symbol>' --glob '*test*'
```
