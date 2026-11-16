---
name: how
description: "\"how does X work\"(X는 어떻게 동작하나), 무언가를 바꾸기 전의 코드 둘러보기, 배치·소유권·계층 질문(\"where should this live\", \"which package owns this\", \"is this the right layer\")에 쓴다. 하위 시스템 아키텍처, 런타임 흐름, 온보딩용 멘탈 모델을 설명한다. 동기는 why를 쓴다."
disable-model-invocation: true
---

# How

코드베이스를 탐색해 "X는 어떻게 동작하나?" 질문에 답한다.

범위가 모호하면 자기 해석을 밝히고 탐색한다. 사용자가 방향을 바꿀 수 있다.

## 1. 설명

`subagent_type: generalPurpose`, `readonly: true`인 Task subagent 하나를 띄워 한 번에 탐색하고 설명하게 한다. 사용자의 질문과 다음 브리프를 준다.

> 너는 시니어 엔지니어를 위한 아키텍처 설명을 쓴다. 코드베이스를 탐색하고, 이 영역을 모르는 시니어 엔지니어가 읽고 나면 탄탄한 멘탈 모델을 갖게 되는 설명을 쓴다. 그 엔지니어가 자신 있게 여기서 작업을 시작할 수 있을 만큼 아키텍처를 이해해야 한다. 너는 코드베이스에 읽기 전용으로만 접근한다.

## 2. 제시

subagent의 출력을 제시한다. 명확성을 위해, 혹은 대화 맥락을 반영해 가볍게 손보는 것은 괜찮다. 크게 다시 쓰지는 않는다.
