# 원칙 이름으로 방향 잡기

pstack은 원칙 24개를 각각 스킬로 제공한다. `/poteto-mode`는 여러 단계짜리 과제를 시작할 때마다 그 색인을 읽고, 과제가 건드리는 원칙을 적용하고, 응답에서 적용한 원칙마다 그것이 바꾼 결정과 함께 이름을 밝힌다.

원칙은 호출하는 것이 아니다. 이름으로 방향을 잡는다. 각 이름은 에이전트가 이미 읽은 완전한 규칙을 가리키므로, 한 구절이 지시 한 문단보다 작업을 더 정확하게 돌려놓는다.

## 실제로 방향 잡기

에이전트가 기존 어댑터 세 개 위에 새 어댑터를 덧대려 한다고 하자.

```text
subtract before you add 원칙을 써. 낡은 어댑터부터 지우고 남은 것을 설계해.
```

빌드가 통과했다고 성공을 주장한다고 하자.

```text
prove it works 원칙을 적용해. 실제 import 흐름을 돌리고 기록된 레코드를 보여 줘.
```

병렬 시도 두 개가 같은 브랜치에 쓰려 한다고 하자.

```text
separate before serializing shared state 원칙대로 해. 시도마다 worktree를 따로 주고, 잠금은 쓰지 마.
```

각 구절이 먹히는 것은 그 뒤의 규칙이 구체적이기 때문이다. 그래도 에이전트는 응답에서 그 규칙이 어떤 결정을 바꿨는지 말해야 한다. 바뀐 결정 없이 원칙만 인용했다면 적용하지 않고 이름만 들먹였다는 신호다.

## 24개 원칙 간단히

핵심 원칙은 얼마나 만들지, 언제 설계를 다시 생각할지 정한다.

- [Laziness Protocol](../../skills/principle-laziness-protocol/SKILL.md)(게으름 프로토콜)은 삭제와, 문제를 푸는 가장 작은 변경을 택한다.
- [Foundational Thinking](../../skills/principle-foundational-thinking/SKILL.md)(기초부터 생각하기)은 로직을 쓰기 전에 핵심 데이터 구조를 고른다.
- [Redesign from First Principles](../../skills/principle-redesign-from-first-principles/SKILL.md)(제1원칙부터 재설계)는 새 요구 사항을 처음부터 있었던 것처럼 녹여 넣는다.
- [Attack the Premise](../../skills/principle-attack-the-premise/SKILL.md)(전제 공격)는 어느 주체가 불균형을 쥐고 있는지 전수 조사한 뒤, 실패한 수정 둘 이상이 공유한 전제를 의심한다.
- [Subtract Before You Add](../../skills/principle-subtract-before-you-add/SKILL.md)(더하기 전에 빼기)는 그 위에 쌓기 전에 죽은 짐을 걷어 낸다.
- [Minimize Reader Load](../../skills/principle-minimize-reader-load/SKILL.md)(읽는 사람의 부담 최소화)는 읽는 사람이 머릿속에 들고 있어야 하는 층과 숨은 상태를 줄인다.
- [Outcome-Oriented Execution](../../skills/principle-outcome-oriented-execution/SKILL.md)(결과 지향 실행)은 버릴 호환 상태를 보존하지 않고 재작성을 목표 설계로 수렴시킨다.
- [Experience First](../../skills/principle-experience-first/SKILL.md)(경험 우선)는 구현 편의보다 사용자가 얻는 결과를 고른다.
- [Exhaust the Design Space](../../skills/principle-exhaust-the-design-space/SKILL.md)(설계 공간 소진)는 선례가 없을 때 경쟁하는 프로토타입 두세 개를 만든다.
- [Build the Lever](../../skills/principle-build-the-lever/SKILL.md)(지렛대 만들기)는 작업을 하거나 증명하는 스크립트를 만들어 리뷰어가 다시 돌릴 수 있게 한다. 에이전트가 같은 일을 계속 손으로 하고 있다면, 있었으면 하는 도구나 스킬을 직접 쓰게 한다. 스크립트가 어떤 단계를 매번 같은 방식으로 할 수 있다면 스크립트를 쓰고, 에이전트는 판단이 필요한 일에 아껴 둔다.

아키텍처 원칙은 상태, 검증, 호환성이 어디에 사는지 정한다.

- [Model the Domain](../../skills/principle-model-the-domain/SKILL.md)(도메인 모델링)은 반복되는 규칙을 흩어진 조건문이 아니라 구조 하나에 담는다.
- [Boundary Discipline](../../skills/principle-boundary-discipline/SKILL.md)(경계 규율)은 경계에서 검증하고 내부 타입은 믿는다.
- [Type System Discipline](../../skills/principle-type-system-discipline/SKILL.md)(타입 시스템 규율)은 불가능한 상태를 표현할 수 없게 만든다.
- [Make Operations Idempotent](../../skills/principle-make-operations-idempotent/SKILL.md)(작업을 멱등하게)는 재시도가 같은 최종 상태로 수렴하게 한다.
- [Migrate Callers Then Delete Legacy APIs](../../skills/principle-migrate-callers-then-delete-legacy-apis/SKILL.md)(호출자를 옮긴 뒤 레거시 API 삭제)는 이전과 삭제를 한 묶음에 한다.
- [Separate Before Serializing Shared State](../../skills/principle-separate-before-serializing-shared-state/SKILL.md)(공유 상태는 직렬화 전에 분리)는 조율을 더하기 전에 공유부터 없앤다.

검증 원칙은 무엇이 증명으로 인정되는지 정한다.

- [Prove It Works](../../skills/principle-prove-it-works/SKILL.md)(동작을 증명하라)는 대리 지표가 아니라 실제 산출물을 검증한다.
- [Fix Root Causes](../../skills/principle-fix-root-causes/SKILL.md)(근본 원인 수정)는 코드를 바꾸기 전에 재현하고 원인까지 추적한다.
- [Sequence Work into Verifiable Units](../../skills/principle-sequence-verifiable-units/SKILL.md)(검증 가능한 단위로 작업 나누기)는 작은 단위마다 확인으로 끝낸 뒤 다음을 시작한다.
- [Test Behavior, Not Implementation](../../skills/principle-test-behavior-not-implementation/SKILL.md)(구현이 아니라 동작을 테스트)은 사용자가 부르는 방식으로 코드를 호출하고 문자 그대로의 기댓값을 단언하며, import한 함수가 전부 `undefined`를 돌려줘도 통과할 테스트는 지운다.
- [Explain the Number](../../skills/principle-explain-the-number/SKILL.md)(숫자를 설명하라)는 누군가 측정한 숫자를 믿거나 보고하기 전에, 그 숫자를 제한하는 요인을 대고 엉뚱한 것을 잰 것이 아님을 배제한다. [`/benchmark-checklist`](../../skills/benchmark-checklist/SKILL.md)는 이것을 실제 실행으로 답하는 질문 일곱 개로 바꾼다.

위임 원칙은 병렬 작업을 제정신으로 유지한다.

- [Guard the Context Window](../../skills/principle-guard-the-context-window/SKILL.md)(컨텍스트 창 지키기)는 대량 읽기를 subagent에게 넘기고 발견은 메인 채팅에 둔다.
- [Never Block on the Human](../../skills/principle-never-block-on-the-human/SKILL.md)(사람 때문에 멈추지 않기)는 되돌릴 수 있는 작업은 진행하고 결과를 보여 준다.

그리고 메타 원칙 하나가 있다.

- [Encode Lessons in Structure](../../skills/principle-encode-lessons-in-structure/SKILL.md)(교훈을 구조에 새기기)는 두 번 반복한 조언을 lint, 검사, 스크립트로 바꾼다. [`/correct`](../../skills/correct/SKILL.md)는 [내 것으로 만들기](./09-make-it-yours.md#fix-the-environment-with-correct)에서 보듯 이것을 저장소 전체에 적용한다.

목록을 외우지 않는다. 지금은 훑어보고, 여기 있는 이름 하나로 막을 수 있었을 일을 에이전트가 하는 순간 다시 돌아온다. 어휘는 그렇게 몸에 붙는다.

다음: [내 것으로 만들기](./09-make-it-yours.md).
