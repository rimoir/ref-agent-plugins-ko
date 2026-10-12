### Opening a PR

다른 모든 플레이북의 끝에서 호출한다.

**Worktree.** main에서 갈라진 git worktree에서 작업한다. subagent는 그것을 물려받는다. 같은 브랜치에 여러 `Task` 호출을 돌리면 각자 자기 worktree를 받거나, 호출 사이에 `git fetch && git reset --hard origin/<branch>`를 한다. 무관한 작업이 섞인 더러운 브랜치라면 patch로 빼내고, 새 worktree를 만들고, 적용한다. 엉킨 worktree라면 main에서 reset하고 최소한으로 다시 한다.

**커밋.** 아낌없이 커밋한다. PR을 열기 전에 작고 순서 있는 커밋으로 rebase한다. 각 커밋은 미래의 PR이다. 착지할 수 있어야 하고, 이야기가 읽히는 순서여야 한다. 방금 만든 커밋에 속하는 수정이면 amend한다. 분리할 수 있으면 새 커밋을 만든다. 커밋 본문은 제목을 되풀이하지 않는다.

**PR.** 커밋 전에 diff에 `cursor-team-kit`의 `/deslop`을 돌리고, 리뷰 전에 `/no-comments`를 돌린다. 모든 PR 제목, 설명, 커밋 본문은 `/technical-writing`으로 쓰고(Diátaxis를 뺀 모든 층을 적용하고, STE 어휘 규칙도 적용한다. 동작 하나에 단어 하나, 관사 유지, 평범한 동사로 될 때는 `-ing` 대신 그 동사), 그다음 `/unslop`을 적용한다.

**제목.** Conventional Commits `type(scope): subject`를 쓰고 끝에 마침표를 붙이지 않는다. type은 `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf` 같은 것이다. scope는 `pstack`이나 `poteto-mode` 같은 영역이다. subject는 짧은 명령형이고, 변경을 담은 실제 심벌이 있으면 그 이름을 쓴다. 예를 들면 `fix(pstack): retarget opening-a-pr babysit trigger`다.

**설명.** PR 본문은 diff를 가진 리뷰어를 위한 1분짜리 브리핑이지 실험 노트가 아니다. 변경이 왜 있는지, 무엇을 빼 두었는지, 무엇을 깨뜨릴 수 있는지, 동작함을 어떻게 증명했는지를 말한다. 식별자를 적게 쓴 짧고 쉬운 문장으로 쓰고 글을 벽처럼 쌓지 않는다. 본문이 곧 squash 커밋 본문이 되므로 그 커밋을 대략 40줄 아래로 유지한다. 굵은 글씨 머리말이 아니라 `##` 헤딩을 아래 순서로 쓰고, 할 말이 없는 절은 뺀다.

- `## Why`: 문제와 접근을 짧은 문장 1~3개로. SHA, rebase 내력, "main 기준" 같은 서두는 넣지 않는다.
- `## What changed`: 짧은 글머리표 1~3개. 실제 심벌이나 경로는 그것이 변경을 담을 때만 적는다. 이름 변경이나 대상 변경은 양쪽을 다 적는다.
- `## Scope`: 늘 넣는다. 다루는 것과 일부러 뺀 것(후속 작업, 알려진 빈틈)을 짧은 항목 1~3개로. 심벌, 경로, 파일별 에세이는 넣지 않는다.
- `## Tradeoffs`: 리뷰어가 안 적으면 물어볼 만한 기각된 대안만. 실제로 선택지가 없었다면 건너뛴다.
- `## Blast Radius`: 누구 또는 무엇에 닿는지, 왜 안전하거나 위험한지를 1~2문장으로. main이 red라면 그대로 두는 비용을 적는다.
- `## Verification`: 글머리표 1~3개. 각각 실제로 돌린 경로와 그 결과다. 성능이라면 단위를 붙인 주요 수치 하나를 `before → after`로 쓰고, 나머지는 arena나 swarm 디렉터리 링크로 건다. 표본 크기 방법론, swarm 경과 낭독, 지표 표는 넣지 않는다.

절들 뒤에, 주장을 증명할 때 영상이나 스크린숏을 붙인다. 전체 SHA, swarm이나 arena 레인 낭독, 지렛대 수정 에세이, 파일별 체크리스트, "CLEAN" 판정은 본문이 아니라 링크된 산출물에 둔다.

**Forge.** 첫 PR 작업 전에 forge를 정하고, 생성, 수정, 조회, 감시, 머지까지 그 선택을 유지한다. GitHub CLI(`gh`)가 기본이다. `command -v origin`이 성공하고 Origin이 저장소를 해석할 수 있으면 `origin pr ...`을 우선한다. Origin이 없거나 저장소를 해석하지 못하면 `gh`에 머물고 대체 경로를 썼다고 기록한다. Graphite(`gt`)를 요구하지 않는다.

**내장 PR 도구.** 실행 환경이 내장 PR 도구를 제공하면 생성, 수정, 대상 변경, ready 표시를 forge CLI가 아니라 그 도구로 한다. CLI로 만든 PR은 도구가 추적하는 것을 놓친다. 도구가 다루지 않는 일과, 그런 도구가 없는 실행의 모든 PR 작업에는 정해진 forge를 쓴다.

**크기와 스택.** 큰 PR 하나보다 좁은 PR 다섯 개를 택한다. 스택은 base 브랜치 체인이다. root PR은 trunk를 대상으로 한다. 각 자식 브랜치는 부모의 정확한 끝에 rebase하고, 그 PR은 부모 브랜치를 대상으로 한다. 내장 PR 도구가 없으면 정해진 forge에 따라 `origin pr create --status open --base <parent-branch>`나 `gh pr create --base <parent-branch>`로 자식을 만들고, 대상은 `origin pr edit <pr> --base <parent-branch>`나 `gh pr edit <pr> --base <parent-branch>`로 바꾼다. trunk에서 브랜치를 따는 것은 독립적인 작업일 때뿐이다. 스택 작업을 크게 하기 전에 trunk에 rebase한다.

**준비 상태.** 모든 PR은 draft가 아니라 ready로 연다. 내장 PR 도구는 기본값이 draft일 수 있으므로 그 도구로 하는 모든 생성 호출에 `draft: false`를 설정한다. Origin에서는 `--status open`을 넘긴다. `gh`에서는 `--draft`를 뺀다. 그래도 draft로 열리면 PR 도구로 ready 표시를 하거나, 정해진 forge에 따라 `origin pr ready <number>`나 `gh pr ready <number>`를 실행한다. PR 상태를 언급하기 전에 `origin pr view <number>`나 `gh pr view <number>`를 실행한다.

**Babysit.** PR을 연다고 babysit이 시작되지는 않는다. URL을 올리고 계속 만든다. 먼저 단계나 스택을 끝낸다. 스택 전체가 생긴 뒤 사용자가 요청할 때만 별도의 babysit 단계를 돌린다. 새 PR마다 babysit하면 빌드가 멈추고, 이후 wave가 다시 시작시킬 커밋에 체크를 낭비한다. 피드백이 의도에서 벗어나면 반박한다.

PR을 여는 subagent는 `interrogate`, `/deslop`, `/no-comments`를 돌리고 URL을 올린다. babysit 없이 부모에게 돌아간다. 단, Autopilot-full이나 Autopilot-stack의 소유자는 예외다. 그 소유자의 브리프가 babysit 루프를 맡기며, 그것이 `playbooks/babysit.md`가 기다리는 요청이다. 소유자는 code-ready 보고 뒤에 루프를 시작하고, 자기 플레이북대로 merge-ready나 STACK-READY를 보고하며, 스택 전체가 만들어질 때까지 babysit을 미루라는 여기와 `playbooks/babysit.md`의 규칙에서 빠진다.
