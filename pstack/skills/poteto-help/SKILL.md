---
name: poteto-help
description: pstack 설정, /poteto-mode, 작업에 맞는 스킬·플레이북·원칙 고르기를 안내한다. 질문과 함께 /poteto-help를 입력한다.
disable-model-invocation: true
---

# Poteto help

pstack에 관한 사용자의 질문에 답하고, 보낼 수 있는 프롬프트를 건네고, 답의 출처인 파일을 링크한다. 도움말 질문이라면 작업을 시작하지 않는다. 사용자는 방법을 물었고 pstack 실행은 실제 토큰을 쓰니, 프롬프트는 사용자가 보내게 둔다.

"use pstack to fix this bug"처럼 작업을 요청하는 메시지는 도움말 질문이 아니다. [`poteto-mode`](../poteto-mode/SKILL.md)를 읽고 그 아래에서 작업하며, Custom Mode로 켜 두면 계속 유지된다는 점을 한 번 언급한다.

이 파일은 질문을 그 답을 가진 스킬과 가이드 페이지로 잇는다. 세부는 그 파일들이 맡는다. 연결할 파일은 인용하기 전에 읽고, 이 지도와 다르면 그 파일을 믿는다. 여기 링크는 설치된 플러그인 안을 가리키는데 사용자는 열지 못할 수 있으니, 사용자에게는 파일의 공개 사본을 준다. `https://github.com/cursor/plugins/blob/main/pstack/` 뒤에 그 경로를 붙인 주소다.

## 무엇이 필요한지 알아내기

필요한 것은 메시지와 대화에서 추론한다. "which skill reviews a PR?"처럼 상황을 짚은 질문은 바로 해당 절로 간다. 그래도 불분명하면 다음 선택지로 객관식 질문을 하나 하고, 고른 절만 답한다.

- 설정하기
- `/poteto-mode`로 작업 시작하기
- 상황에 맞는 스킬 고르기
- 잘못된 실행 고치기
- pstack을 내 것으로 만들기

답을 바꾸는 상태를 확인하고, 실제로 답이 바뀔 때만 언급한다.

- `~/.cursor/rules/pstack-models.mdc`가 없으면 이 사용자는 `/setup-pstack`을 돌리지 않았고, 모든 역할이 기본 모델을 쓴다.
- 프로젝트에 `verify-*` 스킬이나 다른 앱 하네스가 없으면 에이전트가 앱을 스크립트로 조작할 방법이 없다. 변경이 동작함을 증명하는 질문이면 `/create-verification-skill`을 언급한다.

모델 규칙이 없고 그게 중요하면, 지금 역할마다 모델과 추론 예산을 고를지 묻는다. 사용자가 처음이거나, 설정이나 비용을 묻거나, 어떤 모델이 도는지에 답이 달려 있으면 중요하다. 채팅마다 많아야 한 번 묻는다. 필요한 것도 불분명하면 두 질문을 함께 한다. 선택지는 둘이다.

- 지금: 입력할 `/setup-pstack`을 주고 질문에도 답한다.
- 나중에: 질문에 답하고, `/setup-pstack`을 돌리기 전까지 모든 역할이 기본 모델을 쓴다는 한 줄을 덧붙인다.

## 설정하기

1. 채팅에서 `/add-plugin pstack`으로 설치하거나, 사이드바의 Customize에서 설치한다.
2. [`/setup-pstack`](../setup-pstack/SKILL.md)을 돌린다. 추론 예산을 묻고, 역할마다 모델을 정하고, 규칙을 쓴다. 규칙은 새 채팅부터 적용된다.
3. `/poteto-mode`와 목표, 그리고 통과하거나 실패할 수 있는 검사로 실제 작업을 시작한다.

설치만으로는 사용자가 스킬을 부르기 전까지 아무것도 바뀌지 않는다. 사용자의 말로 로드되는 것은 `/setup-pstack`뿐이다. 세부는 [README](../../README.md)와 [가이드 1쪽](../../docs/guide/01-setup.md)에 있다. [`references/prompting.md`](references/prompting.md)에 따라 첫 프롬프트를 함께 다듬자고 제안한다.

비용이 걱정이라면 토큰이 어디에 쓰이는지와 덜 쓰는 법을 알려 준다. pstack은 subagent와 리뷰 패널에 토큰을 더 쓴다. `/setup-pstack`을 다시 돌려 더 작은 예산이나 더 싼 모델을 고른다. `auto`나 `inherit-parent`로 둔 역할은 채팅 모델로 돌아서, 채팅이 Auto나 더 싼 모델일 때 토큰을 아낀다. 패널 목록이 짧으면 항목마다 하나씩 도는 subagent도 줄어든다. `/poteto-mode`는 엄밀함이 필요한 작업에만 쓴다.

pstack은 Cursor용으로 만들었다. 스킬이 Agent Skills 형식이라 다른 도구도 읽을 수 있다. 하지만 `/poteto-mode`, `/how`, `/why`, `/teach`를 포함한 워크플로 스킬 대부분이 역할별 모델로 Cursor subagent를 띄우고, Custom Mode와 `/loop`도 Cursor 기능이라 그런 부분은 다른 도구에서 동작하지 않을 수 있다.

## `/poteto-mode`로 작업 시작하기

`/poteto-mode`는 작업에 맞는 플레이북을 고르고, 그 단계를 todo 목록에 옮기고, 단계에 필요할 때 다른 스킬을 돌린다. 건너뛴 단계는 `skip: <reason>`으로 목록에 남는다. 좋은 프롬프트는 목표와 완료를 판단하는 방법을 밝힌다. 스킬을 나열하지 않는다. 손으로 짠 순서는 플레이북이 지킬 단계를 빠뜨리거나 뒤섞기 쉽기 때문이다. 프롬프트 다듬기를 돕기 전에 [`references/prompting.md`](references/prompting.md)를 읽는다. 예시는 [가이드 2쪽](../../docs/guide/02-poteto-mode.md)에 있다.

`/poteto-mode`가 계속 켜져 있는지는 사용자가 어떻게 시작했는지에 달렸다.

- `/poteto-mode`에서 Enter를 누르면 스킬이 메시지 하나에 붙는다. 대화가 이어지면 흐려진다.
- Mac에서 Option+Enter, Windows에서 Alt+Enter를 누르거나 스킬 항목의 Use as Mode를 고르면 Custom Mode가 된다. 사용자가 모드를 나갈 때까지 매 턴 컨텍스트에 남고, 가벼운 턴에는 끼어들지 않는다.
- Cursor 문서는 Custom Mode를 Agents Window와 CLI에서 쓸 수 있다고 적는다. 다른 곳에서는 새 작업마다 `/poteto-mode`로 시작한다.

이 이야기가 나오면 [Cursor 스킬 문서](https://cursor.com/docs/skills)를 링크한다. 채팅 중간에 "new task"라고 하면 모드가 새 플레이북을 고른다. `/poteto-mode`는 플레이북 단계가 띄우는 subagent에 이미 `poteto-agent`를 쓴다. 직접 띄우는 subagent에서 같은 스타일을 얻으려면 `subagent_type: "poteto-agent"`로 띄운다.

## 스킬 고르기

기본 답은 `/poteto-mode`다. 단계에 필요하면 다른 스킬 대부분을 알아서 돌린다. 사용자가 플레이북이 주는 것보다 무언가를 더 원하거나 덜 원할 때 스킬을 직접 짚는다. 추천하기 전에 그 스킬을 읽고, 예시 프롬프트를 하나 준다.

| 사용자가 원하는 것 | 스킬 |
|---|---|
| 사소하지 않은 작업을 엄밀하게 하기 | [`/poteto-mode`](../poteto-mode/SKILL.md) |
| 에이전트가 시작하기 전에 내 목표와 문제를 이해했는지 확인하기 | [`/in-your-own-words`](../in-your-own-words/SKILL.md) |
| 시작하기 전에 작업을 더 높이 겨냥하기. 더 전문가답게, 더 결과 중심으로, 과하게 명세하지 않고 | [`/sharpen`](../sharpen/SKILL.md) |
| 코드가 지금 어떻게 동작하는지, 새 코드를 어디에 둘지 알기 | [`/how`](../how/SKILL.md) |
| 코드가 왜 이런 모양인지, 숫자가 어디서 왔는지 알기 | [`/why`](../why/SKILL.md) |
| 변경이나 하위 시스템을 쉬운 말로 이해하기 | [`/teach`](../teach/SKILL.md) |
| 어떤 주제의 최근 내 작업 따라잡기 | [`/recall`](../recall/SKILL.md) |
| 내 마지막 메시지 이후 이 채팅에서 바뀐 것을 쉬운 문장 몇 개와 작은 시각 자료로 따라잡고, 실행 항목마다 결정할 만큼의 맥락 받기 | [`/ketchup`](../ketchup/SKILL.md) |
| 작은 diff가 그 바깥에서 무엇을 깨뜨릴 수 있는지 알기 | [`/blast-radius`](../blast-radius/SKILL.md) |
| 함수 경계를 넘는 코드 전에 타입과 모듈 모양 정하기 | [`/architect`](../architect/SKILL.md) |
| 지시 하나에 여러 시도를 받아 가장 좋은 것으로 합치기 | [`/arena`](../arena/SKILL.md) |
| 조각별 병렬 검사나 작업자 경주를 클라우드 에이전트로 돌리기 | [`/swarm`](../swarm/SKILL.md) |
| 여러 모델이 diff를 리뷰하고 깨뜨려 보게 하기 | [`/interrogate`](../interrogate/SKILL.md) |
| 싼 로컬 테스트가 있을 때 테스트 먼저 버그 고치기 | [`/tdd`](../tdd/SKILL.md) |
| `.ts`나 `.tsx` 작업에 TypeScript 규칙 적용하기 | [`/typescript-best-practices`](../typescript-best-practices/SKILL.md) |
| 주석을 쓰지 않은 리뷰어로 리뷰 전에 주석 걷어 내기 | [`/no-comments`](../no-comments/SKILL.md) |
| 산문에서 AI 티 지우기 | [`/unslop`](../unslop/SKILL.md) |
| 문서, RFC, README, PR 설명, 커밋 메시지를 기준에 맞게 쓰기 | [`/technical-writing`](../technical-writing/SKILL.md) |
| 마지막 답을 쉬운 말로 다시 듣기 | [`/bro`](../bro/SKILL.md) |
| 에이전트가 앱을 스크립트로 조작해 동작을 증명하게 하기 | [`/create-verification-skill`](../create-verification-skill/SKILL.md) |
| 검증 스킬과 기능 지도를 앱에 다시 맞추기 | [`/maintain-verification-skill`](../maintain-verification-skill/SKILL.md) |
| 성능 수치를 보고하거나 그에 따라 움직이기 전에 점검하기 | [`/benchmark-checklist`](../benchmark-checklist/SKILL.md) |
| 크거나 여러 곳에 걸친 변경, 자리를 비운 뒤 검토할 변경을 돌리기 | [`/figure-it-out`](../figure-it-out/SKILL.md) |
| 실행 중 결정 로그를 남기고 나중에 검토하기 | [`/show-me-your-work`](../show-me-your-work/SKILL.md) |
| 역할마다 모델과 추론 예산 고르기 | [`/setup-pstack`](../setup-pstack/SKILL.md) |
| 자기 작업 습관을 개인 모드 스킬로 만들기 | [`/automate-me`](../automate-me/SKILL.md) |
| 끝난 작업에서 배운 것을 스킬 수정으로 바꾸기 | [`/reflect`](../reflect/SKILL.md) |
| 이 저장소에서 에이전트가 같은 실수를 되풀이하지 않게 하기 | [`/correct`](../correct/SKILL.md) |
| 버튼이 webhook으로 Grok Bot을 깨우는 페이지 만들기 | [`/make-bot-ui`](../make-bot-ui/SKILL.md) |
| pstack 안에서 길 찾기 | `/poteto-help` |

이 디렉터리 옆의 스킬 디렉터리가 표에 없으면 그 frontmatter를 읽고 description에 따라 연결한다. `principle-*` 디렉터리는 아래 원칙 절에서 다룬다.

헷갈리는 경우:

- `/how`는 코드가 무엇을 하는지 설명한다. `/why`는 그 이유를 설명한다. `/teach`는 둘 중 하나나 둘 다 돌리고 결과를 쉽게 풀어 준다.
- `/arena`는 모든 작업자에게 같은 지시를 주고 가장 좋은 부분을 합친다. `/swarm`은 작업을 조각이나 경주로 나누고 보고서 하나를 돌려준다.
- `/architect`는 설계를 정하자마자 구현한다. 코드를 쓰기 전에 설계를 검토하려면 "with checkpoint"를 붙인다.
- `/interrogate`는 diff를 리뷰한다. `/blast-radius`는 diff 바깥의 깨짐을 찾고, 변경을 안전하게 만드는 사실 하나를 증명한다.
- `/recall`은 최근 채팅들에 걸친 맥락을 다시 세운다. `/ketchup`은 사용자의 마지막 메시지 이후 이 채팅만 다룬다. 특정 채팅이나 브랜치 하나를 이어 받는 것은 Session pickup 플레이북이다.
- `/figure-it-out`은 엄밀한 실행 하나를 설계한다. Orchestrate 플레이북은 며칠과 많은 PR에 걸친 프로그램을 돌린다. Autonomous run 플레이북은 작업 하나를 완료 조건까지 끌고 간다.

pstack에 없는 것:

- `/deslop`, `control-cli`, `control-ui`는 `cursor-team-kit` 플러그인에 들어 있다.
- `/loop`와 `/create-skill`은 Cursor 내장 기능이다.
- pstack에는 `/orchestrate` 스킬이 없다. Orchestrate는 `/poteto-mode`의 플레이북이다. 슬래시 메뉴에 `/orchestrate`가 보이면 다른 플러그인이 제공하는 것이다.

## 플레이북과 원칙

플레이북은 스킬이 아니라 `/poteto-mode` 안의 단계 목록이라 슬래시 명령이 없다. `/poteto-mode` 안에서 작업을 설명하면 하나가 골라지고, 다음 표현은 플레이북을 직접 짚는다.

- "babysit this pr"나 "check on pr 123"은 Babysit을 돌린다. PR을 merge-ready까지 끌고 가서 멈춘다. 사용자가 merge, land, ship을 요청하지 않으면 머지하지 않는다.
- "land the stack"은 Shipping을 돌린다.
- "take over this branch"는 Session pickup을 돌린다.
- "pause safely"는 Pause safely를 돌린다.
- "full autopilot on this queue"는 Autopilot-full을, "stack them, don't ship"은 Autopilot-stack을 돌린다.
- "run the eval playbook"은 Eval을 돌린다.

`/poteto-mode` 없이 "babysit this pr" 같은 표현을 쓰면 같은 일을 하는 Cursor 자체 스킬이 대신 시작될 수 있다. [`poteto-mode`](../poteto-mode/SKILL.md)의 Playbooks 절에 모든 플레이북과 적용 시점이 있다. PR을 열고, babysit하고, 반영하는 과정은 [가이드 6쪽](../../docs/guide/06-verify-and-ship.md)이 다룬다.

pstack에는 계획 스킬이 없다. Cursor의 Plan Mode를 함께 쓰면 된다. 여러 단계나 쌓인 PR에 걸친 작업이라면 `/poteto-mode`에 계획을 요청할 때 [Multi-phase plan 플레이북](../poteto-mode/playbooks/multi-phase-plan.md)이 돈다. 이 플레이북은 계획을 쓰고 구현하지는 않는다. 설계 질문이라면 Prototype 플레이북이나 `/architect`가 먼저 코드로 결론을 낸다.

원칙은 규칙 하나짜리 스킬로, `/poteto-mode`가 읽고 답에서 인용한다. 사용자가 직접 부르는 일은 드물다. 대신 "apply prove it works. show me the real output."처럼 이름으로 방향을 잡는다. `/principle-<name>`을 입력하면 필요할 때 불러올 수도 있다. 목록은 [가이드 8쪽](../../docs/guide/08-principles.md)에 있다.

## 잘못된 실행 고치기

| 증상 | 해결 |
|---|---|
| 몇 턴 뒤 모드가 적용되지 않는다 | Enter로 시작했다. Custom Mode로 시작하거나 작업마다 `/poteto-mode`로 시작한다. |
| 질문이 지난 작업의 다음 단계로 처리됐다 | "new task"라고 하거나, 이번 턴에는 모드가 필요 없다고 말한다. |
| 새로 고른 모델이 효과가 없다 | `/setup-pstack`의 규칙은 새 채팅부터 적용된다. 새 채팅을 연다. |
| 실행 비용이 예상보다 크다 | 설정하기 절의 비용 문단을 본다. |
| 스킬이 알아서 로드되지 않았다 | 사용자의 말로 로드되는 것은 `/setup-pstack`뿐이다. 나머지는 사용자가 입력하거나 `/poteto-mode`가 돌릴 때 로드되며, `/poteto-mode`가 모든 스킬을 돌리지는 않는다. |
| 병렬 에이전트가 서로 덮어썼다 | 에이전트마다 자기 worktree를 주거나, 각자 자기 머신을 받는 클라우드 에이전트로 돌린다. |
| 밤새 돈 실행이 움직였지만 끝낸 것이 없다 | `/loop`에는 시간이 아니라 통과하거나 실패할 수 있는 검사가 필요하다. [가이드 7쪽](../../docs/guide/07-overnight.md)을 본다. |
| 초록 빌드만 보고 성공했다고 답한다 | 실제 명령, 흐름, 저장된 값, 프로파일을 요구한다. 이것이 prove-it-works 원칙이다. |

흐름이 어긋나는 실행에 쓸 한 줄 방향 잡기는 [`references/prompting.md`](references/prompting.md)에 있다. 다른 함정과 따라 쓸 만한 레시피는 [가이드 10쪽](../../docs/guide/10-recipes-and-pitfalls.md)에 있다.

## pstack을 내 것으로 만들기

- [`/automate-me`](../automate-me/SKILL.md)는 사용자 자신의 기록에서 개인 모드 스킬 초안을 만든다. `/poteto-mode`와 함께 쓴다.
- 세션 뒤 [`/reflect`](../reflect/SKILL.md)를 돌리면 배운 것을 사용자가 승인할 스킬 수정으로 바꾼다.
- `/poteto-mode write a skill for <workflow>`는 스킬 작성 플레이북을 돌린다. eval 플레이북은 스킬 변경을 블라인드로 시험한다.
- 잘못 동작하는 스킬은 문제가 생긴 기능 작업 안이 아니라 별도 PR에서 고친다.

각각은 [가이드 9쪽](../../docs/guide/09-make-it-yours.md)이 다룬다.

## 답변

답부터 쓴다. 예시 프롬프트는 코드 블록으로 많아야 하나 주고, 맞는 것이 있으면 [`references/recipes.md`](references/recipes.md)에서 가져와 고친 뒤 그 파일을 링크한다. 사용자가 전체 지도를 요청하지 않았다면 짧게 쓴다.
