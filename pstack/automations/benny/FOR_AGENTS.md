# benny 자동화 의도

## 자동화하고 싶은 것

하나의 slack 이슈 채널에서 함께 일하는 cursor 자동화 두 개를 원한다.

### 자동화 1: 이슈 보고 triage

- 트리거: 설정한 원본 slack 채널에 누군가 새 최상위 보고를 올리면, 이 자동화가 그 보고에서 시작하고 원래 스레드 좌표를 유지하기를 원한다.
- 동작: 스레드와 첨부 파일을 읽고, 보고를 버그 또는 성능 이슈, 기능 요청, 질문 또는 피드백, 재배정 중 하나로 분류하고, 라우팅하기 전에 담당일 가능성이 높은 계층을 추적하기를 원한다.
- 트래커: 설정한 트래커에서 중복을 검색하고, 확신할 수 있는 중복은 갱신하고, 명백히 새로운 버그일 때만 티켓을 만들기를 원한다.
- 도구: slack 스레드 읽기·답글 권한, 설정한 트래커 연동, 선택 사항인 라우팅 맵을 원한다.
- 산출물: 원본 스레드에 짧은 판정과 `[benny:bug]`, `[benny:performance]`, `[benny:other]` 중 하나를 담은 답글이 정확히 하나 달리기를 원한다. 버그나 성능 마커에는 트래커 url을 붙여도 된다.
- 경계: 이 자동화가 원본 채널에 루트 메시지를 올리는 일은 절대 없기를 원한다.

### 자동화 2: 확인된 버그 재현과 수정

- 트리거: 이 자동화가 같은 새 최상위 보고, 또는 설정 중에 고른 다른 지원 트리거에서 시작한 뒤, 원래 스레드에서 신뢰할 수 있는 triage 마커를 기다리기를 원한다.
- 관문: 누군가 수정을 분명히 맡고 있으면 멈추기를 원한다. 이미 있는 풀 리퀘스트나 머지된 커밋이 보고를 고칠 수 있다면, 경쟁하는 변경 대신 검증하기를 원한다.
- 동작: 설정한 제어 어댑터와 기능 맵을 써서 정확한 증상을 실제 ui로 두 번 재현하고, 스크린샷, 영상, 읽기 전용 상태 교차 확인을 남기기를 원한다.
- 수정: 이미 있는 풀 리퀘스트는 덮어쓰지 않고 검증하기를 원한다. 재현이 확인된 뒤에는 범위를 제한한 근본 원인 수정을 한 번 시도할 수 있고, 테스트가 싸면 tdd를 쓰고, 영향 범위를 스모크 테스트하고, 수정 전후 증명을 통과할 때만 드래프트 풀 리퀘스트를 연다.
- 도구: slack 스레드 읽기·답글 권한, 저장소와 히스토리 접근, 드래프트 풀 리퀘스트 생성, 설정한 트래커, 제어 어댑터를 원한다.
- 산출물: 원본 스레드나 선택 사항인 운영 스레드에 증거와 검증된 결과를 남기고, 선택적으로 드래프트 풀 리퀘스트를 열기를 원한다. 업데이트는 간결해야 한다.
- 경계: 이 자동화가 원본 채널에 루트 메시지를 올리는 일은 절대 없기를 원한다.

### 공통 규칙

- 원본 채널과 루트 스레드 좌표가 실행 내내 바뀌지 않기를 원한다.
- 유틸리티 봇과 디버그 봇은 위임이나 수정 담당이 아니라 증거로 본다.
- subagent가 돕는 것은 허용하지만, slack에 게시하거나 slack 자격 증명을 받을 수는 없다.
- 이 팩 전체가 대상 저장소의 `.cursor/automations/benny/`에 커밋되기를 원한다. 그 안의 `SKILL.md` 파일은 등록된 플러그인 스킬이 아니라 자동화에 직접 주는 지시다.
- pstack은 `how`, `why`, `tdd`, `unslop`, 필요한 principle 스킬 같은 공용 의존성을 위해서만, 대상 저장소에 커밋된 `.cursor/settings.json`으로 활성화되기를 원한다.
- 각 실제 자동화 프롬프트가 커밋된 운영 파일을 직접 읽기를 원한다. 플러그인 캐시 경로, 복사한 발췌, 슬래시 스킬 탐색은 원하지 않는다.
- 사용자 소유 설정, 기능 맵, 라우팅 맵, 비밀은 `.cursor/automations/benny/` 밖에 두어 팩 갱신이 덮어쓰지 못하게 한다.
- 채널 좌표, 트래커 접근, 제어 어댑터, 기능 맵이 없거나 불확실하면 두 자동화 모두 닫힌 채로 실패하기를 원한다.
- 드래프트 풀 리퀘스트만 원한다. 머지하거나 배포하지 않는다.

### 내 설정

- 원본 slack 채널: `<channel>`
- 선택 사항인 운영 채널: `<channel or none>`
- 저장소와 기본 브랜치: `<repo>`, `<branch>`
- 트래커: `<type, team, project, labels, intake status>`
- 라우팅 맵: `<path or none>`
- triage 신원: `<slack identity>`
- 제어 스킬: `<configured skill or adapter>`
- 기능 맵: `<committed same-repo path outside the copied pack, or behavior to paraphrase>`
- 모델: `<triage, reproduce, code, media review>`
- 상태 이모지 문자열: `<seen, reproducing, reproduced, blocked, fixing, failed, pull request opened>`
- 예산: `<polling, verdict wait, follow-up, repro, rejection, fix>`
- 선택 사항인 봇 토큰 기능: `<none, file download, or editable operations status>`

[`configuration.example.yaml`](./templates/configuration.example.yaml)과 [`feature-map.example.md`](./skills/reproduce-and-fix-issues/references/feature-map.example.md)에서 시작한다. 이 팩 밖, 예를 들어 `.cursor/benny/` 아래에 복사해서 채운다. 비밀 값은 비밀 관리자나 환경 변수에 둔다.

## 에이전트에게

사람은 cursor에게 이 파일을 가리키는 것으로 설정을 시작한다. 탐색으로 찾은 benny 슬래시 스킬을 찾거나 호출하지 않는다.

1. 자동화를 실행할 저장소가 어디인지 묻는다.
2. 이 `FOR_AGENTS.md`가 들어 있는 디렉터리를 원본 팩으로 본다.
3. 원본 팩 전체를 `<target-repository>/.cursor/automations/benny/`에 병합한다.
4. 목적지에만 있는 파일은 모두 보존한다. 관련 없는 파일을 지우거나 사용자 소유 설정, 기능 맵, 라우팅 맵을 덮어쓰지 않는다.
5. 원본이 관리하는 경로에 있는 기존 목적지 파일이 다르면 diff를 검토하고 로컬 수정을 버리지 않게 병합한다. 소유가 모호하면 교체하기 전에 멈추고 묻는다.
6. 복사된 `FOR_AGENTS.md`와 `skills/setup-benny/SKILL.md`가 대상 저장소에 있는지 확인한다.
7. 대상 저장소의 `.cursor/automations/benny/skills/setup-benny/SKILL.md`를 직접 읽고 따른다.

대상 저장소의 `.cursor/settings.json`에 다음 항목을 병합해 주기를 원한다.

```json
{
	"plugins": {
		"pstack": { "enabled": true }
	}
}
```

관련 없는 설정과 플러그인은 모두 보존한다. 기존 파일이 jsonc라면 주석과 올바른 jsonc 문법을 보존한다.

대상 저장소를 루트로 한 새 에이전트에서 검증하기를 원한다. pstack의 `how`, `why`, `tdd`, `unslop`, 그리고 benny가 쓰는 principle 스킬이 프로젝트 범위에서 해석되는지 확인한다. 현재 세션이나 사용자 범위 설치에서 불러온 스킬은 세지 않는다.

프로젝트 범위 플러그인을 쓸 수 없거나 공용 의존성 중 하나라도 해석되지 않으면 멈추고 무엇이 실패했는지 설명한다. `.cursor/automations/benny/skills/`를 플러그인 매니페스트에 추가하거나 그 파일이 슬래시 스킬 목록에 나타나리라 기대하지 않는다.

두 자동화 중 어느 것이든 활성화하기 전에 `.cursor/settings.json`, `.cursor/automations/benny/`, 참조하는 비밀 없는 설정을 커밋해야 한다고 내게 알려 준다. 내가 명시적으로 요청하기 전에는 자동화를 만들거나 수정하지 않는다.

처음 만들 때는 내장 `/automate`를 triage에 한 번, repro·수정에 한 번 쓴다. 두 번째를 시작하기 전에 첫 번째 자동화의 초안 검토, 승인, 준비 여부 확인, Automations 편집기 인계를 마친다.

이 의도와 완성된 설정을 각 초안에 풀어 쓴다. triage 프롬프트는 `.cursor/automations/benny/skills/triage-issue-reports/SKILL.md`를 읽고 따라야 한다. repro 프롬프트는 `.cursor/automations/benny/skills/reproduce-and-fix-issues/SKILL.md`를 읽고 따라야 한다. 이 저장소 기준 상대 경로는 자동화가 실행될 저장소에 커밋되어 있음을 `/automate`가 확인한 뒤에만 쓴다.

기존 자동화는 `/automate`로 살피거나 수정하지 않는다. 설정을 검증한 뒤, 복사된 설정 파일의 간결한 필드 체크리스트를 써서 내가 각 자동화를 편집기에서 직접 수정할 수 있게 한다. 중복본을 만들지 않는다.
