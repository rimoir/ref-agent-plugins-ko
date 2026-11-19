### Opening a PR

다른 모든 플레이북의 끝에서 호출한다.

trunk에서 갈라진 git worktree에서 작업하고, 무관한 작업은 거기에 들이지 않는다. 각각 착지할 수 있는 작은 커밋으로 rebase한다. 커밋 전에 diff에 `cursor-team-kit`의 `/deslop`을 돌린다.

제목은 `type(scope): subject`이고, 변경을 담은 실제 심벌이 있으면 그 이름을 쓴다. 본문은 40줄 아래의 1분짜리 브리핑이다. 아래 `##` 헤딩을 순서대로 쓰고 빈 헤딩은 뺀다. `## Why`, `## What changed`, `## Scope`, `## Tradeoffs`(리뷰어가 안 적으면 물어볼 만한 기각된 대안만), `## Blast Radius`, `## Verification`.

후속 PR은 base 브랜치로 쌓는다. PR은 실행 환경의 PR 도구로 `draft: false`를 주어 ready 상태로 연다. 그런 도구가 없으면 `--draft` 없이 `gh pr create`를 쓰고, Origin CLI가 저장소를 해석하면 `origin pr create --status open`을 쓴다. PR을 연다고 babysit이 시작되지는 않는다.
