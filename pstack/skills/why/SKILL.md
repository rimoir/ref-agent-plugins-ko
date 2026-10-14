---
name: why
description: "'why does X work this way', 'why we picked Y'(X가 왜 이렇게 동작하나, 왜 Y를 골랐나) 같은 질문, 설계 근거, 회귀, 포스트모템, 데이터에 근거한 임곗값에 쓴다. 사용 가능한 MCP를 찾아 증거 범주별(소스 관리, 이슈 트래커, 장문 문서, 실시간 채팅, 인프라 관측, 오류 추적, 제품 분석 웨어하우스)로 병렬 조회한 뒤, 결정과 트레이드오프를 출처와 함께 정리해 돌려준다. 런타임 동작은 how를 쓴다."
disable-model-invocation: true
---

# Why

코드 뒤에 있는 동기와 의도를 조사한다. 짝이 되는 `how` 스킬은 코드가 무엇을 하고 어떻게 동작하는지 답한다. `why`는 어떤 힘이 그 모양을 만들었는지 답한다.

아래의 각 spawn은 `pstack-models.mdc` 규칙의 역할 줄 하나와 기본값을 지정한다. `model`은 그 줄의 값으로 설정하고, 규칙이나 그 줄이 없으면 기본값으로 설정한다. 값이 `auto`나 `inherit-parent`면 `model`을 비워 둔다. Task 도구가 slug를 거부하면 기본값을 쓰고 그 사실을 밝힌다. 기본값마저 거부하면 오류 메시지에 나온 같은 계열의 가장 가까운 유효 slug를 쓴다. 각 subagent의 추론 수준과 속도(fast 또는 표준)는 **poteto-mode** 스킬의 Subagents 절에 따라 작업에 맞게 고른다.

모든 spawn은 `generalPurpose`에 `readonly: false`(agent 모드)로 띄운다. **readonly/Ask 모드를 쓰지 않는다.** MCP 접근이 사라져 MCP 기반 조사자와 synthesizer의 인용 표본 검증이 동작하지 않는다. 그래도 조사자는 아무것도 쓰지 않아야 한다.

## 작업 태도

**신중하고 조심스럽고 정확한 조사자**로 일한다. 아는 것과 추론하는 것을 정직하게 구분한다. 확신도 체계와 표현 가이드 전체는 `references/epistemics.md`를 읽는다. synthesizer는 이를 반드시 따른다.

## Step 1. 대상과 질문 파악

**대상**은 보통 코드 한 덩어리, 패턴, 기능, 이름 붙은 설계 결정이다. **질문**은 보통 설계 근거, 트레이드오프, 동기가 된 엣지 케이스, 외부 제약, 죽은 코드, 넓은 히스토리 훑기다.

대상이 모호하면("왜 이렇게 하지?"처럼 가리키는 것이 분명하지 않을 때) 대화 맥락(열린 파일, 최근 수정, 커서 위치, 방금 논의한 것)에서 최선의 추측을 한다. 빗나갔을 때 사용자가 바로잡을 수 있게 해석을 짧게 밝히고 진행한다.

## Step 2. 코드 기준점 확보

조사자를 띄우기 전에 시드 맥락을 직접 만든다. 파일 경로와 줄 범위, 핵심 심볼(함수, 클래스, 상수), 대상을 건드린 최근 커밋 몇 개, 머지 커밋의 PR 번호(제목 줄의 `(#1234)` 패턴), 연결된 티켓 ID다. 마지막으로 건드린 커밋은 `git blame -L <start>,<end> <file>`, 이름 변경을 따라가며 패치까지 포함한 전체 이력은 `git log --follow -p -- <file>`, PR 번호가 보이는 최근 커밋은 `git log --oneline -20 -- <file>`, PR 번호 추출은 `git log -1 --format=%B <commit>`로 한다. 그다음 의미 있는 커밋마다 PR 본문과 논의를 가져온다. `gh pr view <number> --json title,body,author,createdAt,mergedAt,labels,closingIssuesReferences,comments,reviews`. 이 기준점은 모든 조사자와 synthesizer에게 간다.

## Step 3. 병렬 조사자 띄우기

**기본은 전체 병렬 조사다.** 최소한이 아니라 빠짐없는 커버리지 맵이 목표다. 검색을 건너뛰지 말고, 결과가 없었다는 사실을 기록한다.

### 탐색

조사자를 띄우기 전에 Cursor 환경에서 사용 가능한 MCP 목록을 뽑는다. 사용 가능한 도구 맵이 있으면 그것을 쓴다. 없으면 Cursor가 노출하는 `mcps/` 디렉터리에서 활성화된 MCP 서버를 살핀다.

사용 가능한 MCP를 각각 하나의 증거 범주에 대응시킨다.

1. 소스 관리 히스토리
2. 이슈·티켓 트래커
3. 장문 문서
4. 실시간 팀 채팅
5. 인프라 관측
6. 오류·예외 추적
7. 제품 분석 웨어하우스

소스 관리는 git과 `gh`로 언제나 쓸 수 있다. 나머지 여섯은 MCP 이름, 서버 지침, 도구 이름, 리소스 설명자로 분류한다. MCP가 여러 범주에 맞을 수 있으면 주된 증거에 맞는 범주를 고른다. 모호한 경우는 커버리지 맵(coverage map)에 기록한다.

대응하는 MCP가 있는 범주마다 조사자를 하나씩, 모두 한 메시지에서 띄워 동시에 돌게 한다. 각 조사자는 정확히 하나의 도구나 MCP만 맡는다. 에이전트 하나에 여러 MCP를 맡기지 않는다. `model`: `why investigators` 줄, 기본값 `grok-4.7-xhigh-fast`.

각 조사자의 프롬프트는 `references/investigator-prompt.md`를 채운 것에 다음을 더한다.
- 선택한 MCP용 범주 플레이북 `references/sources/<source>.md`. `references/source-playbook.md`의 예시를 바탕으로 맞춘다
- 대상 코드가 **방어적으로 보이면**(null 검사, 재시도 로직, 타임아웃 처리, 속도 제한, 기능 플래그, egress 가드, OOM 핸들러) `references/sources/incident-postmortem.md`
- 코드 기준점과 사용자의 원래 질문

### 조사자 명단, 사용 가능한 증거 범주마다 하나

아래 각 범주는 "가장 강하다" 뒤에 적은 한 가지 모양의 "왜"를 드러내기 좋은 자리에 있다. 무엇이 돌아올지 예상하고, 범주가 빈 결과를 내면 그 빈틈을 이름 붙이고, 드물게 무관함이 증명되는 경우에만 건너뛰기를 정당화하는 데 쓴다.

1. **소스 관리** (git 히스토리, PR용 `gh`, 코드 주석, 테스트). 항상 띄운다. 유일하게 보장되는 출처다. *리뷰 중에 기록된 구현 시점의 근거*에 가장 강하다.
2. **이슈·티켓 트래커** (예: Linear, Jira, GitHub Issues, Plane, Shortcut MCP). *제품이나 비즈니스 쪽 강제 요인*에 가장 강하다. 이유가 엔지니어링 바깥에 있을 때 특히 강하다.
3. **장문 문서** (예: Notion, Confluence, Google Docs, Coda MCP). 코드가 되기 전에 글로 먼저 쓴 *장문의 설계 근거*에 가장 강하다.
4. **실시간 팀 채팅** (예: Slack, Discord, Microsoft Teams, Mattermost MCP). *문서까지 가지 못한 실시간 논의*에 가장 강하다. 소스 관리, 티켓, 문서 기록이 빈약할 때 특히 중요하다.
5. **인프라 관측** (예: Datadog, New Relic, Honeycomb, Grafana, Splunk MCP). *코드의 동기가 된 인프라와 런타임 현실*에 가장 강하다. 대상이 인프라 신호(타임아웃, 재시도, 속도 제한, 서킷 브레이커)에 반응할 때 특히 강하다.
6. **오류·예외 추적** (예: Sentry, Rollbar, Bugsnag, Airbrake MCP). *방어 코드나 교정 코드의 동기가 된 구체적 예외와 오류 궤적*에 가장 강하다. catch 블록, null 가드, 타입 검사, 재시도 같은 방어에 특히 강하다.
7. **제품 분석 웨어하우스** (예: Databricks, Snowflake, BigQuery, ClickHouse, dbt, Redshift MCP). *코드를 빚은 제품과 데이터 현실*에 가장 강하다. 플래그로 막힌 코드, 실험 기반 출시, 데이터 마이그레이션, "이 숫자는 어디서 왔나" 같은 질문에 특히 강하다.

### 조사자를 건너뛸 때

**명시적이고 글로 적은 정당화**가 있을 때만 건너뛰고, 그 정당화는 최종 Sources Consulted에 들어간다. 유효한 이유는 두 가지다.

- 이 환경에 **그 범주에 맞는 MCP가 없다**. 선택이 아니라 빈틈으로 표시한다. "Real-time team chat skipped. No matching MCP available, so the conversational record was not searchable."(실시간 팀 채팅 건너뜀. 맞는 MCP가 없어 대화 기록을 검색할 수 없었다.)
- **출처가 무관함이 증명된다**. "아마 무관하다"로는 안 된다. 기준이 높다. "Error / exception tracking skipped. Target is a build-time script with no runtime code path."(오류·예외 추적 건너뜀. 대상이 런타임 코드 경로가 없는 빌드 시점 스크립트다.)

범위를 가늠해 보니 커밋 하나짜리 사소한 대상이고 PR 설명에 이미 완전한 답이 있다면, 사용 가능한 일곱 범주 검색이 모두 불필요함을 **확인한 뒤에만** 바로 답해도 된다. 그렇다는 것을 명시한다. 드물어야 한다.

## Step 4. 종합

synthesizer를 하나 띄운다. `model`: `why synthesizer` 줄, 기본값 `claude-opus-5-5-xhigh`. 받는 것은 다음과 같다.
1. 조사자 결과. 결과 없음과 정당화와 함께 건너뛴 범주까지 포함한다
2. 코드 기준점
3. 사용자의 원래 질문
4. `references/epistemics.md`의 인식론 체계
5. `references/synthesizer-prompt.md`의 synthesizer 프롬프트 템플릿

## Step 5. 제시

synthesizer의 출력을 사용자에게 제시한다. 명료하게 가볍게 다듬거나 대화에서 얻은 맥락을 보태도 되지만, **확신도 표현은 고쳐 쓰지 않는다**.

## 출력 형식

구조는 `references/synthesizer-prompt.md`의 것을 따른다. The Question, The Code in Question, What We Found, What We Can Reasonably Infer, Competing Hypotheses, What We Don't Know, Sources Consulted, Confidence Summary. 필요하면 조정하되 확신도 구분은 그대로 지키고, Sources Consulted는 조사자마다 한 줄로 유지한다. 아무것도 돌려주지 않았거나 건너뛴 조사자도 이유와 함께 포함한다.

Sources Consulted 다음에, 사용자의 `why` 질문이 이 코드를 바꾸기 위한 사전 작업이라면 계보 조사 결과를 변경 계획용 Preserve / Change / Avoid / Risk 제약 집합으로 바꾼다.

## 피해야 할 흔한 실패

- **최신성 편향(recency bias)**. 가장 최근 커밋이 권위 있다고 가정하는 것. 현재 모양은 대개 더 이른 여러 결정이 쌓인 결과다. 거슬러 올라간다.

