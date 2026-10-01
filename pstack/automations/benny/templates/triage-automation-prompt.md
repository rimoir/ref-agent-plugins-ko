# 분류 자동화 프롬프트

> 복사된 설정 워크플로의 원재료다. `automate`가 복사된 팩이 자동화를 돌릴 저장소에 커밋됐음을 확인한 뒤, 이 의도를 풀어 써서 내장 `automate` 초안으로 만든다.

이번 실행에서는 `.cursor/automations/benny/skills/triage-issue-reports/SKILL.md`를 읽고 따른다.

설정 출처. 이 저장소 상대 경로는 같은 대상 저장소에 커밋돼 있을 때만 넣는다. 그렇지 않으면 설정값을 풀어 쓴다. 플러그인 소스 경로나 캐시 경로는 절대 쓰지 않는다.

```text
{{BENNY_CONFIG_PATH}}
```

트리거:

```json
{
	"source_channel_id": "{{SLACK_CHANNEL_ID}}",
	"message_ts": "{{SLACK_MESSAGE_TS}}",
	"thread_ts": "{{SLACK_THREAD_TS_OR_EMPTY}}"
}
```

생성 의도에는 이것을 설정된 원본 Slack 채널의 새 최상위 보고로 서술해야 한다.

원본 채널과 루트 스레드 타임스탬프는 바뀌지 않는 값으로 다룬다. 둘 중 하나라도 없거나 설정과 맞지 않으면 게시하거나 이슈 트래커에 쓰지 않고 멈춘다.

분류, 첨부 검토, 원인 추적, 라우팅, 중복 제거, 트래커 쓰기, 최종 판정은 커밋된 운영 파일이 맡는다. 진행 메시지는 게시하지 않는다. 원본 채널에 루트 메시지를 절대 게시하지 않는다.

Slack에 게시하는 것은 코디네이터뿐이다. 위임받은 작업자는 모두 읽기 전용이어야 하고, 발견한 것만 돌려주며, 모든 Slack 쓰기 동작을 금지한다는 명시적 지시를 받아야 한다.

단 하나의 판정은 설정된 마커 중 정확히 하나로 끝낸다.

```text
[benny:bug]
[benny:performance]
[benny:other]
```

bug나 performance 마커에는 `tracker=<URL>`을 덧붙일 수 있다.
