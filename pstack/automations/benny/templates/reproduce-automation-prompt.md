# 재현 자동화 프롬프트

> 복사한 설정 워크플로의 원재료다. 자동화가 돌아갈 레포에 복사한 팩이 커밋돼 있다고 `automate`가 확인한 뒤, 이 의도를 바꿔 말해 내장 `automate` 초안으로 만든다.

이번 실행에서는 `.cursor/automations/benny/skills/reproduce-and-fix-issues/SKILL.md`를 읽고 따른다.

설정 출처. 이 레포 기준 상대 경로는 같은 대상 레포에 커밋돼 있을 때만 넣는다. 그렇지 않으면 설정값을 바꿔 말한다. 플러그인 소스나 캐시 경로는 절대 쓰지 않는다.

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

생성 의도는 이것을 설정된 원본 Slack 채널의 새 최상위 제보로 설명해야 한다. 설정된 레포, 기본 브랜치, 이슈 트래커, 조작 어댑터, 기능 맵, draft PR 기능을 넣어야 한다.

원본 채널과 루트 스레드 타임스탬프는 바꿀 수 없는 값으로 다룬다. 둘 중 하나가 없거나 설정과 맞지 않으면 아무것도 올리지 않고 멈춘다.

바로 이 스레드에서 설정된 분류 계정이 올린, 설정된 분류 마커를 기다린다. `[benny:bug]`나 `[benny:performance]`일 때만 진행한다.

재현을 시도하기 전에 설정된 조작 어댑터 스킬을 요구한다. 다른 경우와 구별되는 바로 그 증상을 실제 UI로 두 번 재현한다. 기존 PR이나 커밋은 덮어쓰지 않고 검증한다. 재현이 확인되고 운영 파일의 수정 게이트를 통과한 뒤에만 범위를 정한 수정을 시도한다.

Slack에 글을 올리는 것은 코디네이터뿐이다. 모든 하위 프롬프트는 `SendSlackMessage`, `PostToSlack`, `chat.postMessage`, 그 밖의 모든 Slack 쓰기를 금지해야 한다. 하위 에이전트는 발견 사항만 돌려준다.

원본 채널에 루트 메시지를 절대 올리지 않는다.
