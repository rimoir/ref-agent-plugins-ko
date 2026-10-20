---
name: setup-pstack
description: pstack이 역할별로 어떤 모델을 어떤 추론 예산으로 쓸지 설정한다. 사용 가능한 모델을 감지하고 스킬 기본값을 덮어쓰는 항상 적용 규칙을 쓴다. /setup-pstack, "configure pstack models"(pstack 모델 설정), "pstack budget"(pstack 예산), pstack의 모델 선택을 바꿀 때 쓴다.
---

# pstack 설정

pstack의 역할별 모델을 정하는 항상 적용 규칙 `~/.cursor/rules/pstack-models.mdc`를 쓴다.

## 단계

### 1. 사용 가능한 모델 감지

이 세션에서 `Task` subagent에 넘길 수 있는 모델 slug를 열거한다. 이것이 믿을 만한 출처다. Cursor가 사용자에게 허용된 모델을 나열하는 모델 API나 CLI도 노출한다면 완전성을 위해 그것을 우선한다. 아무것도 감지할 수 없으면 사용자에게 접근 가능한 slug를 붙여 넣어 달라고 한다. 사용 가능함을 확인하지 않은 실제 slug는 절대 쓰지 않는다. 별칭 `inherit-parent`와 `auto`는 감지된 slug가 아니어도 언제나 유효하다.

### 2. 현재 상태 불러오기

역할별 기본 모델 대응은 아래 5단계에 나온 규칙 모양이다. `~/.cursor/rules/pstack-models.mdc`가 이미 있으면 읽고, 그 `# budget` 줄과 역할 값을 현재 선택으로 본다. 없으면 기본값에서 시작한다. `how critics`처럼 역할이 5단계에 없는 줄은 은퇴한 역할의 것이다. 버린다.

### 3. 예산, 대응, 확인

**(a) 예산 묻기.** 자유 텍스트보다 AskQuestion을 우선한다. 다음 네 가지 선택지를 정확히 이 라벨로 제시하고, 규칙에 현재 예산이 기록되어 있으면 그것을 밝힌다. 규칙이 없으면 `large`가 스킬 기본값과 같다고 말한다.

- `unlimited — max reasoning`
- `large — xhigh reasoning`
- `medium — high reasoning`
- `small — medium reasoning`

**(b) 적용.** 스킬 기본값으로 작업 표를 만들고, 다시 실행하는 경우에는 계열, 목록, 별칭(`inherit-parent`, `auto`)으로 바꾼 역할을 유지한다. `unlimited`, `large`, `medium`, `small`은 패널 항목을 포함한 모든 실제 slug의 effort 토큰을 각각 `max`, `xhigh`, `high`, `medium`으로 설정한다. effort 토큰은 마지막 토큰, 또는 끝에 `fast`가 붙어 있으면 그 앞의 토큰이며, 순서는 `max` > `xhigh` > `high` > `medium` > `low`다. 결과가 감지된 slug가 아니면, 같은 계열의 감지된 slug 중 목표 이하에서 effort가 가장 높은 것을 쓰고, 그것도 없으면 그 역할을 선택이 필요하다고 표시한다. `inherit-parent`와 `auto`는 바뀌지 않는다. 따라서 `unlimited`는 `claude-opus-5-5-xhigh`를 `claude-opus-5-5-max`로 바꾼다. Grok slug는 `xhigh`가 최고라서 `unlimited`에서는 대체 규칙에 따라 Grok이 `xhigh`에 머물고 `grok-4.7-xhigh-fast`는 그대로다. `large`는 두 기본값을 모두 유지한다. `small`은 둘을 `claude-opus-5-5-medium`과 `grok-4.7-medium-fast`로 바꾼다.

**(c) 역할을 보여 주고 확인.** 모든 역할을 모델과 함께 보여 주고, 감지된 집합에 없는 실제 slug는 선택이 필요하다고 표시한다. 2단계에서 버린 줄도 각각 나열한다. 그대로 받아들일지, 특정 역할을 바꿀지 묻고, 선택지로 감지된 모델과 `inherit-parent`, `auto`를 제시한다(둘 다 이 역할이 부모 채팅 모델로 돈다는 뜻이며, Auto 사용자가 Auto에 머무는 방법이다). 자유 텍스트보다 AskQuestion을 우선한다. 패널 역할(arena runners, architect runners, interrogate reviewers)의 값은 목록이고, 별칭 항목을 포함해 항목마다 subagent 하나가 돌므로 목록 길이가 개수를 정한다. `arena cross-judge pool`도 목록이지만, Arena는 가능하면 부모와 모델 계열이 다른 값 하나를 골라 쓴다. `swarm workers`는 경주나 비교가 갈래마다 다른 모델을 배정하지 않는 한 모든 worker의 기본 모델이다.

### 4. 검증

쓰는 실제 slug는 모두 감지된 집합에 있어야 한다. `inherit-parent`와 `auto`는 언제나 통과한다. 고른 실제 slug를 쓸 수 없으면 멈추고 다시 묻는다.

### 5. 규칙 쓰기

`~/.cursor/rules/pstack-models.mdc`를 `alwaysApply: true`, 고른 라벨과 목표 effort를 담은 `# budget` 줄, 그리고 poteto-mode가 쓰는 것과 같은 라벨로 역할마다 한 줄씩 써서 만든다. 다시 실행해도 결과가 같도록 파일 전체를 덮어쓴다. 모양은 다음과 같다.

```
---
description: pstack per-role model choices (overrides skill defaults)
alwaysApply: true
---
# pstack 모델 설정. 역할 하나에 한 줄. 줄을 지우면 스킬 기본값으로 돌아간다.
# 값이 `inherit-parent`나 `auto`면 그 역할은 부모 채팅 모델로 돈다(Task `model`을 생략한다). 패널 목록의 별칭 항목도 팬아웃 수에 포함된다.
# budget: large (xhigh)
feature, refactoring: grok-4.7-xhigh-fast
bug-fix: grok-4.7-xhigh-fast
perf-issue: grok-4.7-xhigh-fast
hillclimb: grok-4.7-xhigh-fast
judgment and prose: claude-opus-5-5-xhigh
hardest tasks: claude-opus-5-5-xhigh
how explorer: grok-4.7-xhigh-fast
how explainer: claude-opus-5-5-xhigh
why investigators: grok-4.7-xhigh-fast
why synthesizer: claude-opus-5-5-xhigh
reflect tooling: grok-4.7-xhigh-fast
reflect judgment, divergent, synthesizer: claude-opus-5-5-xhigh
arena runners: claude-opus-5-5-xhigh, grok-4.7-xhigh-fast
arena cross-judge pool: claude-opus-5-5-xhigh, grok-4.7-xhigh-fast
swarm workers: grok-4.7-xhigh-fast
architect runners: claude-opus-5-5-xhigh, grok-4.7-xhigh-fast
interrogate reviewers: claude-opus-5-5-xhigh, grok-4.7-xhigh-fast
```

### 6. 확인

규칙을 썼고 새 세션부터 적용된다고 사용자에게 알린다. 이 스킬을 다시 실행하면 규칙이 갱신된다.

### 7. 검증 스킬 제안 (선택)

프로젝트에 증명을 위해 실제 앱을 조작할 방법(`verify-*` 스킬이나 기존 하네스)이 있는지 확인한다. 없으면 한 번만 제안한다. "에이전트가 사용자처럼 앱을 조작해 변경이 동작함을 증명할 수 있도록 프로젝트 로컬 검증 스킬을 만들까요? /create-verification-skill로 생성할 수 있습니다." 그렇다고 하면 `/create-verification-skill`을 호출한다(pstack이 설치된 곳이 workspace든 user든 plugin이든 해석된다). 아니라고 하면 밀어붙이지 않고 넘어간다.

### 8. 형식 검증 스킬 제안 (선택)

프로젝트에 이미 형식 검증 스킬(코드를 대상으로 모델 검사기, 증명, 다른 검증기를 돌리는 프로젝트 스킬)이 있는지 확인한다. 없으면 한 번만 제안한다. "에이전트가 테스트가 닿는 경우만이 아니라 범위 안의 모든 경우에서 코드의 핵심 속성이 성립함을 증명할 수 있도록 형식 검증 스킬을 만들까요? /create-formal-verification-skill로 생성할 수 있습니다." 그렇다고 하면 `/create-formal-verification-skill`을 호출한다(pstack이 설치된 곳이 workspace든 user든 plugin이든 해석된다). 아니라고 하면 밀어붙이지 않고 넘어간다.
