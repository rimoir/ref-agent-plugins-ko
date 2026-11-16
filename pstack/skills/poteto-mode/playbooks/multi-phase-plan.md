### 다단계 또는 다중 PR 계획

**너는 코드가 아니라 계획을 맡는다. 계획은 owner가 칸 하나씩 실행하고 운영자(operator)가 증거로 감사하는 체크리스트다.** 산출물은 계획이다. 구현하지 않는다.

1. 변경이 파일 한두 개이고 접근법이 뻔하면 계획을 건너뛴다. 그렇다고 말하고 멈춘다.
2. 쓰기 전에 열린 질문을 프로토타입으로 정리한다. 질문마다 `playbooks/prototype.md`를 돌린다. 부록 A에 쓸 브랜치, SHA, 스크린샷을 남겨 둔다. 어떤 실행으로도 정할 수 없는 제품 판단이나 취향 문제만 운영자에게 묻는다. 선택지를 함께 준다(**never-block-on-the-human** 원칙 스킬).
3. `subagent_type: "poteto-agent"`와 Subagents 섹션에 따른 명시적 모델로 subagent를 띄워 탐색한다(**guard-the-context-window** 원칙 스킬). 각 subagent의 추론 수준과 속도(fast 또는 표준)는 Subagents 섹션에 따라 작업에 맞게 고른다. 각 subagent는 파일 포인터, 관례, 테스트 명령, 진입점을 돌려준다. 내용을 통째로 붙여 넣지 않는다.
4. 아래 골격을 계획 파일에 복사하고 모든 자리표시자를 채운다. 운영자가 경로를 지정하지 않으면 에이전트 저장소의 `docs/` 아래에 파일을 쓴다. 모든 헤딩과 하위 블록을 보이는 순서대로 유지한다. PR 하나에 섹션 하나다. PR 하나는 자체 증거를 갖춘 변경 하나다(**sequence-verifiable-units** 원칙 스킬). 실행 플레이북은 **How to read this**에 적는다. 실행이 머지해도 되면 `playbooks/autopilot-full.md`를 고른다. 운영자가 PR을 머지하면 `playbooks/autopilot-stack.md`를 고른다. 상시 프로그램은 `playbooks/orchestrate.md`를 쓴다.
5. `/technical-writing`으로 전체를 쓰고 이어서 `/unslop`을 돌린다. 본문은 Diátaxis 모드 하나, how-to다. 설명과 참조는 부록에 둔다. 헤딩마다 과업이나 발견을 적는다. 긴 대시를 쓰지 않는다. 문장 중간에 콜론을 쓰지 않는다.
6. `node pstack/skills/poteto-mode/scripts/check-plan.mjs <plan.md>`를 돌리고 출력된 줄을 모두 고친다(**encode-lessons-in-structure** 원칙 스킬).
7. 넘겨준다. 계획 경로와 스크립트 출력을 올리고 멈춘다. 실행은 운영자가 명시적으로 진행하라고 할 때, 계획이 지정한 실행 플레이북으로 시작한다.

**검증.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked(테스트만으로는 검증이 충분하지 않다. PR은 unit, live, perf 칸이 모두 체크되어야만 검증된 것이다. **prove-it-works** 원칙 스킬). 이 문장이 검증 규칙이다. 모든 검증 블록은 이 문장으로 시작한다. live 블록은 필수다. PR head에서 레인(lane) 열 개가 **swarm** 스킬에 따라 `swarm workers` 모델(기본값 `claude-opus-5-5-high-fast`)로 control skill을 써서 실제 화면을 조작한다. 레인마다 칸 하나이고, 구체적인 시나리오, 저장할 스크린샷, 통과 조건을 갖는다. 그중 하나는 **Regression lane against trunk(trunk 대비 회귀 레인)**다. 이 레인은 핵심 시나리오 하나를 trunk와 head에서 똑같이 돌린다. trunk에 해당 기능이 없으면 trunk 결과를 지어내지 말고 그 사실을 기록한 뒤, diff가 추가하는 동작과 사용자가 기다리는 최종 상태를 대신 검증한다. perf 게이트는 양쪽을 다 본다. trunk와 head 모두 지정한 지표를 내야 한다. trunk에 기능이 없으면 diff가 추가하는 작업을 따로 떼어 그 작업과 사용자가 기다리는 종단 간 상태에 절대 예산을 정한다. 서로 다른 시나리오 사이의 비율을 주장하지 않는다. perf 블록에는 지표, 교차 실행하는 측정(probe), 먼저 잰 trunk 기준선, 실패로 판정하는 수치를 담은 규칙을 적는다. 상호작용을 바꾸는 PR은 리뷰 게이트를 거친다. 운영자가 머지 전에 채팅에서 스크린샷과 영상으로 검토한다. 상호작용을 바꾸지 않는 PR은 `**Review gate.** None. <PR id> is not review-gated.`라고 쓰고 그 아래에 칸을 두지 않는다.

**Control skill.** 화면 종류로 고른다. 브라우저, Electron, 웹 UI는 `cursor-team-kit`의 `control-ui`를 쓴다. CLI와 TUI는 `cursor-team-kit`의 `control-cli`를 쓴다. 네이티브 모바일은 레포에 있는 시뮬레이터 조작 스킬을 쓴다. 두 화면을 건드리는 PR은 양쪽 모두에 레인을 둔다. control skill이 없는 화면은 부록 C의 위험 항목이고, 그래도 live 블록에는 각 레인이 그 화면을 어떻게 조작하는지 적는다.

````markdown
# <프로그램> 계획

<열 줄 미만. 무엇이 누구를 위해 바뀌는지, 프로그램이 강제하는 규칙, 순서대로 나열한 PR id.>

## How to read this

One box is one unit of work. Every box names the evidence that checks it. A nested box is a sub-step of the box above it. Check a box only when its evidence exists, a file, a log line, a screenshot, a test run, or a SHA. (칸 하나가 작업 단위 하나다. 칸마다 그 칸을 체크할 근거를 적는다. 중첩된 칸은 위 칸의 하위 단계다. 근거, 즉 파일, 로그 한 줄, 스크린샷, 테스트 실행, SHA가 있을 때만 칸을 체크한다.) 본문은 how-to다. 부록은 설명하고 기록한다.

이 프로그램은 `pstack/skills/poteto-mode/playbooks/<실행 플레이북>.md`를 따른다. <누가 머지하는지, 그리고 어떤 PR id가 merge-ready에서 멈추는 운영자 몫인지.>

Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

## Program checklist

### Arm the program (프로그램 가동)

- [ ] 운영자에게 프로토콜과 이 계획을 설명하고 멈춘다. 운영자가 명시적으로 진행하라고 할 때만 실행을 시작한다.
- [ ] 프로그램 시작 시 trunk에서 다음을 읽는다. 매 틱마다 다시 읽는다.
  - [ ] `git show origin/main:pstack/skills/poteto-mode/playbooks/<실행 플레이북>.md`
  - [ ] `git show origin/main:pstack/skills/swarm/SKILL.md`
  - [ ] `git show origin/main:<control skill 경로>`
  - [ ] `git show origin/main:pstack/skills/poteto-mode/playbooks/opening-a-pr.md`
  - [ ] `git show origin/main:pstack/skills/<프로그램이 쓰는 나머지 각 leaf 스킬>`
- [ ] 운영자가 진행하라고 하면 아래 틱 프롬프트로 감사 틱을 `/loop 1h`로 건다. 주기를 기억에 맡기지 않는다.
- [ ] 다음 틱 프롬프트를 그대로 쓴다. "trunk의 실행 플레이북을 다시 읽는다. 작업을 그에 비춰 감사하고 어긋난 점은 이번 틱에 고친다. 활성 레인을 모두 확인하고 진행 여부는 부수 효과로만 판단한다. 멈춘 레인은 내리고 대체 레인을 지금 투입한다. 그다음, 이전 상태 메시지(status message)가 보고하지 않은 추적 대상 변화를 감사에서 찾았을 때만 운영자에게 채팅으로 짧은 상태 메시지를 올린다. 열린 PR, code-ready head, 시작하거나 끝난 라운드, 판정, 머지, 멈춘 에이전트와 취한 조치, 추가되거나 해소된 블로커, 운영자만 내릴 수 있는 결정 같은 것이다. 그런 변화는 모두 적고 그 밖의 것은 적지 않는다. 표, 머지 목록, 변하지 않은 블로커를 되풀이하지 않는다. 감사에서 아무것도 찾지 못했으면 응답 텍스트 없이 턴을 끝낸다. 어느 경우든 이번 틱의 행을 결정 기록에 남긴다. 행에는 보고한 항목을, 없으면 없음을 적는다."
- [ ] 운영자가 보류하거나 중단하라고 하면 모든 owner에게 즉시 쓰기 금지 명령을 보낸다.

### Spawn owners (owner 생성)

- [ ] 실행 플레이북이 정한 전체 수명주기를 맡는 owner를 PR마다 하나씩 띄운다.
- [ ] 다음 의존 그래프를 따른다. 의존 작업은 부모가 머지된 뒤에 시작하거나, 실행 플레이북이 스택 방식이면 부모 브랜치 위에서 시작한다.
  - [ ] <PR id>와 <PR id>는 서로 독립이며 먼저 진행한다. 둘 다 `main`에서 분기한다.
  - [ ] <PR id>는 <PR id> 다음에 진행한다.
- [ ] 파일 경계를 지킨다. <PR id 또는 분류>는 `<glob>`만 건드린다.
- [ ] 리뷰 게이트를 지킨다. <PR ids>는 상호작용을 바꾼다. 머지 전에 운영자가 채팅에서 스크린샷과 영상으로 검토할 때까지 기다린다.

### PR mechanics, for every PR (모든 PR 공통 절차)

- [ ] forge를 한 번 정한다. 기본은 `gh`다. `command -v origin`이 성공하고 Origin이 레포를 찾을 수 있으면 모든 PR 작업에 `origin pr`을 쓴다. `gh`로 되돌아간 경우는 기록한다. `gt`를 요구하지 않는다.
- [ ] **Opening a PR**에 따라 PR을 draft가 아닌 ready 상태로 연다. 실행 환경에 내장 PR 도구가 있으면 그것을 쓰고, 없으면 정한 forge에 맞춰 `origin pr create --status open --base <base-branch>`나 `gh pr create --base <base-branch>`를 쓴다. 스택의 자식 PR은 부모 브랜치를 대상으로 한다.
- [ ] PR로 나가는 push 전에 레포의 lint와 typecheck를 한 번 돌린다. hook을 켠 채로 push한다.
- [ ] 커밋마다 그 전에 `/deslop`을, 리뷰 전에 `/no-comments`를 돌린다.
- [ ] Bugbot과 보안 리뷰어 코멘트는 모두 `../references/bugbot-triage.md`에 따라 분류한다.
- [ ] code-ready 보고와 babysit 전에 현재 trunk로 rebase한다. 수정 라운드 동안은 그 merge base를 유지한다. 다시 rebase하는 때는 머지 준비 단계, trunk와 `git merge-tree` 충돌이 날 때, trunk 쪽 변경 때문에 CI가 실패할 때, 같은 파일을 건드리는 알려진 동시 변경이 들어올 때뿐이다.

### Verdict and merge, for every PR (모든 PR 공통 판정과 머지)

- [ ] 전체 swarm은 code-ready head에서 한 번 돈다. 새 동작, 재설계, 큰 새 diff가 있을 때만 전체 swarm을 다시 돌린다. rebase, 머지 충돌 해결, 작은 수정은 새 head에서 검증자 하나만 받고, 문구만 바꾼 변경은 검증자를 받지 않는다. 전체 swarm은 매번 `pstack/skills/swarm/SKILL.md`에 따라 돌린다. gates 레인 하나. PR의 **Verify, live** 블록에 있는 live 레인 열 개. **Verify, perf** 블록에 있는 perf 레인. 각자 초점이 다른 감사 레인 둘 이상은 diff와 영수증(receipt)을 읽고 PR 본문을 믿지 않는다. 루트는 판정 전에 merge-ready 보고의 영수증을 감사한다.
- [ ] 모든 발견을 실행 플레이북의 막기 규칙으로 판단한다. 막는 발견이 없으면 판정은 깨끗하다. `Regression lane against trunk.`로 표시한 레인에서 trunk 동작이 실패하면 trunk 쪽 문제로 기록하고 PR을 막지 않는다. 새 head는 새 판정을 받는다. 단 `playbooks/shipping.md`의 patch-id 규칙에 따라 유효한 결과는 그대로 둔다.
- [ ] <실행 플레이북의 머지 또는 인계 규칙과 `playbooks/shipping.md`의 patch-id 규칙.>

### Boot recipe, for every live lane (모든 live 레인 공통 부팅 절차)

live 레인은 각자 PR head에서 자기 클라우드 VM으로 돈다. `cursor-team-kit`의 `control-ui`나 `control-cli`로 조작한다.

- [ ] `git fetch origin <head-branch> && git checkout <head SHA>`.
- [ ] <백엔드와 화면을 띄운다. 준비될 때까지 기다린다.>
- [ ] <입력은 control skill 명령으로만 넣는다. 읽기 전용 진단 수단을 적는다.>
- [ ] 스크린샷은 모두 `/tmp/swarm-<pr-id>/worker-<n>/<slug>.png`에 저장하고 보고와 함께 경로를 돌려준다.

## <동사구로 쓴 과업> (<PR id>)

**Depends on.** <PR id 또는 None.>

**Files.**

- [ ] `<path>`를 수정한다.
- [ ] `<path>`를 만든다.
- [ ] `<path>`를 삭제한다.

**Build.**

- [ ] <변경 하나. 심볼과 파일을 적는다.>

**You see.**

- [ ] <관찰 가능한 결과 하나와 정확한 로그 줄이나 화면 상태.>

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] <테스트 파일과 추가되는 케이스.> `<command>`를 돌린다.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `<swarm workers model>` at the PR head, per the boot recipe.

- [ ] Lane 1. Regression lane against trunk. <핵심 시나리오 하나>를 trunk와 head에서 돌린다. trunk에 기능이 없으면 그 사실을 기록하고 <diff가 추가하는 동작과 사용자가 기다리는 최종 상태>를 검증한다. Save `<slug>.png`. Pass when <통과 조건>.
- [ ] Lane 2. <시나리오.> Save `<slug>.png`. Pass when <통과 조건>.
- [ ] Lane 3. <시나리오.> Save `<slug>.png`. Pass when <통과 조건>.
- [ ] Lane 4. <시나리오.> Save `<slug>.png`. Pass when <통과 조건>.
- [ ] Lane 5. <시나리오.> Save `<slug>.png`. Pass when <통과 조건>.
- [ ] Lane 6. <시나리오.> Save `<slug>.png`. Pass when <통과 조건>.
- [ ] Lane 7. <시나리오.> Save `<slug>.png`. Pass when <통과 조건>.
- [ ] Lane 8. <시나리오.> Save `<slug>.png`. Pass when <통과 조건>.
- [ ] Lane 9. <시나리오.> Save `<slug>.png`. Pass when <통과 조건>.
- [ ] Lane 10. <시나리오.> Save `<slug>.png`. Pass when <통과 조건>.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. <trunk와 head 양쪽에서 재는 것. trunk에 기능이 없으면 diff가 추가하는 작업과 사용자가 기다리는 종단 간 상태도 적는다.>
- [ ] Probe. <trunk와 head에서 번갈아 돌리는 명령이나 절차. 양쪽 모두 지표를 내야 한다.>
- [ ] Baseline. trunk <값>을 먼저 기록한다.
- [ ] Rule. <trunk 대비 head, 그리고 실패로 판정하는 수치. 시나리오가 다르면 잘못된 비율 대신 diff가 추가하는 작업과 사용자에게 보이는 최종 상태에 절대 예산을 둔다.>

**Review gate.** 운영자가 머지 전에 검토한다.

- [ ] 레인 <n>의 screenshot(스크린샷)을 `<media path>/<pr-id>-review-<slug>.png`로 복사한다.
- [ ] 레인 VM에서 변경을 담은 30~60초짜리 video(영상)를 녹화한다. `<media path>/<pr-id>-review.mp4`로 저장한다.
- [ ] 채팅에 스크린샷과 영상을 올린다. merge-ready에서 멈춘다. operator(운영자)가 클릭할 때까지 기다린다.

**Merge.**

- [ ] 정확한 head SHA에서 루트가 깨끗하다고 판정했다.
- [ ] Bugbot 분류를 마쳤다.
- [ ] 판정 뒤 현재 trunk로 rebase했고 patch-id는 그대로다.
- [ ] <owner가 자기 PR을 squash-merge하거나, 루트가 base-branch 스택에 append하고 운영자가 아래부터 차례로 머지한다.>

## Close the program

- [ ] 위의 모든 칸이 근거와 함께 체크되었다.
- [ ] 실행 플레이북이 정한 보고로 운영자에게 답한다.

## Appendix A. Prototype evidence (프로토타입 증거)

<프로토타입이 답한 열린 질문마다 브랜치, SHA, 산출물 링크. 증명되지 않은 채 남은 질문.>

## Appendix B. 기각한 대안

<검토한 접근법마다 왜 밀렸는지.>

## Appendix C. 위험

<위험마다 그것이 들어가는 PR과 owner가 지켜볼 것.>

## Appendix D. 링크와 읽을거리

<수정 전에 읽을 문서. 어느 PR에 `pstack/skills/interrogate/SKILL.md`를 쓰는지. `pstack/skills/show-me-your-work/SKILL.md`에 따른 기록.>
````

**답변:** 계획 경로, 의존 관계와 리뷰 게이트 대상을 포함한 PR id 목록, 프로토타입이 증명한 것과 증명되지 않은 채 남은 것, 검사 스크립트 출력.
