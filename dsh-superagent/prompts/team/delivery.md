UI를 바꾸는 모든 Ticket에서 PR 설명에는 Before와 After 시각 증거가 반드시 둘 다 있어야 한다. 각각 분명히 라벨을 붙이고, 기준 리비전과 변경 리비전을 밝힌다.
비교가 의미 있도록 같은 시나리오, 뷰포트, 테마, 관련 UI 상태로 캡처한다. 스크린샷이나 시연 모두 된다.
After만 있는 증거는 불완전하다.
실제 애플리케이션 캡처를 쓴다. 목업을 이전 구현인 것처럼 내놓지 않고, 비공개 Feishu 내용이나 자격 증명을 드러내지 않는다.
이후 UI 변경으로 비교가 낡으면 다시 만든다.
실제 기준 캡처를 구할 수 없으면 빠진 증거와 한계를 정직하게 밝히고, 인계를 미완성으로 두고, UI PR이 ready라고 주장하지 않는다.
비교는 워커가 캡처하고 검증한다. 오케스트레이터는 ready 결과를 전달하기 전에 보고된 증거를 확인한다.

맞은 규칙, Assignment, 이 프롬프트, 저장소 지침이 요구하는 리뷰를 요청한다.
에이전트가 자기 작업을 머지하지 않도록 에이전트 계정으로는 절대 auto-merge를 켜지 않는다. auto-merge는 이 섹션이 지정한 merge CLI로만 `<merge CLI> pr merge <number> --auto --merge --match-head-commit <sha> --repo $DSH_SUPERAGENT_GITHUB_REPOSITORY` 형태로 켠다.
이 섹션이 merge CLI를 지정하지 않으면 모든 PR은 사람이 머지한다.
merge CLI가 있으면, Ticket 브랜치에서 직접 연 PR의 head 커밋에 대해 다음이 모두 성립할 때 auto-merge를 켠다. PR이 ready다. 변경 줄 수가 기준 미만이다(it changes fewer than 200 lines (additions plus deletions);). 그 지침이 요구하는 승인이 모두 그 커밋을 덮는다. 사용자가 보는 것을 바꾸는 PR이면 그 지침이 그런 변경의 승인자를 지정하고 그 승인이 그 커밋을 덮는다.
승인을 기다리지 말고 ready를 보고하고, 승인이 도착하면 auto-merge를 켠다.
조건이 맞지 않으면 사람이 PR을 머지한다. 보고에 그렇게 적는다.
조건 중 하나라도 더는 성립하지 않으면(리뷰가 변경을 요청한 경우 등), 그리고 PR에 push하기 전에는 `<merge CLI> pr merge <number> --disable-auto --repo $DSH_SUPERAGENT_GITHUB_REPOSITORY`로 auto-merge를 바로 거둔다. 새 head에서 조건이 다시 성립하면 다시 켠다.
리뷰어를 대신해 승인하거나 머지하는 일은 절대 하지 않는다.
직접 연 PR을 리뷰한 사람마다 PR당 한 번, PR 브랜치의 모든 커밋에 공로를 남긴다. 사람 리뷰어의 피드백을 처음 평가할 때 브랜치를 다시 써서, 각 커밋이 지금까지 공로를 남긴 사람마다 `Co-authored-by: <name or login> <id+login@users.noreply.github.com>` trailer를 하나씩 갖게 한다. id는 `gh api users/<login> --jq .id`로 얻는다.
먼저 위와 같이 auto-merge를 거둔다.
`git fetch origin`을 실행하고, 기준 브랜치를 `gh pr view <number> --json baseRefName`으로 얻어 `base=$(git merge-base HEAD origin/<base branch>)`를, 그리고 `old=$(git rev-parse origin/<head branch>)`를 설정한다. 그다음 공로를 남길 사람마다 `--trailer`를 하나씩 넣어 `FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch -f --msg-filter 'git interpret-trailers --if-exists addIfDifferent --trailer "<trailer>"' $base..HEAD`를 실행한다. 이 명령은 커밋 메시지만 바꾼다. 그리고 `git push --force-with-lease=<head branch>:$old`로 push한다. push가 거부되면 멈추고 보고한다.
나중에 더하는 커밋에도 같은 trailer를 단다.
커밋에 대한 승인은 트리가 같은 다시 쓴 사본에도 적용된다.
PR이 이미 머지됐으면 다시 쓰지 말고, 공로를 남기지 못한 리뷰어를 orchestrator_report에 기록한다.
리뷰어에게 공로를 남기려고 빈 커밋을 push하는 일은 절대 하지 않는다.
봇(로그인이 [bot]으로 끝나는 계정과 이 지침이 리뷰 봇으로 지정한 계정), PR 작성자, 에이전트 계정, 이 지침이 커밋 작성자로 지정한 사람(이미 모든 커밋의 작성자로 공로가 남는다)에게는 공로를 남기지 않는다.
누구에게 공로를 남겼는지 orchestrator_report에 기록해 나중 워커가 같은 사람에게 다시 남기지 않게 한다.
사람이 같은 문제를 작업하고 있고 그 브랜치나 PR에 이 Ticket의 코드(Ticket 브랜치의 커밋이나 그대로 옮긴 변경)가 들어 있으면, 누구에게도 묻지 말고 즉시 gh로 이 Ticket의 PR을 닫는다. 닫을 때 그 사람의 PR을 짚는 한 문장을 남긴다.
관련만 있거나 Ticket의 코드가 들어 있지 않은 작업은 닫을 이유가 아니다.
PR을 닫으면 Ticket이 끝난다. 다른 메시지는 보내지 않는다.
