# benny

benny는 slack 이슈 보고용 cursor 자동화 두 개를 제공한다. 하나는 보고를 하나씩 분류한다. 다른 하나는 확인된 버그를 재현하고 작은 draft 수정을 준비할 수도 있다.

이 디렉터리의 파일은 잠들어 있는 설정 및 자동화 원본이다. 슬래시 스킬로 나타나지 않는다.

## 설정하기

1. cursor에 [`FOR_AGENTS.md`](./FOR_AGENTS.md)를 가리키고 대상 저장소 이름을 알려 준다.
2. 설정 과정이 이 디렉터리 전체를 대상의 `.cursor/automations/benny/`에 병합하게 둔다. 대상에만 있는 파일은 보존해야 하고, 로컬 수정을 덮어쓰지 말고 충돌을 검토해야 한다.
3. 공유 의존성을 위해 설정 과정이 대상 저장소의 `.cursor/settings.json`에서 pstack을 켜게 둔다.

```json
{
	"plugins": {
		"pstack": { "enabled": true }
	}
}
```

4. 사용자 소유 설정은 복사한 팩 밖, 예를 들어 `.cursor/benny/`에 둔다. [`configuration.example.yaml`](./templates/configuration.example.yaml)과 [`feature-map.example.md`](./skills/reproduce-and-fix-issues/references/feature-map.example.md)를 고쳐 쓴다.
5. 어느 자동화든 켜기 전에 `.cursor/settings.json`, `.cursor/automations/benny/`, 비밀 값이 없는 설정을 커밋한다.
6. 새 자동화 초안을 각각 검토하거나 기존 자동화를 그 편집기에서 갱신한다. 그다음 무해한 테스트 보고를 보내고, 원본 채널에 올라가는 글이 모두 원래 스레드 안에 머무는지 확인한다.
