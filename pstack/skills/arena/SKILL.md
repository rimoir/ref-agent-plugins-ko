---
name: arena
description: "같은 작업에 후보 N개를 병렬로 띄우고, 기반 하나를 고른 뒤, 진 후보들의 가장 강한 부분을 그 기반에 접목한다. /arena, 'arena this', 'throw it in the arena'라는 요청, 또는 쉽지 않은 산출물을 한 번만 시도하면 잘못된 모양으로 굳을 때 쓴다."
disable-model-invocation: true
---

# Arena

무엇이든 띄우기 전에 단계마다 항목 하나씩(Frame, Fan out, Cross-judge, Pick, Graft, Verify) todolist를 연다.

## Phase A: Frame

모든 후보가 같은 프롬프트를 받으므로 프롬프트가 곧 계약이다.

1. 각 후보가 만들어 낼 산출물을 밝힌다.
2. 채점 기준(rubric)을 끌어낸다. *이* 작업에서 성공이 어떤 모습인지를 채점할 수 있는 구체적인 기준 3~6개로 적는다. 채점 기준은 Phase D에서 고르는 쪽의 도구다. 후보는 작업만 본다.
3. 실행자(runner)를 고른다. `~/.cursor/rules/pstack-models.mdc`의 `arena runners` 줄을 쓴다. 규칙 파일이나 그 줄이 없으면 기본으로 `claude-opus-5-5-xhigh`와 `grok-4.7-xhigh-fast`에 하나씩 띄운다. 이 줄이나 cross-judge 줄의 `auto`나 `inherit-parent` 항목은 부모 모델을 뜻하므로 그 항목에는 `model`을 생략한다. Task 도구가 설정된 항목을 거부하면 그 자리는 같은 계열의 기본 모델로 돌리고 그렇게 했다고 밝힌다. 계열은 접두사로 나눈다. `claude-*`가 한 계열이고, `grok-*`는 `cursor-grok-*`, `composer-*`와 한 계열이다. 거부된 `composer-*` 항목은 `grok-4.7-xhigh-fast`로 돌린다. 맞는 계열이 없으면 `claude-opus-5-5-xhigh`를 쓴다. 기본 모델을 거부하면 오류 메시지에서 같은 계열의 가장 가까운 유효 slug를 쓴다. arena가 설계 방향 여러 개를 다루면 실행자를 더 띄운다. 작업이 판단보다 생성량에 좌우되면 같은 모델을 N번 쓴다. 각 subagent의 추론 수준과 속도(fast 또는 표준)는 **poteto-mode** 스킬의 Subagents 절에 따라 작업에 맞게 고른다.
4. **separate-before-serializing-shared-state** 원칙 스킬에 따라 후보마다 자기 출력 위치(가능하면 git worktree, 아니면 `/tmp/arena-<slug>/candidate-<n>/`)를 준다.

## Phase B: Fan out

메시지 하나에서 `run_in_background: true`로 subagent N개를 모두 띄운다. 각 subagent에는 작업, 공유 근거 자료의 경로, 자기 출력 경로, 그리고 산출물과 짧은 근거 설명을 만들라는 지시를 준다. 근거 설명에는 검토한 대안과 버린 것을 밝힌다.

출력을 내지 못한 후보가 있으면 N-1개로 진행하고 탈락을 적어 둔다.

## Phase C: Cross-judge

Phase B의 후보가 모두 끝나면 `~/.cursor/rules/pstack-models.mdc`의 `arena cross-judge pool` 줄에서 모델 하나를 고른다. 규칙 파일이나 그 줄이 없으면 `claude-opus-5-5-xhigh`와 `grok-4.7-xhigh-fast` 중에서 고른다. 부모와 다른 모델 계열을 우선한다. 그 모델로 읽기 전용 판정 subagent 하나를 띄운다. 판정자는 채점 기준과 경로 라벨이 붙은 후보를 보고, 기준마다 점수를 매기고, 근거와 함께 기반을 추천한다. 판정자는 Phase D에서 내가 읽는 동안 병렬로 돈다. 후보가 아직 쓰는 중에는 판정자를 띄우지 않는다.

## Phase D: 기반 고르기

고르기 전에 모든 후보를 처음부터 끝까지 읽는다. 전체 인상이 아니라 채점 기준 하나하나로 각 후보에 점수를 매기고 cross-judge와 비교한다. 기반이 일치하면 선택이 확정된다. 어긋나면 둘 중 하나가 편향됐거나 채점 기준이 모호했다는 뜻이다. 결정하기 전에 양쪽 근거를 모두 읽는다.

미래의 유지 보수자가 불변 조건을 깨지 않고 가장 쉽게 확장할 수 있는 후보를 기반으로 고른다. 둘이 비슷하면 Laziness Protocol에 따라 경계가 더 깔끔하거나 API가 더 작은 쪽을 고른다.

## Phase E: 접목

진 후보를 한 번씩 더 훑으며 기반으로 옮길 가치가 있는 것을 찾는다. 대개 후보당 한두 가지이지, 대부분이 아니다. **redesign-from-first-principles** 원칙 스킬에 따라 접목마다 손으로 녹여 넣어 결과가 하나의 멘탈 모델 아래에서 일관되게 한다. 기계적으로 붙여 넣지 않는다.

후보들이 한 모양으로 수렴하면 강한 합의다. 그것을 적고 합의된 모양을 내보낸다. 접목은 필요 없다. 크게 갈라지면 Phase A의 명세가 부족했던 것이다. 갈라진 것을 평균 내지 말고 다시 framing하고 다시 돌린다.

## Phase F: 검증

**prove-it-works** 원칙 스킬에 따라 종합한 산출물도 다른 출력처럼 검증한다. arena가 놓친 문제가 검증에서 드러나면, Phase A가 틀렸거나(다시 framing하고 다시 돌린다) 후보 하나가 잡았는데 접목을 놓친 것이다(Phase E로 돌아간다). 덮어 감추지 않는다.

## 출력

종합한 산출물 하나. 그 옆에 짧은 종합 메모를 둔다. 기반과 그 이유, cross-judge의 판정, 접목마다 출처 후보, 버린 것과 그 이유, 있었다면 수렴이나 탈락, 검증 결과를 밝힌다.
