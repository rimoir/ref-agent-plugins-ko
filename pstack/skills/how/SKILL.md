---
name: how
description: "\"how does X work\"(X는 어떻게 동작하나), 무언가를 바꾸기 전의 코드 둘러보기, 배치·소유권·계층 질문(\"where should this live\", \"which package owns this\", \"is this the right layer\")에 쓴다. 하위 시스템 아키텍처, 런타임 흐름, 온보딩용 멘탈 모델을 설명한다. 동기는 why를 쓴다."
disable-model-invocation: true
---

# How

코드베이스를 탐색해 "X는 어떻게 동작하나?" 질문에 답한다. 시니어 엔지니어가 하위 시스템에 온보딩할 때 듣는 수준의 아키텍처 설명을 만든다. 쓸 만한 멘탈 모델을 세우기에 충분하되, 주석 단 소스 코드처럼 읽힐 만큼 많지는 않게 한다.

아래의 각 spawn은 `pstack-models.mdc` rule의 역할 줄 하나와 기본값을 지정한다. `model`을 그 줄의 값으로, rule이나 그 줄이 없으면 기본값으로 설정한다. 값이 `auto`나 `inherit-parent`이면 `model`을 설정하지 않는다. Task 도구가 slug를 거부하면 기본값을 쓰고 그렇다고 말한다. 기본값도 거부하면 에러 메시지에서 같은 계열의 가장 가까운 유효한 slug를 쓴다.

## 1단계. 복잡도 판단

범위가 모호하면 자기 해석을 밝히고 탐색한다. 사용자가 방향을 바꿀 수 있다.

- **단순**(모듈 하나, 작은 유틸리티, "함수 X는 어떻게 동작하나" 같은 좁은 질문): 탐색자를 쓰지 않는다. 설명자 하나가 한 번에 탐색하고 설명한다. 2b단계로 간다.
- **복잡**(여러 파일이나 서비스에 걸친 하위 시스템, 여러 영역을 가로지르는 기능, 전체 아키텍처 개요): 먼저 탐색자들을 병렬로 띄운 뒤 설명자에게 넘긴다. 2a단계로 간다.

애매하면 단순한 경로를 택한다.

## 2a단계. 탐색(복잡한 질문만)

질문을 탐색 각도 2~4개로 쪼갠다. 각 각도는 하위 시스템의 서로 다른 조각이다. 모든 탐색자를 한 메시지에서 띄운다.

- `subagent_type`: `generalPurpose`
- `model`: `how explorer` 줄, 기본값 `grok-4.7-xhigh-fast`
- `readonly`: `true`

각 탐색자에게는 각도를 채워 넣은 `references/explorer-prompt.md`의 프롬프트를 준다. 그다음 3단계로 간다.

## 2b단계. 직접 설명(단순한 질문)

한 번에 탐색하고 설명하는 Task subagent 하나를 띄운다.

- `subagent_type`: `generalPurpose`
- `model`: `how explainer` 줄, 기본값 `claude-opus-5-5-xhigh`
- `readonly`: `true`

`references/explainer-prompt.md`에서 탐색자 발견 섹션을 빼고 프롬프트를 만든다. 4단계로 간다.

## 3단계. 종합(복잡한 질문만)

모든 탐색자가 돌아오면, 발견한 내용을 하나의 설명으로 종합할 Task subagent 하나를 띄운다.

- `subagent_type`: `generalPurpose`
- `model`: `how explainer` 줄, 기본값 `claude-opus-5-5-xhigh`
- `readonly`: `true`

`references/explainer-prompt.md`에 모든 탐색자의 발견을 채워 넣어 프롬프트를 만든다.

## 4단계. 제시

설명자의 출력을 사용자에게 제시한다. 명확성을 위해, 혹은 대화 맥락을 반영해 가볍게 손보는 것은 괜찮다. 크게 다시 쓰지는 않는다.

## 출력 형식

설명은 `references/explainer-prompt.md`에 정의된 섹션을 쓰고, 해당하지 않는 섹션은 뺀다. Overview, Key Concepts, How It Works, Where Things Live, Gotchas.
