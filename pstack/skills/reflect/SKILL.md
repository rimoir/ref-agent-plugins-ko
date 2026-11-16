---
name: reflect
description: "현재 대화 기록(transcript)을 대상으로 리뷰 subagent 셋을 병렬로 띄워 배운 점을 드러내고, 각각을 기존 스킬의 구체적인 편집으로 연결한다. 사용자가 reflect라고 할 때 쓴다."
disable-model-invocation: true
---

# Reflect

현재 대화에서 오래 남을 배운 점을 캐낸 뒤 스킬 편집으로 연결한다.

사용자가 "reflect"나 "/reflect"라고 하면 호출한다. 대화가 사소하거나, 주제를 벗어났거나, 부모 에이전트가 올바르게 따른 기존 스킬이 이미 다루는 내용이면 건너뛴다. 한 번뿐인 일은 배운 점이 아니다.

## 1. 현재 대화 기록 찾기

팬아웃하기 전에 시스템 프롬프트가 알려 주는 `agent-transcripts/` 디렉터리에서 이 대화의 기록을 찾는다. `~/.cursor/projects/*/`를 glob으로 훑지 않는다. 그러면 워크스페이스 경계를 넘어 관련 없는 프로젝트의 비공개 대화를 읽게 된다.

```bash
ls -t <agent-transcripts>/*.jsonl <agent-transcripts>/*/*.jsonl <agent-transcripts>/*/subagents/*.jsonl 2>/dev/null | head -10
```

이 명령은 옛 평면형(`<id>.jsonl`), 현재 중첩형(`<id>/<id>.jsonl`), subagent형(`<parent>/subagents/<child>.jsonl`) 배치를 모두 다룬다. 후보마다 JSONL 첫 줄을 읽는다. `message.content[0].text`에 대화를 연 사용자 프롬프트가 들어 있는 파일을 쓴다. 맞는 것이 없으면 세션을 압축한 요약을 대신 넘긴다.

## 2. 리뷰어 셋을 병렬로 띄우기

메시지 하나에 `Task` 호출 셋, `subagent_type: generalPurpose`, 에이전트 모드(`readonly: false`)로 띄운다. 리뷰어는 대화 기록이 참조하는 티켓, 채팅 스레드, 관측성 트레이스를 조회하려면 MCP 접근이 필요하고, readonly는 MCP를 빼 버린다.

각 리뷰어와 종합자(synthesizer)는 `pstack-models.mdc` 규칙의 역할 줄 하나와 기본값을 가진다. `model`을 그 줄의 값으로 설정하고, 규칙이나 줄이 없으면 기본값으로 설정한다. 값이 `auto`나 `inherit-parent`이면 `model`을 설정하지 않는다. Task 도구가 slug를 거부하면 기본값을 쓰고 그 사실을 밝힌다. 기본값마저 거부하면 오류 메시지에 나온 같은 계열의 가장 가까운 유효 slug를 쓴다. 각 subagent의 추론 수준과 속도(fast 또는 표준)는 **poteto-mode** 스킬의 Subagents 절에 따라 작업에 맞게 고른다.

| 관점 | 역할 줄 | 기본 `model` | 프롬프트 템플릿 |
|---|---|---|---|
| 판단(Judgment) | `reflect judgment, divergent, synthesizer` | `claude-opus-5-5-xhigh` | `references/judgment-reviewer.md` |
| 도구(Tooling) | `reflect tooling` | `claude-opus-5-5-high-fast` | `references/tooling-reviewer.md` |
| 발산(Divergent) | `reflect judgment, divergent, synthesizer` | `claude-opus-5-5-xhigh` | `references/divergent-reviewer.md` |

각 템플릿을 원문 그대로 넘기고, 표시된 자리에 대화 기록 경로나 요약을 넣는다. 리뷰어는 `Task` 응답 본문으로 발견 사항을 돌려준다.

## 3. 종합

`Task` 호출 하나, `subagent_type: generalPurpose`, `model`은 `reflect judgment, divergent, synthesizer` 줄의 값(기본 `claude-opus-5-5-xhigh`), 에이전트 모드(`readonly: false`)로 돌린다. 종합자는 MCP로 인용을 표본 검증하는데, readonly는 MCP를 빼 버린다. `references/synthesizer.md`를 원문 그대로 넘기고, 표시된 자리에 각 리뷰어의 전체 출력을 넣는다. 종합자는 Accepted / Rejected / Backlog 목록을 돌려준다.

## 4. 구조적 강제 점검

lint 규칙, 스크립트, 메타데이터 플래그, 런타임 검사로 더 확실하게 강제할 수 있는 Accepted 항목은 Backlog로 옮긴다. **encode-lessons-in-structure** 원칙 스킬을 참고한다.

## 5. 적용

Accepted 편집을 적용하기 전에 종합자의 Accepted / Rejected / Backlog 출력 전체를 보여 주고 명시적인 승인을 기다린다. 사용자는 적용할 부분을 고르고 연결 경로를 바꿀 수 있다. 스킬 변경은 조직의 모든 미래 에이전트에 영향을 준다. 자동으로 적용하지 않는다.

Backlog 항목은 기다리지 않고 팀의 devex·backlog 트래커에 등록한다. 승인을 기다리는 것은 Accepted 목록뿐이다.

`plugins/cache/` 아래의 스킬은 절대 고치지 않는다. 승인 전에 복사할 위치(`.cursor/skills/<skill>/` 또는 `~/.cursor/skills/<skill>/`)를 보여 준다. 승인 후 스킬 폴더를 그곳에 복사하고 복사본을 고친다. PR을 열거나 push하지 않는다.

승인된 행마다 Routing을 정확히 따른다.

- 사소한 기존 스킬 편집(글머리표 한 줄, 다듬은 문장 하나, 낡은 사실 하나 수정): 부모 에이전트가 직접 한다.
- 실질적인 기존 스킬 편집(새 섹션, 새 패턴 표, 약 10줄 초과): Cursor 내장 `create-skill` 스킬에 넘겨 초안·테스트·반복 루프를 돌린다.
- `tune description: <skill path>`(스킬은 있는데 발동해야 할 때 발동하지 않은 경우): `create-skill`에 넘겨 description 최적화 루프를 돌린다.
- `new skill via create-skill: <kebab-name>`: 생성을 `create-skill`에 넘긴다. 형태를 즉석에서 지어내지 않는다.

환경에 SKILL.md 검증기가 있으면 끝났다고 선언하기 전에 건드린 스킬마다 돌린다.

## 6. 사용자에게 요약

서두 없이 짧은 목록으로 쓴다.

- 적용한 편집: `<skill path>`. 바뀐 내용을 한 줄씩.
- 새로 만든 스킬: `<skill path>`. 한 줄씩(드물다).
- devex 트래커에 등록한 Backlog: `<issue title>` (`<tags>`). 한 줄씩.
- 버린 것: 거부된 발견 하나당 한 줄과 종합자가 댄 이유.
