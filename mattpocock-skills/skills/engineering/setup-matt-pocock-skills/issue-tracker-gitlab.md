# 이슈 트래커: GitLab

이 저장소의 이슈와 스펙은 GitLab 이슈로 관리한다. 모든 작업에 [`glab`](https://gitlab.com/gitlab-org/cli) CLI를 쓴다.

## 사용 규칙

- **이슈 만들기**: `glab issue create --title "..." --description "..."`. 설명이 여러 줄이면 heredoc을 쓴다. 편집기를 열려면 `--description -`을 넘긴다.
- **이슈 읽기**: `glab issue view <number> --comments`. 기계가 읽을 출력이 필요하면 `-F json`을 쓴다.
- **이슈 목록 보기**: `glab issue list -F json`에 알맞은 `--label` 필터를 붙인다.
- **이슈에 댓글 달기**: `glab issue note <number> --message "..."`. GitLab은 댓글을 "note"라고 부른다.
- **라벨 붙이기 / 떼기**: `glab issue update <number> --label "..."` / `--unlabel "..."`. 라벨 여러 개는 쉼표로 구분하거나 플래그를 반복해 넘긴다.
- **닫기**: `glab issue close <number>`. `glab issue close`는 닫으면서 댓글을 남기지 못하므로 먼저 `glab issue note <number> --message "..."`로 설명을 남기고 닫는다.
- **머지 리퀘스트**: GitLab은 PR을 "merge request"라고 부른다. `glab mr create`, `glab mr view`, `glab mr note` 등을 쓴다. `gh pr ...`와 형태가 같고, `pr` 대신 `mr`, `comment`/`--body` 대신 `note`/`--message`를 쓴다.

저장소는 `git remote -v`로 알아낸다. 클론 안에서 실행하면 `glab`이 자동으로 알아낸다.

## 분류 대상으로서의 머지 리퀘스트

**MR을 요청 접수 경로로 쓰기: no.** _(이 저장소가 외부 머지 리퀘스트를 기능 요청으로 받는다면 `yes`로 바꾼다. `/triage`가 이 플래그를 읽는다.)_

`yes`로 바꾸면 MR도 이슈와 같은 라벨과 상태를 거치며, `glab mr`의 대응 명령을 쓴다.

- **MR 읽기**: `glab mr view <number> --comments`, diff는 `glab mr diff <number>`로 본다.
- **분류할 외부 MR 목록 보기**: `glab mr list -F json`을 실행한 다음, 작성자가 프로젝트 멤버나 소유자가 아닌 MR만 남긴다(메인테이너가 진행 중인 작업이 아니라 기여자의 MR).
- **댓글 / 라벨 / 닫기**: `glab mr note`, `glab mr update --label`/`--unlabel`, `glab mr close`.

GitHub과 달리 GitLab은 이슈와 MR에 번호를 따로 매기므로, 메인테이너가 어느 쪽을 말하는지 알면 `#42`가 무엇인지 분명하다.

## 스킬이 "이슈 트래커에 게시한다"고 할 때

GitLab 이슈를 만든다.

## 스킬이 "관련 티켓을 가져온다"고 할 때

`glab issue view <number> --comments`를 실행한다.

## wayfinder 작업

`/wayfinder`가 쓴다. **계획 이슈**(map, 결정 목록과 하위 티켓을 묶는 상위 이슈)는 이슈 하나이고, 티켓은 그 아래의 **하위** 이슈다.

- **계획 이슈**: `wayfinder:map` 라벨을 붙인 이슈 하나를 쓴다. 본문에 메모 / 지금까지의 결정 / 아직 정하지 못한 것을 담는다. `glab issue create --label wayfinder:map`. (기본 에픽 기능이 있는 GitLab 요금제에서는 에픽이 계획 이슈를 대신할 수도 있다. 라벨을 붙인 이슈는 어디서나 쓸 수 있다.)
- **하위 티켓**: 설명 맨 위에 `Part of #<map>`을 적고 `wayfinder:<type>` (`research`/`prototype`/`grilling`/`task`) 라벨을 붙인 이슈로 만든다. 티켓을 맡으면 작업을 이끄는 개발자를 담당자로 지정한다.
- **차단 관계**: GitLab의 **기본 차단 링크(blocking link)** 기능으로 표시한다. 이것이 표준 방식이고 UI에도 보인다. `/blocked_by #<n>` 빠른 작업(quick action)을 note로 올려 추가한다(`glab issue note <child> --message "/blocked_by #<blocker>"`). 기본 차단 링크는 Premium/Ultimate 기능이다. 무료 요금제이거나 쓸 수 없는 환경이면 설명 맨 위에 `Blocked by: #<n>, #<n>` 줄을 적는다. 선행 티켓이 모두 닫히면 티켓의 막힘이 풀린다.
- **진행 가능 목록 조회**: 계획 이슈의 하위 티켓으로 범위를 좁혀 `glab issue list -F json`을 실행하고, 열린 선행 티켓이 있거나 담당자가 있는 티켓은 뺀다. 열린 선행 티켓이 있다는 것은 열린 이슈로 향하는 기본 `blocked_by` 링크가 있거나(`glab api projects/:id/issues/:iid/links`로 확인한다) `Blocked by` 줄에 열린 이슈가 있다는 뜻이다. 남은 것 가운데 계획 이슈 순서상 가장 앞의 티켓을 고른다.
- **맡기**: `glab issue update <n> --assignee @me`. 세션에서 가장 먼저 하는 쓰기 작업이다.
- **해소**: `glab issue note <n> --message "<answer>"`, 그다음 `glab issue close <n>`, 그다음 계획 이슈의 '지금까지의 결정' 섹션에 컨텍스트 포인터(요지와 링크를 담아 원래 자료를 가리키는 짧은 참조)를 덧붙인다.
