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
3. 실행자(runner)는 `~/.cursor/rules/pstack-models.mdc`의 `arena runners` 줄에서 고르며, 기본은 `claude-fable-5-2-high`, `claude-opus-5-5-high-fast`, `gemini-4-neon-xhigh`다. `auto`나 `inherit-parent` 항목은 부모 모델이므로 `model`을 생략하고 `generalPurpose`를 띄운다. Task 도구가 slug를 거부하면 같은 계열에서 가장 가까운 유효 slug를 쓰거나 그 자리를 빼되, 실행자는 적어도 둘을 유지하고 그렇다고 밝힌다. 계열은 접두사로 나누며, 앞의 `cursor-`를 뗀 뒤 가장 길게 맞는 접두사가 이긴다. `claude-fable-*`, `claude-*`, `gemini-*`가 있다. 그 밖의 slug는 첫 하이픈 앞의 글자가 계열이다. 설계 방향이 여러 개면 실행자를 더 띄우고, 작업이 판단보다 생성량에 좌우되면 한 모델을 되풀이해 쓴다. 각 subagent의 추론 수준은 **poteto-mode** 스킬의 Subagents 절에 따라 고른다.
4. **separate-before-serializing-shared-state** 원칙 스킬에 따라 후보마다 자기 출력 위치(가능하면 git worktree, 아니면 `/tmp/arena-<slug>/candidate-<n>/`)를 준다.

## Phase B: Fan out

메시지 하나에서 `run_in_background: true`로 subagent N개를 모두 띄운다. 각 subagent에는 작업, 공유 근거 자료의 경로, 자기 출력 경로, 그리고 산출물과 짧은 근거 설명을 만들라는 지시를 준다. 근거 설명에는 검토한 대안과 버린 것을 밝힌다.

출력을 내지 못한 후보가 있으면 N-1개로 진행하고 탈락을 적어 둔다.

## Phase C: Cross-judge

Phase B의 후보가 모두 끝나면 `~/.cursor/rules/pstack-models.mdc`의 `arena cross-judge pool` 줄에서 읽기 전용 판정자 하나를 띄운다. 기본은 `claude-opus-5-5-high-fast`, `gemini-4-neon-xhigh`다. 판정자는 절대 부모와 같은 벤더가 아니며, 이 검사에서 Fable은 Claude로 친다. 그러니 다른 벤더의 첫 항목을 쓴다. `auto`나 `inherit-parent` 항목은 부모 모델이다. 부모의 모델을 모르면 첫 실제 slug를 쓰고, 벤더 검사를 하지 않았다고 밝힌다. Task 도구가 slug를 거부하면 같은 계열에서 가장 가까운 유효 slug를 쓰고, 안 되면 그다음 다른 벤더 항목을 쓰고, 그래도 안 되면 판정자를 건너뛰며, 그렇다고 밝힌다. 내가 Phase D에서 읽는 동안 판정자는 후보마다 경로 라벨로 채점 기준별 점수를 매기고 기반을 추천한다.

## Phase D: 기반 고르기

고르기 전에 모든 후보를 처음부터 끝까지 읽는다. 전체 인상이 아니라 채점 기준 하나하나로 각 후보에 점수를 매기고 Phase C가 판정자를 돌렸다면 cross-judge와 비교한다. 기반이 일치하면 선택이 확정된다. 어긋나면 둘 중 하나가 편향됐거나 채점 기준이 모호했다는 뜻이다. 결정하기 전에 양쪽 근거를 모두 읽는다.

미래의 유지 보수자가 불변 조건을 깨지 않고 가장 쉽게 확장할 수 있는 후보를 기반으로 고른다. 둘이 비슷하면 Laziness Protocol에 따라 경계가 더 깔끔하거나 API가 더 작은 쪽을 고른다.

## Phase E: 접목

진 후보를 한 번씩 더 훑으며 기반으로 옮길 가치가 있는 것을 찾는다. 대개 후보당 한두 가지이지, 대부분이 아니다. **redesign-from-first-principles** 원칙 스킬에 따라 접목마다 손으로 녹여 넣어 결과가 하나의 멘탈 모델 아래에서 일관되게 한다. 기계적으로 붙여 넣지 않는다.

후보들이 한 모양으로 수렴하면 강한 합의다. 그것을 적고 합의된 모양을 내보낸다. 접목은 필요 없다. 크게 갈라지면 Phase A의 명세가 부족했던 것이다. 갈라진 것을 평균 내지 말고 다시 framing하고 다시 돌린다.

## Phase F: 검증

**prove-it-works** 원칙 스킬에 따라 종합한 산출물도 다른 출력처럼 검증한다. arena가 놓친 문제가 검증에서 드러나면, Phase A가 틀렸거나(다시 framing하고 다시 돌린다) 후보 하나가 잡았는데 접목을 놓친 것이다(Phase E로 돌아간다). 덮어 감추지 않는다.

## 출력

종합한 산출물 하나. 그 옆에 짧은 종합 메모를 둔다. 기반과 그 이유, cross-judge의 판정이나 Phase C가 판정자를 건너뛰었다는 사실, 접목마다 출처 후보, 버린 것과 그 이유, 있었다면 수렴이나 탈락, 검증 결과를 밝힌다.
