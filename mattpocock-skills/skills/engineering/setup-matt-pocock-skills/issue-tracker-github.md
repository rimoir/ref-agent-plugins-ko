# 이슈 트래커: GitHub

이 저장소의 이슈와 스펙은 GitHub 이슈로 관리한다. 모든 작업에 `gh` CLI를 쓴다.

## 사용 규칙

- **이슈 만들기**: `gh issue create --title "..." --body "..."`. 본문이 여러 줄이면 heredoc을 쓴다.
- **이슈 읽기**: `gh issue view <number> --json number,title,body,labels,comments`.
- **이슈 목록 보기**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'`에 알맞은 `--label`, `--state` 필터를 붙인다.
- **이슈를 상위 이슈의 하위 이슈로 만들기**: `gh issue create --parent <parent> ...`, 또는 만든 뒤에 `gh issue edit <parent> --add-sub-issue <child>`(`gh` 2.94 이상). 예전 `gh`에서는 `gh api --method POST repos/<owner>/<repo>/issues/<parent>/sub_issues -F sub_issue_id=<child-db-id>`를 쓴다(아래 **차단 관계**와 같은 데이터베이스 id). 하위 이슈 기능이 없으면 하위 이슈 본문 맨 위에 `Part of #<parent>`를 적는다.
- **차단 관계**: GitHub의 **기본 이슈 의존성(issue dependencies)** 기능으로 표시한다. 이것이 표준 방식이고 UI에도 보인다. 차단 관계는 `gh issue create --blocked-by <n>,<n> ...`이나 `gh issue edit <child> --add-blocked-by <blocker>`로 추가한다(`gh` 2.94 이상). 예전 `gh`에서는 `gh api --method POST repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>`를 쓴다. 여기서 `<blocker-db-id>`는 선행 티켓의 숫자 **데이터베이스 id**다(`gh api repos/<owner>/<repo>/issues/<n> --jq .id`로 얻는다. `#number`나 `node_id`가 _아니다_). 의존성 기능을 쓸 수 없으면 하위 티켓 본문 맨 위에 `Blocked by: #<n>, #<n>` 줄을 적는다. 선행 티켓이 모두 닫히면 티켓의 막힘이 풀린다.
- **열린 선행 티켓 세기**: `gh api repos/<owner>/<repo>/issues/<n> --jq .issue_dependencies_summary.blocked_by`(열린 선행 티켓만 센다. 0이면 시작할 수 있다). `gh issue view <n> --json blockedBy`는 닫힌 선행 티켓도 나열하므로 `--jq '[.blockedBy.nodes[] | select(.state == "OPEN")] | length'`로 거른다.
- **이슈에 댓글 달기**: `gh issue comment <number> --body "..."`
- **라벨 붙이기 / 떼기**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **닫기**: `gh issue comment <number> --body "..."`로 설명을 남긴 다음 `gh issue close <number>`를 실행한다. 이미 닫힌 이슈에서는 `gh issue close --comment`가 댓글을 버리고도 종료 코드 0으로 끝난다.

저장소는 `git remote -v`로 알아낸다. 클론 안에서 실행하면 `gh`가 자동으로 알아낸다.

이슈는 사용자 자신의 저장소에만 올린다. 사용자가 `mattpocock/skills`(이 스킬들의 출처 저장소)의 소유자가 아니면 거기에 절대 올리지 않는다. 포크에서는 `gh`가 기본으로 upstream 상위 저장소를 대상으로 삼을 수 있다. 그래서 세션에서 처음 `gh issue create`를 실행하기 전에 `gh repo view --json nameWithOwner`로 대상을 확인하고, 사용자의 저장소가 아니면 사용자에게 확인받는다.

## 분류 대상으로서의 풀 리퀘스트

**PR을 요청 접수 경로로 쓰기: no.** _(이 저장소가 외부 PR을 기능 요청으로 받는다면 `yes`로 바꾼다. `/triage`가 이 플래그를 읽는다.)_

`yes`로 바꾸면 PR도 이슈와 같은 라벨과 상태를 거치며, `gh pr`의 대응 명령을 쓴다.

- **PR 읽기**: `gh pr view <number>`, 그다음 `gh pr view <number> --comments`(TTY가 아니면 `--comments`는 본문 없이 댓글만 출력한다), diff는 `gh pr diff <number>`로 본다.
- **분류할 외부 PR 목록 보기**: `gh api --paginate 'repos/{owner}/{repo}/pulls?state=open' --jq '.[] | select(.author_association | IN("OWNER","MEMBER","COLLABORATOR") | not) | {number, title, author: .user.login, author_association, labels: [.labels[].name]}'`.
- **댓글 / 라벨 / 닫기**: `gh pr comment`, `gh pr edit --add-label`/`--remove-label`, `gh pr close`.

GitHub은 이슈와 PR에 같은 번호 체계를 쓰므로 `#42`만으로는 어느 쪽인지 알 수 없다. `gh pr view 42`로 확인하고, 안 되면 `gh issue view 42`로 확인한다.

## 스킬이 "이슈 트래커에 게시한다"고 할 때

GitHub 이슈를 만든다.

## 스킬이 "관련 티켓을 가져온다"고 할 때

위 **이슈 읽기**처럼 읽는다.

## wayfinder 작업

`/wayfinder`가 쓴다. **계획 이슈**(map, 결정 목록과 하위 티켓을 묶는 상위 이슈)는 이슈 하나이고, 티켓은 그 아래의 **하위** 이슈다.

- **계획 이슈**: `wayfinder:map` 라벨을 붙인 이슈 하나를 쓴다. 본문에 메모 / 지금까지의 결정 / 아직 정하지 못한 것을 담는다. `gh issue create --label wayfinder:map`.
- **하위 티켓**: GitHub 하위 이슈(sub-issue)로 계획 이슈에 연결한다(**이슈를 상위 이슈의 하위 이슈로 만들기** 참고). 하위 이슈 기능이 켜져 있지 않으면 계획 이슈 본문의 작업 목록(task list)에 하위 티켓을 추가하고 하위 티켓 본문 맨 위에 `Part of #<map>`을 적는다. 라벨: `wayfinder:<type>` (`research`/`prototype`/`grilling`/`task`). 티켓을 맡으면 작업을 이끄는 개발자를 담당자로 지정한다.
- **차단 관계**: 사용 규칙의 **차단 관계**를 본다.
- **진행 가능 목록 조회**: 계획 이슈의 열린 하위 티켓을 나열하고(`gh issue list --state open`, 범위는 계획 이슈의 하위 이슈 / 작업 목록), 열린 선행 티켓이 있거나(**열린 선행 티켓 세기** 참고, 또는 `Blocked by` 줄에 열린 이슈가 있음) 담당자가 있는 티켓은 뺀다. 남은 것 가운데 계획 이슈 순서상 가장 앞의 티켓을 고른다.
- **맡기**: `gh issue edit <n> --add-assignee @me`. 세션에서 가장 먼저 하는 쓰기 작업이다.
- **해소**: `gh issue comment <n> --body "<answer>"`, 그다음 `gh issue close <n>`, 그다음 계획 이슈의 '지금까지의 결정' 섹션에 컨텍스트 포인터(요지와 링크를 담아 원래 자료를 가리키는 짧은 참조)를 덧붙인다.
