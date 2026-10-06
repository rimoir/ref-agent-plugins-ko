# Matt Pocock Skills

Claude Code가 불러오는 에이전트 스킬(슬래시 명령과 동작) 모음이다. 스킬은 버킷별로 나뉘어 있고, `/setup-matt-pocock-skills`가 만들어 내는 저장소별 설정을 읽어서 쓴다.

## 용어

**이슈 트래커(Issue tracker)**:
저장소의 이슈를 보관하는 도구다. GitHub Issues, Linear, 로컬 `.scratch/` 마크다운 규칙 같은 것이 있다. `to-tickets`, `to-spec`, `triage` 같은 스킬이 여기서 읽고 여기에 쓴다.
_Avoid_: backlog manager, backlog backend, issue host

**이슈(Issue)**:
**이슈 트래커** 안에서 추적하는 작업 단위 하나다. 버그, 작업, 스펙, 또는 `to-tickets`가 만든 슬라이스가 이에 해당한다.
_Avoid_: ticket(티켓이라고 부르는 외부 시스템을 인용할 때나 아래의 **결정 티켓**을 가리킬 때만 쓴다)

**결정 티켓(Decision ticket)**:
`wayfinder`의 작업 단위다. `wayfinder:map`의 하위 **이슈**로, 실행할 작업의 한 부분이 아니라 결정으로 해소되는 *질문*을 담는다. **결정**이라는 수식어가 있어야 구현 티켓과 구별된다. `wayfinder`는 처음에 이 용어를 쓰고 이후에는 "티켓"으로 줄여 쓴다.

**분류 역할(Triage role)**:
분류(triage) 과정에서 **이슈**에 붙이는 상태 기계 라벨의 표준 이름이다(예: `needs-triage`, `ready-for-afk`). 각 역할은 `docs/agents/triage-labels.md`를 거쳐 **이슈 트래커**의 실제 라벨 문자열에 대응한다.

## 관계

- **이슈 트래커** 하나에 **이슈**가 여러 개 있다.
- **이슈** 하나에는 한 번에 **분류 역할** 하나가 붙는다.
- **결정 티켓**은 **이슈**다(`wayfinder:map`의 하위 이슈).

## 모호한 점 정리

- "backlog"는 예전에 이슈를 보관하는 *도구*와 그 안에 쌓인 *작업 전체*를 모두 뜻했다. 정리: 도구는 **이슈 트래커**라고 부르고, "backlog"는 더 이상 도메인 용어로 쓰지 않는다.
- "backlog backend" / "backlog manager". 정리: **이슈 트래커** 하나로 합쳤다.
