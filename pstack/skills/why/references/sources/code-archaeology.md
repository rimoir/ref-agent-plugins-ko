# 코드 고고학 (git + 레포 내부)

## 이 출처에 담긴 것

- 커밋 이력(메시지, 날짜, 작성자, diff)
- PR 설명, 리뷰 코멘트, 토론 스레드(`gh`로 조회)
- 인라인 코드 주석, TODO, FIXME, 폐기 예정 메모
- 레포가 관리한다면 ADR(아키텍처 결정 기록)
- 테스트. 이름과 단언문에 변경을 부른 엣지 케이스가 담겨 있는 경우가 많다
- 같은 커밋에서 함께 수정된 관련 파일(동시 변경 신호)
- 레포 안의 CHANGELOG 항목, 릴리스 노트
- 커밋 메시지와 PR 본문에 언급된 이슈·티켓 ID

코드와 직접 묶여 있어 가장 믿을 만하고, 가장 완전한 출처다. 레포를 거쳐 간 모든 것이 여기 있어야 한다.

## 검색 방법

씨앗 커밋 목록을 넓힌다.

```bash
# 이름 변경을 따라간 파일 전체 이력
git log --follow --oneline -- <file>

# pickaxe. 이 텍스트를 정확히 추가하거나 지운 커밋
git log -S '<exact_string_from_code>' -- <file>

# 패턴으로 찾으려면
git log -G '<regex>' -- <file>

# 각 줄을 누가 언제 썼는가
git blame -L <start>,<end> <file>

# 특정 커밋의 전체 diff
git show <hash>

# 두 지점 사이에서 이 파일에 영향을 준 커밋
git log <old>..<new> -p -- <file>
```

실질적인 커밋마다 PR 맥락을 가져온다.

```bash
# 머지 커밋이나 브랜치에서 PR 번호를 찾는다
git log -1 --format=%B <hash>

# PR 전체 맥락. 본문, 리뷰 코멘트, 연결된 이슈
gh pr view <number> --json title,body,author,createdAt,mergedAt,labels,closingIssuesReferences,comments,reviews,files

# 진짜 신호는 --json의 reviews와 comments 필드에 있다
```

코드 밖의 문서를 찾는다.

```bash
# ADR은 보통 docs/adr/ 같은 곳에 있다
rg -l -i 'architecture.decision' --glob '*.md'

# 대상 근처의 TODO와 FIXME
rg -n -C2 '(TODO|FIXME|HACK|XXX|NOTE)' <target_file>

# 관련 테스트. 이름에 "왜"가 담겨 있을 때가 많다
rg -l '<symbol>' --glob '*test*'
```

## 여기서 좋은 증거의 모습

- 변경만이 아니라 푸는 문제를 설명하는 PR 설명("This fixes the pagination bug that caused X")
- 대안을 놓고 토론한 긴 리뷰 스레드
- 대상 줄 근처에서 뻔하지 않은 제약을 설명하는 인라인 주석
- 코드를 부른 엣지 케이스를 드러내는 `test_handles_edge_case_when_X` 같은 이름의 테스트
- 티켓이나 인시던트 ID를 참조하는 커밋 메시지
- 사용자에게 보이는 근거를 요약한 CHANGELOG 항목

## 흔한 함정

- **squash 병합의 평지.** 레포가 PR을 squash하면 브랜치 이력의 개별 커밋은 사라진다. PR 본문과 코멘트로 대신한다.
- **오해를 부르는 커밋 메시지.** "Small refactor"가 의도한 동작 변경을 숨기는 경우가 있다. 메시지가 아니라 diff를 본다.
- **의미도 모르고 베낀 패턴.** 작성자가 이유를 모른 채 패턴을 베꼈을 수 있다. 그 패턴이 코드베이스 더 앞쪽에서 처음 생겼는지 확인하고 *그* 커밋을 조사한다.
- **봇 커밋과 자동 병합.** Dependabot, Renovate, 자동 백포트에는 보통 동기가 담겨 있지 않다. 의도를 찾을 때는 건너뛴다.
- **코드를 의도의 증거로 여기기.** 코드 자체는 그 코드가 왜 있는지의 증거가 아니다. 증거는 커밋 메시지, PR, 주석, 테스트, 문서에서 나온다. "함수 이름이 X다"를 의도의 증거로 인용하지 않는다.

## 돌려줄 것

질문과 관련된 모든 커밋, PR, 주석을 다음과 함께 돌려준다.
- 정확한 원문(인용)
- 해시, PR 번호, file:line
- 작성자와 날짜
- 직접 증거(질문을 명시적으로 다룸)인지 정황 증거인지
