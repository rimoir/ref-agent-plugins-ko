# pstack

나는 [poteto](https://x.com/poteto)다. 대표도 CEO도 아니지만 Meta, Netflix, Cursor에서 수백만 줄의 코드를 다뤄 왔다. react 코어 팀에도 있으면서 react compiler를 만들고 유지보수하는 일을 돕고 있다.

AI가 슬롭(slop) 코드를 너무 많이 쓴다는 인식이 점점 커지고 있다. 나도 동의한다. 슬롭을 찍어 내는 스무 명짜리 팀처럼 출시하고 싶지는 않다. 품질 없는 처리량은 내가 지향하는 목표가 아니다. 빨리 가고 싶다면 먼저 깊이 들어가라.

**pstack은 내 답이다.** 이것들은 내가 Cursor에서 고품질 코드를 출시할 때 매일 쓰는 바로 그 스킬이다. cursor를 진짜 엔지니어링 팀으로 바꿔 준다. 목표는 코드 줄 수를 최대화하는 것이 아니다. 사실 정반대다. pstack은 더 적지만 더 품질 높은 코드를 쓰게 돕는다.

**pstack은 두려움 없는 병렬성을 준다.** 에이전트 하나를 깊이 파고들게 하고 그 에이전트가 검증 가능한 좋은 코드를 쓴다고 믿을 수 있다면, 자신 있게 진짜로 병렬화할 수 있다. 여러 에이전트를 `poteto-mode`로 띄우고, 각자 작업에 엄격한 엔지니어링 원칙을 적용하리라 믿으면 된다.

**cursor는 모든 장점을 한데 모아 준다.** 프런티어 모델마다 강점과 약점이 있다. pstack에는 어떤 모델이든 쓸 수 있다. 실제로 내 스킬 상당수는 각 모델의 고유한 강점을 살리려고 여러 모델을 함께 쓰는 워크플로를 사용한다.

포크하라. 개선하라. 자기 것으로 만들어라. PR은 언제든 환영한다!

## 설치

```bash
/add-plugin pstack
```

claude code에서는 다음과 같다.

```bash
/plugin marketplace add cursor/plugins
/plugin install pstack@cursor-plugins
```

claude code는 플러그인 명령과 에이전트 이름 앞에 접두어를 붙인다. 그래서 `/poteto-mode`는 `/pstack:poteto-mode`가 된다. 나머지 cursor 이름은 [claude code 어댑터](./docs/harness/claude-code.md)가 모두 대응시킨다. claude code에서 `/pstack:setup-pstack`은 모델 선택을 `~/.claude/rules/pstack-models.md`에 쓴다. bugbot이나 automations처럼 cursor 전용 기능이 필요한 단계는 한 줄 메모를 남기고 건너뛴다.

claude code는 이 readme와 가이드까지 포함한 pstack의 생성 사본을 저장소 루트의 [`harness/pstack/`](https://github.com/cursor/plugins/tree/main/harness/pstack)에서 설치한다. pstack을 바꾼 뒤에는 저장소 루트에서 `node scripts/generate-pstack-harness-trees.mjs`를 실행하고 결과를 커밋한다. 생성 사본이 낡아 있는 동안에는 ci가 실패한다.

## 시작하기

두 단계다.

1. [`/setup-pstack`](./skills/setup-pstack/SKILL.md)을 실행해 추론 예산을 정하고 쓰고 싶은 모델을 고른다.
2. 엄격함이 필요한 일을 할 때마다 [`/poteto-mode`](./skills/poteto-mode/SKILL.md)를 쓴다.

처음이라면 [pstack 가이드](./docs/guide/README.md)가 설정과 프롬프트 작성부터 검증, 밤샘 실행까지 첫 실전 작업을 차근차근 안내한다. 막혔거나 어떤 스킬이 맞는지 모르겠다면 [`/poteto-help`](./skills/poteto-help/SKILL.md)에 물어보라.

이게 전부다. 나머지 스킬은 상황에 따라 쓰며, 모드 스킬이 필요할 때 알아서 사용한다. 기본 설정에서 모드는 모델의 강점에 따라 일을 나눈다. 코드 위임(feature, refactoring, bug fix, perf, hillclimb)은 grok에 가고, 가장 어려운 변경과 산문, 판단은 opus 5.5에 간다. 기본 패널은 opus 5.5 / grok이다. [`/setup-pstack`](./skills/setup-pstack/SKILL.md)으로 무엇이든 바꿀 수 있다.

## 사용법

작업을 시작할 때 [`/poteto-mode`](./skills/poteto-mode/SKILL.md)를 쓴다. 요청을 읽고 플레이북(playbook) 묶음 중 하나를 고른 뒤, 단계에 필요한 다른 스킬을 실행한다.

작업을 입력하기 전에 `/` 메뉴에서 `/poteto-mode`를 고른다. 그래야 cursor가 그 스킬을 메시지에 붙인다.

### 그냥 [`/poteto-mode`](./skills/poteto-mode/SKILL.md)를 써라

이 스킬이 주된 지름길이다. 에이전트에게 엄격한 엔지니어링 작업을 맡겨야 할 때마다 쓴다. 플레이북 스물세 개가 함께 들어 있다.

```
/poteto-mode 이 PR에 미묘한 버그가 있어. 가만히 둬도 750ms마다 스크롤이 밀려. 먼저 재현하고
고친 다음 검증해 줘.
```

```
/poteto-mode 나 이제 잔다. CI가 흔들려도 스택을 랜딩해 줘. 아침까지 전부 머지돼 있으면
좋겠어.
```

<details>
<summary>플레이북 스물세 개</summary>

| 플레이북 | 용도 |
|---|---|
| [investigation](./skills/poteto-mode/playbooks/investigation.md) | 읽기 전용 질문. x는 어떻게 동작하나, y는 왜 이렇게 만들었나, 확실한가. |
| [bug fix](./skills/poteto-mode/playbooks/bug-fix.md) | 결함을 재현하고 근본 원인을 찾아 런타임 증거와 함께 고친다. |
| [perf](./skills/poteto-mode/playbooks/perf-issue.md) | 측정된 느림을 추적하고 기준선 대비 개선한다. |
| [hillclimb](./skills/poteto-mode/playbooks/hillclimb.md) | 목표치를 두고 지표 하나를 꾸준히, 과학적으로 개선한다. 전후 측정으로 가설을 반복 검증하고, 채택한 개선마다 커밋 하나를 남긴다. |
| [runtime forensics](./skills/poteto-mode/playbooks/runtime-forensics.md) | 계측 데이터로 살아 있는 증상(누수, 유휴 CPU 스핀, 글리치)을 진단한다. |
| [trace forensics](./skills/poteto-mode/playbooks/trace-forensics.md) | 캡처한 프로파일링 산출물(cpuprofile, trace, spindump, heap snapshot)을 진단한다. |
| [feature](./skills/poteto-mode/playbooks/feature.md) | 이름 붙인 데이터 형태에서 출발해 새 동작이나 바뀐 동작을 만든다. |
| [refactoring](./skills/poteto-mode/playbooks/refactoring.md) | 동작은 그대로 두고 구조나 형태만 바꾼다. |
| [prototype](./skills/poteto-mode/playbooks/prototype.md) | 설계나 동작 결정을 싸게 내리거나 경험적 갈림길을 직접 관찰해 정리하려고 만드는 일회용 스케치. |
| [visual parity](./skills/poteto-mode/playbooks/visual-parity.md) | 두 구현 사이의 픽셀 단위 UI 동등성. |
| [authoring a skill](./skills/poteto-mode/playbooks/authoring-a-skill.md) | SKILL.md 작성이나 수정. |
| [eval](./skills/poteto-mode/playbooks/eval.md) | 스킬이나 프롬프트 변경이 에이전트 행동에 주는 영향을 블라인드로 테스트한다. |
| [babysit](./skills/poteto-mode/playbooks/babysit.md) | PR이나 스택을 머지 가능한 상태로 끌고 간다. 충돌, 리뷰 스레드, CI. |
| [shipping](./skills/poteto-mode/playbooks/shipping.md) | 초록불 스택을 독립적으로 검증한 뒤, 검증된 연속 구간을 아래에서부터 올리며 반영한다. 기본은 github이고 가능하면 origin을 쓴다. |
| [autonomous run](./skills/poteto-mode/playbooks/autonomous-run.md) | 긴 작업을 멈추지 않고 끝까지 몰고 간다. |
| [orchestrate](./skills/poteto-mode/playbooks/orchestrate.md) | 코디네이터 채팅 하나에 맡기는 상시 프로젝트. 며칠에 걸치고, 쌓인 PR이 많고, subagent 무리를 부린다. |
| [autopilot-full](./skills/poteto-mode/playbooks/autopilot-full.md) | 독립 PR들을 머지까지 몰고 간다. PR마다 담당자 하나를 둔다. 코드가 준비된 head는 스웜(swarm)이 검증하고, 그 뒤 패치가 바뀔 때마다 새로 확인한다. |
| [autopilot-stack](./skills/poteto-mode/playbooks/autopilot-stack.md) | 운영자가 리뷰하고 반영할 선형 base-branch 스택 하나를 만들고 검증한다. |
| [session pickup](./skills/poteto-mode/playbooks/session-pickup.md) | 이전 에이전트가 진행 중이던 작업을 재개하거나 넘겨받는다. |
| [pause safely](./skills/poteto-mode/playbooks/pause-safely.md) | 진행 중인 작업을 나중에 재개할 수 있게 깔끔하게 멈춘다. |
| [multi-phase plan](./skills/poteto-mode/playbooks/multi-phase-plan.md) | 여러 단계나 쌓인 PR에 걸친 작업. |
| [worktree cleanup](./skills/poteto-mode/playbooks/worktree-cleanup.md) | 머지됐거나 버려진 worktree와 오래된 iOS 시뮬레이터를 정리해 디스크를 되찾는다. 안전 관문이 있다. |
| [opening a pr](./skills/poteto-mode/playbooks/opening-a-pr.md) | 순서 있는 작은 커밋들로 준비된 PR을 연다. 제목은 conventional commits 형식, 본문은 브리핑 형식이다. 다른 모든 플레이북의 끝에서 호출된다. |

</details>



호출하면 다음을 한다.

1. 작업을 [플레이북](./skills/poteto-mode/playbooks/)에 맞추고 todo 목록을 연다. 첫 항목들은 플레이북 단계를 그대로 옮긴 것이다.
2. 단계가 실행될 때마다 다른 스킬로 넘긴다.
3. 사용자와 유지보수자를 염두에 두고 슬롭 없는 답을 쓴다.

전체 규칙과 플레이북은 [`skills/poteto-mode/SKILL.md`](./skills/poteto-mode/SKILL.md)에 있다.

[`/poteto-mode`](./skills/poteto-mode/SKILL.md)를 턴이 바뀌어도 켜 두려면 `/` 메뉴에서 고른 뒤 enter 대신 option+enter(mac)나 alt+enter(windows)를 누른다. 그러면 [커스텀 모드](https://cursor.com/docs/skills#using-a-skill-as-a-custom-mode)가 되는데, cursor는 이를 agents 창과 cli에서 제공한다. 커스텀 모드는 모드에서 나올 때까지 매 턴 컨텍스트에 남는다. 그냥 enter를 누르면 메시지 하나에만 붙는다.

[`/poteto-mode`](./skills/poteto-mode/SKILL.md)는 cursor의 `/loop` 명령과 아주 잘 맞는다. 엄격함을 희생하지 않고 cursor를 몇 시간이고 일하게 할 수 있다.

## 스킬

[`/poteto-mode`](./skills/poteto-mode/SKILL.md)는 단계에 필요할 때 이 스킬 대부분을 대신 실행한다(`how`, `why`, `architect`, `arena`, `swarm`, `interrogate`, `unslop`, `no-comments`, `technical-writing`, `tdd`, 그리고 원칙들). 아래 표는 하나를 직접 쓰고 싶을 때를 위한 것이다.

```
/how 실행은 어떻게 취소해? 취소할 실행을 하나씩 조회할 때 n+1이 생기나?
```

```
/interrogate 이 PR 리뷰해 줘.
```

<details>
<summary>전체 스킬</summary>

| 스킬 | 쓰는 때 |
|---|---|
| [`/poteto-mode`](./skills/poteto-mode/SKILL.md) | 사소하지 않은 모든 작업의 기본 진입점. |
| [`/poteto-help`](./skills/poteto-help/SKILL.md) | pstack이 처음이거나 어떤 스킬, 플레이북, 원칙이 맞는지 모를 때. 무엇을 하려는지 알아낸 뒤 그 부분에 답하고, 입력할 프롬프트를 건넨다. `/poteto-help`를 입력할 때만 실행된다. |
| [`/in-your-own-words`](./skills/in-your-own-words/SKILL.md) | 에이전트가 시작하기 전에 내 목표와 문제를 다시 말해 주기를 바랄 때. `/in-your-own-words`를 입력할 때만 실행된다. |
| [`/sharpen`](./skills/sharpen/SKILL.md) | 보내기 전에 프롬프트를 더 크게가 아니라 더 깊게 만들고 싶을 때. 최고 전문가라면 내가 요청하지 않았어도 할 일, 그들이 출발점으로 삼을 원자료, 그들의 방법과 도구, 결과가 맞는지 바깥에서 확인하는 수단을 담는다. 다시 쓴 프롬프트를 돌려주고 내 선택은 열어 둔다. 작업 자체는 하지 않는다. `/sharpen`을 입력할 때만 실행된다. |
| [`/how`](./skills/how/SKILL.md) | 하위 시스템이 어떻게 동작하는지 차근차근 설명을 듣고 싶을 때. |
| [`/why`](./skills/why/SKILL.md) | 무언가가 왜 이렇게 만들어졌는지 알고 싶을 때. 실행 시점에 사용 가능한 MCP를 찾아 증거 범주(소스 관리, 이슈 트래커, 장문 문서, 실시간 채팅, 인프라 관측, 에러 추적, 분석 웨어하우스)마다 병렬로 조회한다. |
| [`/recall`](./skills/recall/SKILL.md) | 작업을 시작하거나 재개하면서, 한 주제에 대한 최근 맥락을 자기 채팅 기록과 공유 기록에서 다시 세워 짧은 현재 상태 브리핑으로 받고 싶을 때. |
| [`/ketchup`](./skills/ketchup/SKILL.md) | 내 마지막 메시지 이후 이 채팅에서 바뀐 것을 쉬운 말과 작은 시각 자료로 받고, 나를 기다리는 항목을 빠짐없이 답변만 보고 결정할 수 있게 받고 싶을 때. 그 때문에 답변이 길어져도 괜찮다. |
| [`/blast-radius`](./skills/blast-radius/SKILL.md) | 작아 보이는 변경이 무엇을 더 망가뜨릴 수 있는지 알고 싶을 때. 안전하다는 근거가 되는 사실 하나를 주장이 아니라 실행한 코드로 증명한다. |
| [`/architect`](./skills/architect/SKILL.md) | 함수 경계를 넘는 코드를 쓰기 직전에 호출자의 사용법, 타입, 모듈 형태를 먼저 정하고 싶을 때. |
| [`/arena`](./skills/arena/SKILL.md) | 같은 일을 N번 병렬로 시도하고 각각에서 가장 좋은 부분을 가져오고 싶을 때. |
| [`/swarm`](./skills/swarm/SKILL.md) | 서로 다른 조각이나 경합 대상에 N개의 작업자를 병렬로 붙이고 보고서 하나로 모으고 싶을 때. |
| [`/interrogate`](./skills/interrogate/SKILL.md) | diff가 있고 다른 모델들이 엄격한 코드 품질 관점까지 동원해 그것을 깨 보게 하고 싶을 때. |
| [`/automate-me`](./skills/automate-me/SKILL.md) | 자기가 실제로 일해 온 방식으로 초안을 잡은 자기만의 `-mode` 스킬을 원할 때. |
| [`/make-bot-ui`](./skills/make-bot-ui/SKILL.md) | 버튼이 webhook으로 Grok Bot을 깨우는 페이지나 대시보드를 원할 때. sender-key 전달과 Tailscale까지 포함한다. |
| [`/setup-pstack`](./skills/setup-pstack/SKILL.md) | pstack이 역할별로 쓸 모델을 고르고 싶을 때. 쓸 수 있는 모델을 감지하고 설정 rule을 쓴다. |
| [`/reflect`](./skills/reflect/SKILL.md) | 긴 작업이 반영됐고 그 레시피를 스킬 수정으로 남기고 싶을 때. |
| [`/correct`](./skills/correct/SKILL.md) | 에이전트가 같은 실수를 반복해 계속 바로잡고 있을 때. 기록에서 실수 유형을 캐내 각각을 통하는 가장 높은 수준에서 고치고(아키텍처, 그다음 타입과 lint와 ci, 그다음 테스트, 문서는 마지막), 규칙마다 그것을 강제하는 수단을 짝지은 표를 유지한다. |
| [`/teach`](./skills/teach/SKILL.md) | 변경이나 하위 시스템을 요약으로 끝내지 않고 정말로 이해하고 싶을 때. how와 why를 실행하고 다이어그램을 하나씩 쌓아 가며 쉬운 설명 하나로 엮는다. |
| [`/tdd`](./skills/tdd/SKILL.md) | 버그를 고치는데 값싼 로컬 테스트 경로가 있을 때. 실패하는 테스트를 먼저 쓰고 그다음에 고친다. |
| [`/benchmark-checklist`](./skills/benchmark-checklist/SKILL.md) | 벤치마크를 돌렸거나 속도 향상이나 회귀를 측정했을 때. 보고하거나 그에 따라 행동하기 전에 그 숫자를 점검한다(병목, 튜닝, 오류, 반복 실행, end-to-end 관련성). |
| [`/no-comments`](./skills/no-comments/SKILL.md) | 리뷰 전에 주석을 걷어 낸다. Comment Sicko를 띄우고, 받아들인 지적을 고치고, 주석이 주장하던 제약을 코드로 표현할 방법을 제안한다. |
| [`/typescript-best-practices`](./skills/typescript-best-practices/SKILL.md) | typescript를 읽거나 고칠 때. 타입 시스템 규율 원칙을 문법 수준에서 구체화한다. |
| [`/figure-it-out`](./skills/figure-it-out/SKILL.md) | 번들된 플레이북 중 맞는 것이 없을 때. 작업에 맞는 엄격하고 감사 가능한 플레이북을 설계한다. |
| [`/show-me-your-work`](./skills/show-me-your-work/SKILL.md) | 리뷰할 수 있는 결정 기록을 원할 때. 결정을 커밋 가능한 tsv에 남긴다. |
| [`/create-verification-skill`](./skills/create-verification-skill/SKILL.md) | 프로젝트에 앱 동작을 증명하는 스크립트화된 방법이 없을 때. 언어나 플랫폼에 상관없이 기능 지도(feature map)를 갖춘 프로젝트 로컬 verify 스킬을 만든다. |
| [`/maintain-verification-skill`](./skills/maintain-verification-skill/SKILL.md) | verify 스킬의 기능 지도가 앱과 어긋났을 때. 소스 웨이브와 라이브 확인 한 번을 거쳐, 증명된 수정만 담은 PR을 많아야 하나 만든다. |
| [`/create-formal-verification-skill`](./skills/create-formal-verification-skill/SKILL.md) | 레이스, 재시도, 상태 기계, 파서, unsafe 코드를 깨뜨리는 경우에 테스트가 닿지 못할 때. 속성 하나를 맞는 도구로 검증하고, 변경마다 다시 확인하는 프로젝트 로컬 스킬을 만든다. |
| [`/maintain-formal-verification-skill`](./skills/maintain-formal-verification-skill/SKILL.md) | 형식 검증이 다루는 코드가 마지막 확인 뒤에 바뀌었을 때. 모델, 하네스, 속성을 코드에 맞게 고치고 다시 돌린 뒤, 실패마다 검증이 어긋난 것인지 코드의 버그인지 말한다. |
| [`/unslop`](./skills/unslop/SKILL.md) | 글을 다듬을 때. AI 티를 없앤다. |
| [`/bro`](./skills/bro/SKILL.md) | 직전 메시지를 전문 용어 없이 평범한 사람 말로 다시 듣고 싶을 때. |
| [`/technical-writing`](./skills/technical-writing/SKILL.md) | 문서, RFC, readme, PR 설명, 커밋 메시지를 위한 계층형 문서 표준(Diátaxis + Google developer style + STE + Global English). |

</details>



### 예시

나는 대개 작업을 시작할 때 [`/poteto-mode`](./skills/poteto-mode/SKILL.md)를 입력하고 플레이북으로 넘기게 둔다. 다른 스킬은 단계에 필요할 때 실행된다. 몇 개는 직접 꺼내 쓴다.


<details>
<summary>전체 예시</summary>

```
버그 수정:         /poteto-mode 이 PR에 미묘한 버그가 있어. 가만히 둬도 750ms마다 스크롤이 밀려.
                   먼저 재현하고 고친 다음 검증해 줘.
성능:              /poteto-mode 가상화했는데도 큰 목록이 뜨는 데 1~2초 걸려. CPU 트레이스를
                   떠서 이유를 알려 줘.
기능:              /poteto-mode 작은 기능을 피처 플래그 뒤에 만들어 줘. 진짜 동작하는지 검증해.
프로토타입:        /poteto-mode 비교할 수 있게 마크다운 렌더러 프로토타입을 두 개 만들어 줘.
                   하나당 에이전트 하나씩 띄워.
다단계:            /poteto-mode 이 스킬들을 플러그인으로 오픈소스화해 줘. 내부 정보는 하나도
                   새면 안 되고, 임시 디렉터리에서 작업하고, 의존성 그래프부터 보여 줘.
밤샘 실행:         /poteto-mode 나 이제 잔다. CI가 흔들려도 스택을 랜딩해 줘. 아침까지 전부
                   머지돼 있으면 좋겠어.
지켜보기:          /poteto-mode PR 123 상태 확인해 줘. 남은 거 있어?
시각 일치:         /poteto-mode 이 플래그를 켜면 행 간격이 너무 넓어. 두 번째 이미지가 맞는
                   거야. 똑같아질 때까지 재현하고 고쳐.
figure it out:     /poteto-mode 나 잠깐 자리 비운다. 동기 store를 쓰는 호출부를 전부 새 비동기
                   store로 옮겨 줘. 동작은 그대로 유지하고. 돌아왔을 때 제대로 됐다고 믿을 수
                   있으면 좋겠어.
how:               /how 실행은 어떻게 취소해? 취소할 실행을 하나씩 조회할 때 n+1이 생기나?
why:               /why 이 피처 플래그는 왜 아직 안 켜졌어?
architect:         이 계측을 신호는 크고 오탐은 없게 설계해 줘. 먼저 /architect 로 잡아.
arena:             /arena 내 프롬프트를 그대로 아레나에 넘겨. 다른 모델 제안을 네 것과 비교하고
                   싶어.
swarm:             /swarm packages/ 아래 패키지마다 check.sh로 검사해 줘. 패키지당 워커 하나,
                   보고서는 하나로.
interrogate:       /interrogate 이 PR 리뷰해 줘.
tdd:               /tdd implement
unslop:            새로 바꾼 부분 unslop 하고 좀 다듬어 줄래?
reflect:           /reflect 너무 오래 걸렸다. 다음 실행에서 되풀이하지 않게 배운 걸 남겨.
correct:           /correct
show-me-your-work: /show-me-your-work 돌아와서 검토할 수 있게 결정 기록을 남겨 줘.
automate-me:       /automate-me
help:              /poteto-help 이 브랜치 리뷰하려면 어떤 스킬을 써야 해?
```

</details>

## `poteto-agent`와 Comment Sicko subagent

[`/poteto-mode`](./skills/poteto-mode/SKILL.md)는 그것을 받은 채팅에서 돈다. 플레이북, 할 일 목록, 모든 subagent 생성은 그 채팅이 맡는다.

pstack은 실행 중에 띄우는 위임 subagent의 래퍼로 [`subagent_type: "poteto-agent"`](./agents/poteto-agent.md)도 제공한다. 이 subagent는 어떤 작업이든 시작하기 전에 인라인 원칙 색인을 포함해 `poteto-mode` 전체를 읽는다. `generalPurpose`로 바꿔 쓰면 이 읽기를 건너뛰고 스타일이 흐트러진다. 플레이북 자체를 돌리려고 `poteto-agent`를 띄우지 않는다.

[`/poteto-mode`](./skills/poteto-mode/SKILL.md)와 [`subagent_type: "poteto-agent"`](./agents/poteto-agent.md)는 같은 래퍼를 거친다.

pstack은 [Comment Sicko](./agents/comment-sicko.md)도 함께 제공한다. `subagent_type: "comment-sicko"`로 쓸 수 있는 읽기 전용 주석 리뷰어다. 보통은 직접 부르지 않고 [`/no-comments`](./skills/no-comments/SKILL.md)를 거쳐 호출한다.

## 원칙

원칙 하나에 짧은 스킬 하나씩, 모두 스물네 개다. `poteto-mode`는 이를 인라인으로 색인해 두고 작업을 시작할 때 그 색인을 읽는다. 독립 파일이 있는 이유는 다른 스킬이 원칙을 이름으로 참조할 수 있게 하고, 색인이 각 원칙의 전체 규칙을 가리킬 수 있게 하기 위해서다.

<details>
<summary>원칙 스물네 개</summary>

| 원칙 | 그룹 | 규칙 |
|---|---|---|
| [laziness-protocol](./skills/principle-laziness-protocol/SKILL.md) | core | 삭제, 그리고 문제를 푸는 가장 작은 변경 쪽으로 기운다. |
| [foundational-thinking](./skills/principle-foundational-thinking/SKILL.md) | core | 로직을 쓰기 전에 적용한다. 핵심 타입과 자료구조를 고르고, 뼈대 작업과 기능 작업의 순서를 정하고, 동시에 움직이는 주체들이 무엇을 공유하는지 묻는다. 자료구조를 제대로 잡으면 그 뒤 코드는 자명해진다. |
| [redesign-from-first-principles](./skills/principle-redesign-from-first-principles/SKILL.md) | core | 요구사항을 덧대지 말고, 그것이 첫날부터 기초 가정이었던 것처럼 다시 설계한다. |
| [attack-the-premise](./skills/principle-attack-the-premise/SKILL.md) | core | 같은 전제를 공유하는 수정 둘 이상이 같은 관문에서 실패했을 때 적용한다. 그 전제를 가정하는 수정을 또 쓰기 전에 전제를 적어 두고 직접 검증한다. |
| [subtract-before-you-add](./skills/principle-subtract-before-you-add/SKILL.md) | core | 죽은 무게, 중복 검증기, 스텁 참조를 먼저 걷어 내고 더 단순해진 바탕 위에 쌓는다. |
| [minimize-reader-load](./skills/principle-minimize-reader-load/SKILL.md) | core | 질문과 답 사이의 층수와 읽는 사람이 머릿속에 들고 있어야 하는 숨은 상태를 센다. 호출자가 하나뿐인 래퍼는 접고 가변 범위는 줄인다. |
| [outcome-oriented-execution](./skills/principle-outcome-oriented-execution/SKILL.md) | core | 단계 경계가 명시된 계획된 재작성과 마이그레이션에 적용한다. 목표 아키텍처로 수렴하고, 버릴 호환 코드로 매끄러운 중간 상태를 지키려 하지 않는다. |
| [experience-first](./skills/principle-experience-first/SKILL.md) | core | 구현의 편의보다 사용자의 즐거움을 고른다. 거친 기능 여럿보다 다듬은 기능 몇 개를 출시한다. |
| [exhaust-the-design-space](./skills/principle-exhaust-the-design-space/SKILL.md) | core | 확정하기 전에 경쟁하는 프로토타입 2~3개를 만들어 나란히 비교한다. |
| [build-the-lever](./skills/principle-build-the-lever/SKILL.md) | core | 대량 작업뿐 아니라 사소하지 않은 모든 작업에 적용한다. 수정, 마이그레이션, 분석, 확인. 손으로 하는 대신 그 일을 해 주거나 증명해 주는 도구(codemod, 스크립트, 생성기, subagent가 따르는 스킬)를 만든다. 도구는 리뷰어가 다시 돌려 볼 수 있는 산출물이다. |
| [model-the-domain](./skills/principle-model-the-domain/SKILL.md) | architecture | 흩어진 조건문 대신 구조에 도메인을 담는다. |
| [boundary-discipline](./skills/principle-boundary-discipline/SKILL.md) | architecture | 방어 코드는 시스템 경계(CLI, 설정, 네트워크, 외부 API)에 모은다. 내부 타입은 믿고 비즈니스 로직은 순수 함수에 둔다. |
| [type-system-discipline](./skills/principle-type-system-discipline/SKILL.md) | architecture | 불가능한 상태는 표현할 수 없게 만들고, 의미 있는 원시값에는 브랜드를 붙이고, 외부 데이터는 경계에서 파싱하고, 변형을 빠짐없이 다루고, 권위 있는 스키마에서 파생한다. |
| [make-operations-idempotent](./skills/principle-make-operations-idempotent/SKILL.md) | architecture | 이전 실행이 중간에 끝났더라도 같은 최종 상태로 수렴한다. |
| [migrate-callers-then-delete-legacy-apis](./skills/principle-migrate-callers-then-delete-legacy-apis/SKILL.md) | architecture | 호환 계층을 남기지 않고, 호출자 마이그레이션과 옛 API 삭제를 같은 웨이브에서 한다. |
| [separate-before-serializing-shared-state](./skills/principle-separate-before-serializing-shared-state/SKILL.md) | architecture | 공유부터 없앤다. 공유 작성자가 하나라는 것이 진짜 불변식일 때만 구조적으로 직렬화한다. |
| [prove-it-works](./skills/principle-prove-it-works/SKILL.md) | verification | 작업을 마친 뒤, 완료를 선언하기 전에 적용한다. 대리 지표나 자기 보고, '컴파일된다'가 아니라 실제 산출물로 검증한다(기능을 실행하고, 실제 값을 읽고, diff를 살핀다). |
| [fix-root-causes](./skills/principle-fix-root-causes/SKILL.md) | verification | 증상마다 시스템이 처음 잘못된 곳까지 거슬러 올라가 거기서 고친다. 방어 코드는 그것이 다루는 상태가 정당할 때만 수정이다. |
| [sequence-verifiable-units](./skills/principle-sequence-verifiable-units/SKILL.md) | verification | 여러 단계로 된 작업(일괄 정리, 마이그레이션, 비슷한 수정의 연속)과 커밋·PR을 쌓는 방식에 적용한다. 일을 각각 검증 가능한 상태로 끝나는 작은 단위로 쪼개고, 다음으로 넘어가기 전에 하나씩 확인하고, 순서 자체가 리뷰어에게 증명이 되도록 전달 순서를 정한다. |
| [test-behavior-not-implementation](./skills/principle-test-behavior-not-implementation/SKILL.md) | verification | 테스트를 쓰거나 바꾸거나 유지할 때 적용한다. 코드의 사용자가 관찰할 수 있는 것을 단언한다. 그래야 그 동작이 깨지면 테스트가 실패하고, 내부만 바뀌면 계속 통과한다. |
| [explain-the-number](./skills/principle-explain-the-number/SKILL.md) | verification | 측정한 숫자(속도 향상, 회귀, 처리량, 지연 시간, eval 결과)를 믿거나 보고하거나 그에 따라 행동하기 전에 적용한다. 무엇이 그 숫자를 제한하는지 찾고, 생각하는 작업과 다른 것을 잰 것은 아닌지 배제한다. |
| [guard-the-context-window](./skills/principle-guard-the-context-window/SKILL.md) | delegation | 대량 작업은 subagent로 보낸다. 메인 스레드에는 원본 페이로드가 아니라 요약을 둔다. |
| [never-block-on-the-human](./skills/principle-never-block-on-the-human/SKILL.md) | delegation | 진행하고, 결과를 보여 주고, 사람이 사후에 방향을 바로잡게 한다. 확인 요청은 되돌릴 수 없는 행동에만 아껴 둔다. |
| [encode-lessons-in-structure](./skills/principle-encode-lessons-in-structure/SKILL.md) | meta | 글을 더 쓰는 대신 규칙을 lint, 메타데이터 플래그, 런타임 검사, 스크립트로 담는다. |

</details>

## 여기서 제공하지 않는 것

`poteto-mode`가 참조하지만 번들에 들어 있지 않은 것이 몇 가지 있다.

- `/deslop`과 `deslop` 스킬은 `cursor-team-kit` 플러그인에 들어 있다.
- `control-cli`(CLI와 TUI용)와 `control-ui`(브라우저, Electron, 웹용)도 `cursor-team-kit`에 들어 있다.
- `/create-skill`은 cursor 내장 기능이다. cursor에는 PR을 지켜보는 내장 `/autopilot`도 있다. `poteto-mode` 안에서는 PR 상태 요청이 그 대신 [babysit 플레이북](./skills/poteto-mode/playbooks/babysit.md)으로 간다.

전체 세트를 원하면 pstack과 함께 `cursor-team-kit`을 설치하라.

## 왜 계획 스킬이 없나?

cursor에는 이미 훌륭한 plan 모드가 있고 pstack과도 잘 맞는다. 하지만 개인적으로 나는 계획을 믿지 않는다. 최고의 명세는 코드다. 그래도 계획을 세우고 싶다면 [`/poteto-mode`](./skills/poteto-mode/SKILL.md)가 다루지만 기본 동작은 아니다.

## 자기 것으로 만들기

`poteto-mode`는 내 스타일이다. 당신은 정확히 그것을 원하지 않을 수도 있다.

[`/automate-me`](./skills/automate-me/SKILL.md)를 입력하라. 최근 대화 기록을 캐내서, 당신이 실제로 일해 온 방식으로 `<your-name>-mode` 스킬 초안을 만들고, 그 아래에서는 pstack을 거치게 한다. pstack을 바탕으로 유지하면서 `poteto-mode` 옆에 자기만의 라우팅 스킬을 갖게 된다.

모델도 설정할 수 있다. [`/setup-pstack`](./skills/setup-pstack/SKILL.md)을 입력하라. 접근 가능한 모델을 감지하고, 각 역할(코드, 판단, 리뷰 패널)을 모델에 연결하는 작은 상시 적용 rule을 쓴다. 모든 스킬이 이 rule을 읽고, rule이 없으면 합리적인 기본값으로 돌아가므로 원하는 것만 덮어쓰면 된다.

기본값이 바뀌면 그 전에 쓴 rule은 여전히 옛 기본값에 고정되어 있다. 해당 역할 줄들이나 파일을 지운 뒤 `/setup-pstack`을 다시 실행하라. 다시 실행해도 모델이 기본값과 다른 역할은 그대로 유지된다.

## 자동화

pstack에는 휴면 상태의 [benny 자동화 팩](./automations/benny/)도 들어 있다. benny는 slack 이슈 보고를 분류하고, 확인된 버그를 실제 UI 증거와 함께 재현하고 고친다. 팩의 파일들은 슬래시 스킬로 등록되지 않는다.

설정하려면 cursor에게 [`FOR_AGENTS.md`](./automations/benny/FOR_AGENTS.md)를 가리켜라. 설정 과정에서 팩을 대상 저장소의 `.cursor/automations/benny/`로 복사하고, 공유 스킬을 쓰도록 그곳에서 pstack을 켜고, 사용자 설정은 복사한 팩 바깥에 둔다. benny는 cursor automations 위에서 돌기 때문에 cursor 전용이다.

## 라이선스

MIT
