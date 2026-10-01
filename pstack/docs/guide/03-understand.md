# 바꾸기 전에 코드 이해하기

이해하지 못한 코드를 고치면 미묘한 회귀가 출시된다. pstack은 들어가는 길을 네 가지 준다. `/how`는 코드가 지금 무엇을 하는지 설명한다. `/why`는 코드가 그런 모양이 된 이유를 캐낸다. `/teach`는 둘을 섞어 하나의 설명으로 만든다. `/recall`은 한 주제에 대한 자기 최근 맥락을 다시 세운다.

![탐정이 돋보기로 기계 설계도를 살피는 동안 로봇들이 사건 파일을 가져온다. 뒤편 증거판에는 /how와 /why 아래로 단서들이 이어져 있다.](./images/understanding.jpg)

## `/how`로 동작 추적하기

```text
/how do we dedupe notifications? is there an n+1 when we look up subscribers?
```

실제로 품은 질문을 한다. [`/how`](../../skills/how/SKILL.md)는 코드를 읽고, 시니어 엔지니어가 그 하위 시스템에 당신을 온보딩해 주는 수준으로 답한다. 런타임 흐름, 핵심 타입, 뻔하지 않은 부분이 담긴다. 큰 하위 시스템이면 먼저 읽기 전용 탐색자 두세 개에서 네 개까지 펼친다. 좁은 질문이면 그냥 읽고 설명한다.

## `/why`로 역사 캐내기

```text
/why was the retry limit set to five? does the reason still hold?
```

[`/why`](../../skills/why/SKILL.md)는 미제 사건을 맡은 탐정처럼 일한다. 소스 관리에서 시작해, MCP가 열어 주는 증거 범주를 무엇이든 병렬로 조회한다. 이슈 트래커, 장문 문서, 팀 채팅, 관측, 에러 추적, 분석 같은 것들이다. 보고서는 모든 것을 인용하고, 직접 증거와 추론을 구분하고, 기록이 빈약하면 "~로 보인다"고 말한다. 결과가 없어도 보고한다. "아무도 이유를 적어 두지 않았다"도 그 자체로 답이기 때문이다.

둘은 자연스럽게 조합된다. 역사가 이 엉망을 설명해 줄 것 같으면 `do why first then how`도 충분히 좋은 프롬프트다.

## `/teach`로 정말 이해하기

```text
/teach me how this PR changes retries. convince me it fixes the cause and not the symptom.
```

[`/teach`](../../skills/teach/SKILL.md)는 요약으로 모자랄 때 쓴다. `/how`와 `/why`를 실행하고(작은 변경이면 둘 중 하나만), 발견한 내용을 다이어그램을 하나씩 쌓아 가는 쉬운 설명으로 엮는다. "convince me(나를 설득해 봐)"라는 틀은 훔쳐 쓸 만하다. 설명을 둘러보기가 아니라 찔러 볼 수 있는 논증으로 바꿔 준다.

## `/recall`로 자기 맥락 다시 세우기

```text
/recall catch me up on the export work from last week
```

[`/recall`](../../skills/recall/SKILL.md)은 자기 최근 채팅과 공유 기록(이슈, 이전 수정, 아직 터지는 에러)을 캐내서, 지금 상황과 다음 할 일을 담은 브리핑을 돌려준다. 한동안 손 놓았던 주제로 돌아올 때 쓴다. 특정 채팅 하나를 재개하고 싶다면 그것은 `/recall`이 아니라 아래의 Session pickup 플레이북이다.

## Session pickup으로 이전 작업 넘겨받기

다른 에이전트가(혹은 지난주의 당신이) 브랜치를 작업 도중에 남겨 뒀다면 이렇게 한다.

```text
/poteto-mode take over this branch. read the decision log, figure out what's done, and continue from there. don't redo finished work.
```

[Session pickup 플레이북](../../skills/poteto-mode/playbooks/session-pickup.md)은 이전 기록을 권위 있는 것으로 다룬다. 브랜치 상태와 결정을 재구성하고, 재개 지점을 정하고, 모든 것을 처음부터 다시 도출하는 대신 물려받은 주장을 원래 목표와 대조해 검증한다.

**함정:** "어차피 에이전트가 코드를 읽을 테니"라며 이 페이지의 스킬을 건너뛰지 않는다. 추적한 모델 없이 수정부터 시작하는 에이전트는 처음 눈에 띈 그럴듯한 지점에서 증상을 고치기 쉽다. `/how`를 먼저 돌리는 편이 두 번째 버그보다 싸다.

다음: [변경 설계하기](./04-design.md).
