### Opening a PR

다른 모든 플레이북의 끝에서 호출한다.

**Worktree.** main에서 갈라진 git worktree에서 작업한다. subagent는 그것을 물려받는다. 같은 브랜치에 여러 `Task` 호출을 돌리면 각자 자기 worktree를 받거나, 호출 사이에 `git fetch && git reset --hard origin/<branch>`를 한다. 무관한 작업이 섞인 더러운 브랜치라면 patch로 빼내고, 새 worktree를 만들고, 적용한다. 엉킨 worktree라면 main에서 reset하고 최소한으로 다시 한다.

**커밋.** 아낌없이 커밋한다. PR을 열기 전에 작고 순서 있는 커밋으로 rebase한다. 각 커밋은 미래의 PR이다. 착지할 수 있어야 하고, 이야기가 읽히는 순서여야 한다. 방금 만든 커밋에 속하는 수정이면 amend한다. 분리할 수 있으면 새 커밋을 만든다.

**PR.** 커밋 전에 diff에 `cursor-team-kit`의 `/deslop`을 돌린다. 리뷰 전에 `/no-comments`를 돌린다. 모든 PR 제목, PR 설명, 커밋 본문은 `/technical-writing`으로 쓰고 `/unslop`을 적용한다. Diátaxis를 뺀 technical-writing의 모든 층을 적용한다. 동작 하나에는 단어 하나를 쓰고, 관사를 지키고, 평범한 동사로 될 때는 `-ing`를 피한다.

**제목.** `type(scope): subject` 형태의 Conventional Commits를 쓴다. type은 `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf` 중 하나다. scope에는 `pstack`이나 `poteto-mode`처럼 바뀐 영역을 쓴다. subject는 짧은 명령형으로 쓴다. 변경을 담은 실제 심벌이 있으면 그 이름을 쓴다. 예를 들면 `fix(pstack): retarget opening-a-pr babysit trigger`다. 끝에 마침표를 붙이지 않는다.

**설명.** PR 본문은 브리핑이지 실험 노트가 아니다. diff를 가진 리뷰어가 변경이 왜 있는지, 무엇이 범위 밖인지, 변경이 동작함을 어떻게 증명했는지 알 수 있어야 한다. squash 커밋 본문이 곧 PR 본문이다. 본문 때문에 squash 커밋이 대략 40줄을 넘게 되면 본문을 줄인다.

아래 절을 순서대로 쓴다. 할 말이 없는 절은 뺀다.

- `## Why`. 의도와 접근을 짧은 문단 한두 개로 적는다. SHA나 rebase 내력을 나열하지 않는다. "main 기준" 같은 서두를 붙이지 않는다.
- `## Scope`. 글머리표로 실제 심벌과 경로를 나열한다. 이름 변경이나 대상 변경은 양쪽을 다 적는다. 포함과 제외는 그 경계가 중요할 때만 적는다. 파일별 에세이를 쓰지 않는다.
- `## Tradeoffs`. 리뷰어가 안 적으면 물어볼 만한 기각된 대안만 적는다. 실제로 선택지가 없었다면 이 절을 건너뛴다.
- `## Blast Radius`. 한 문장에서 세 문장 사이로 변경이 누구 또는 무엇에 닿는지, 왜 안전하거나 위험한지 적는다. 수정 없이 main이 red로 남으면 계속 드는 비용을 적는다.
- `## Verification`. 실제로 돌린 경로마다 그 이름과 결과를 적는다. 성능 변경이라면 단위를 붙인 주요 수치 하나를 `before → after` 형태로 보고한다. 나머지 증거는 arena나 swarm 디렉터리 링크로 건다. 표본 크기 방법론, swarm 경과 낭독, 지표 표는 넣지 않는다.

이 절들 뒤에, 주장을 증명할 때 영상이나 스크린숏을 붙인다. 전체 SHA, swarm이나 arena 레인 낭독, 지렛대 수정 에세이, 파일별 체크리스트, "CLEAN" 판정은 붙이지 않는다. 이런 세부는 링크된 산출물에 둔다. `## Summary`나 `## Test plan` 같은 상투 절을 쓰지 않는다. 커밋 본문은 제목을 되풀이하지 않는다.

**Forge.** 첫 PR 작업 전에 forge를 정하고, 생성, 수정, 조회, 감시, 머지까지 그 선택을 유지한다. GitHub CLI(`gh`)가 기본이다. `command -v origin`이 성공하고 Origin이 저장소를 해석할 수 있으면 `origin pr ...`을 우선한다. Origin이 없거나 저장소를 해석하지 못하면 `gh`에 머물고 대체 경로를 썼다고 기록한다. Graphite(`gt`)를 요구하지 않는다.

**크기와 스택.** 큰 PR 하나보다 좁은 PR 다섯 개를 택한다. 스택은 base 브랜치 체인이다. root PR은 trunk를 대상으로 한다. 각 자식 브랜치는 부모의 정확한 끝에 rebase하고, 그 PR은 부모 브랜치를 대상으로 한다. 정해진 forge에 따라 `origin pr create --status open --base <parent-branch>`나 `gh pr create --base <parent-branch>`로 자식을 만든다. 기존 자식의 대상은 `origin pr edit <pr> --base <parent-branch>`나 `gh pr edit <pr> --base <parent-branch>`로 바꾼다. trunk에서 브랜치를 따는 것은 독립적인 작업일 때뿐이다. 스택 작업을 크게 하기 전에 trunk에 rebase한다.

**준비 상태.** 모든 PR은 draft가 아니라 ready로 연다. Origin에서는 `--status open`을 넘긴다. `gh`에서는 `--draft`를 뺀다. 클라우드 에이전트의 PR 도구는 기본값이 draft이므로 모든 PR 생성 호출에 `draft: false`를 설정한다. 그래도 draft로 열리면 정해진 forge에 따라 `origin pr ready <number>`나 `gh pr ready <number>`를 실행한다. PR 상태를 언급하기 전에 `origin pr view <number>`나 `gh pr view <number>`를 실행한다.

**Babysit.** PR을 연다고 babysit이 시작되지는 않는다. URL을 올리고 계속 만든다. 먼저 단계나 스택을 끝낸다. 스택 전체가 생긴 뒤 사용자가 요청할 때만 별도의 babysit 단계를 돌린다. 새 PR마다 babysit하면 빌드가 멈추고, 이후 wave가 다시 시작시킬 커밋에 체크를 낭비한다. 피드백이 의도에서 벗어나면 반박한다.

PR을 여는 subagent는 `interrogate`, `/deslop`, `/no-comments`를 돌리고 URL을 올린다. 그러고 나서 babysit 없이 부모에게 돌아간다. 단, Autopilot-full이나 Autopilot-stack의 소유자는 예외다. 그 소유자의 브리프가 babysit 루프를 맡기며, 그것이 `playbooks/babysit.md`가 기다리는 요청이다. 소유자는 code-ready 보고 뒤에 루프를 시작하고, 자기 플레이북이 정한 대로 merge-ready나 STACK-READY를 보고한다. 스택 전체가 만들어질 때까지 babysit을 미루라는 여기와 `playbooks/babysit.md`의 규칙은 그 소유자에게 적용되지 않는다.
