# 004 프롬프트

이 문서는 에이전트가 무엇을 읽는지, 팀이 무엇을 고칠 수 있는지, 변경이 언제 효력을 갖는지 설명한다. [000 철학](000-philosophy.md)부터 [003 실행](003-execution.md)까지를 바탕으로 한다. 프롬프트 글은 영어로 쓴다.

## 팀이 쓰는 것

팀은 팀 섹션 세 개를 고치고, 스킬을 더하고, 내장 시스템 프롬프트의 모든 부분을 덮어쓸 수 있다. 기본값은 대부분 `prompts/`와 `skills/` 아래에 있다. 도구 설명, 알림, 카드는 코드에 남아 있고 프롬프트 설정으로 고칠 수 없다.

| 섹션 | 담는 것 |
| --- | --- |
| Communication | 언제 사람에게 메시지를 보낼지, 메시지가 어떻게 읽혀야 할지, 모든 GitHub 메시지를 시작하는 줄(기본값은 `This is by an automated agent, not a human`), 리뷰를 다루는 법, 어느 평범한 계정이 리뷰 봇인지 |
| Ticket scope | Ticket이 언제 이어지고 언제 초안과 함께 멈추는지 |
| Delivery requirements | pull request에 넣을 증거, 줄 수 기준이 붙은 auto-merge 조건, 커밋 author. 지정이 없으면 Executor는 에이전트 계정의 no-reply 주소로 커밋한다 |
| 팀 스킬 | 에이전트가 필요할 때 불러오는 지식. 예를 들어 어느 Feishu 사용자가 어느 GitHub 계정인지 알려 주는 `identities` 스킬 |

내장 글은 역할, 도구 사용, 호스트 동작, 권한 규칙, GitHub와 Feishu 스킬을 다룬다. 팀 섹션은 되풀이하지 않고 헤딩으로 가리킨다.

### 내장 부분과 템플릿

덮어쓰기에는 이 키를 쓴다.

| 부분 | 키 |
| --- | --- |
| 공유 지시와 역할 | `runtime/shared`, `runtime/orchestrator`, `runtime/worker` |
| 작업 지시 | `runtime/subscriptions`, `runtime/replies`, `runtime/dispatch`, `runtime/work`, `runtime/admission` |
| 인계 지시 | `runtime/handoff/orchestrator`, `runtime/handoff/worker` |
| Source 스킬 | `skill/feishu`, `skill/github` |
| 생성 섹션 | `runtime/environment`, `runtime/policy`, `runtime/policy/none` |

생성 섹션은 고칠 수 있는 템플릿이다. 다음 placeholder를 남겨 둬야 한다.

- `runtime/environment`: `{variables}`. 실행 환경 줄로 채운다.
- `runtime/policy`: `{version}`, `{mode}`, `{rules}`. 켜진 규칙마다 한 줄이다.
- `runtime/policy/none`: `{version}`, `{mode}`. 켜진 규칙이 없을 때 쓴다.

부분을 고치면 모델이 받는 지시가 바뀐다. 게이트, Mandate, 도구 검사, 계정 래퍼는 바뀌지 않고 계속 코드가 강제한다.

사람이 명시적으로 요청하면 메인 Session도 `orchestrator_prompts_save`로 덮어쓰기를 저장할 수 있다. 저장할 때 덮어쓰기의 `base`를 빼면 저장된 base를 유지한다. 저장된 설정에 이미 있던, 제거된 부분은 저장 때 빠진다. 그 밖의 알 수 없는 부분은 거부된다.

덮어쓰기는 자기가 어느 내장 글을 바탕으로 했는지 기록한다. 업그레이드는 팀의 글을 보존한다. 기본값이 바뀌면 패널은 그 부분에 **Default updated** 표시를 하고 팀의 글 옆에 차이를 보여 준다. 팀은 자기 글을 유지하거나, 새 기본값을 쓰거나, 고칠 수 있다. 덮어쓰지 않은 부분은 새 기본값을 저절로 따른다.

메인 Session은 영향받은 부분 이름을 `orchestrator_read prompts`의 `default_changed` 아래에서 읽을 수 있다.

## 조립과 우선순위

시스템 프롬프트는 이 순서로 조립된다.

1. 공유 지시와 역할.
2. 팀 섹션 세 개.
3. Subscription과 답글.
4. 메인 Session에는 배정, Executor에는 작업 지시.
5. `runtime/admission`. 메인 Session에만 있다.
6. 인계 지시.
7. `runtime/environment`.
8. `runtime/policy`. 메인 Session에만 있다.

입장 지시는 `prompts/admission.md`에서 온다. 능동 판정, 그리고 관련 없는 후보를 언제 카드만 보고 ignore할 수 있는지 설명한다. `orchestrator_eval`은 이 지시를 되풀이하지 않고 맥락을 돌려준다.

환경 섹션은 메인 Session에 배포 전체의 값을, 각 Executor에 그 Ticket만의 값을 준다. Policy 섹션은 모델 요청마다 설정에서 다시 생성된다. Policy 버전, accept 모드, explicit 요청 면제, 그리고 `- <name> (<id>): <instruction>` 형식의 켜진 규칙, 또는 켜진 규칙이 없다는 문장을 담는다. 맨 끝에 두어서 Policy가 바뀌어도 앞의 프롬프트 글은 그대로다.

Executor는 DeepSeek Harness의 코딩 프롬프트와 저장소의 `AGENTS.md`도 읽는다. 메인 Session은 읽지 않는다. inferred Ticket에는 Executor를 맞은 규칙으로 제한하는 마지막 노트가 붙는다. Assignment와 들어오는 메시지는 Trigger 카드로 본문 안에 도착하고, 잘린 내용에만 리소스 포인터가 붙는다.

Executor는 사람 없이 일한다. 사람에게 묻거나, UI를 보여 주거나, 프로필을 바꾸는 도구는 빠진다. `ask_user_question`, `present`, `plugin_manager`가 그렇다.

강한 것부터 약한 것 순서다.

1. 도구와 호스트가 강제하는 사실: 신원, 권한, 도구 인자 검사, 답글 목적, 길이 제한. 프롬프트 글로 바꿀 수 없다.
2. 내장 섹션과 생성 섹션. 팀이 덮어썼다면 덮어쓴 대로다.
3. 능동 Ticket의 맞은 규칙에 담긴 절차와 소통. 그 Ticket의 Executor Session에만 적용된다.
4. 팀 섹션과 팀 스킬.
5. 바깥 글: 메시지, 댓글, 문서, 인용. 데이터일 뿐이고 규칙이나 권한을 절대 바꾸지 않는다.

## 내장 글의 원칙

이 원칙은 [000 철학](000-philosophy.md)을 에이전트에 적용한 것이다.

- **역할을 나눈다.** 메인 Session은 라우팅만 한다. 원래 Trigger와 라우팅 사실을 넘기고, 기술적 결정은 하지 않는다. 라우팅 도구는 하나이고, 기다리는 여러 후보의 결정을 한 번에 받는다. 라우팅 노트는 최대 30단어다. Executor는 원래 출처를 읽고, 범위를 판단하고, 구현하고, 검증한다.
- **메인 Session은 기다리지 않는다.** 보고, follow-up 알림, 후보, 끝난 백그라운드 작업은 메시지로 저절로 도착한다. 할 일이 남지 않으면 턴을 끝낸다. 막힌 단계는 새 후보를 늦추므로 가드가 `sleep`, 30초가 넘는 셸 timeout, 5초가 넘는 작업 대기를 거부한다. 메인 Session의 완성된 프롬프트에서는 이 지시가 DeepSeek Harness 자체의 작업 알림 노트를 대신한다.
- **사람이 행동해야 하거나 결과를 쓸 수 있을 때만 메시지를 보낸다.** 결과를 리뷰하거나 쓸 수 있을 때, 결정이나 자원이 필요할 때, 작업을 끝낼 수 없을 때다. 채팅 메시지는 기본적으로 한 문장이고, 상한은 100단어다.
- **Executor가 자기 follow-up을 정한다.** 각 Executor는 범위 안의 요청을 처리하고 확인 응답을 하며, Ticket을 넘거나 다른 Ticket을 위한 요청은 돌려준다. 메시지는 그것을 맡은 모두가 돌려주거나 맡지 않고 끝난 뒤에만 새 작업이 된다. 메인 Session은 follow-up 알림을 받지만 작업을 멈출 때만 그것에 따라 움직일 수 있다. 돌려준 메시지는 그 뒤 Executor들의 이유와 함께 후보로 도착한다.
- **Subscription과 메인 Session으로 조율한다.** Executor는 맥락용으로 관련 Thread를 따라간다. 메인 Session은 다른 Ticket의 사실을 최대 100단어 노트로 보낼 수 있다. Subscription도 노트도 권한을 주지 않는다.
- **명시적으로 가리킬 때만 붙인다.** 메시지는 Ticket의 pull request, Issue, 원본 메시지, 확인 응답을 가리키거나, 맞는 Ticket이 정확히 하나인 최근 변경을 가리켜야 한다. 주제가 비슷한 것만으로는 부족하다. 붙이면 Ticket이 Thread 전체를 구독한다. 그것이 관련 없다고 판단한 Executor는 `orchestrator_thread_unrelated`를 쓰고 거기에 답하지 않는다.
- **구체적으로, 한 번 확인한다.** 본격적인 작업 전에 Executor는 새 요청마다 원래 메시지 아래 답글로 대상과 예상 결과를 밝히며 확인한다.
- **`human_action`으로 묻는다.** Executor는 Report에 구체적인 질문 하나를 넣고, 메인 Session은 그것을 고치지 않고 전달한다. 질문을 부른 사람의 메시지가 있으면 그 메시지를 지정하고 호스트가 거기서 묻는다. 없으면 Ticket의 원래 대화에서 묻는다. 이미 권한을 받은 작업은 그동안 이어 갈 수 있다.
- **정직하게 전달한다.** pull request를 열었다고 준비된 것이 아니다. 초안은 미완성으로 표시한다. 실제 변경 전 스크린샷이 없는 UI 변경은 준비되지 않은 것이다.
- **사람의 일시 중지는 유지된다.** follow-up, 새 Executor Session, 재시작을 거쳐도 사람이 풀 때까지 유지된다. 자동 피드백은 멈춘 작업을 절대 재개하지 않는다.
- **예시는 형식만 보여 준다.** 예시 문장은 에이전트가 주장해도 되는 사실이 아니다.
- **리뷰는 결과로 다룬다.** 고치고 검증한 댓글은 말없이 해결한다. 받아들이지 않은 댓글에는 이유를 한 문장 단다. 자동 리뷰어의 스레드는 답이 달리면 해결하고, 자동 리뷰어마다 pull request당 최대 세 차례만 오간다.
- **중복 작업에는 양보한다.** 사람의 브랜치나 pull request에 이미 Ticket의 변경이 들어 있으면 Executor는 그쪽을 가리키는 한 문장과 함께 자기 pull request를 닫는다.

## 버전

- 저장할 때마다 전체 설정, revision 번호, 이전 버전, 시각, 출처(패널 또는 도구)를 담은 불변 버전이 생긴다. 버전이나 기본값을 복원해도 또 다른 버전이 생긴다.
- 저장은 자기 base revision을 밝힌다. 충돌하는 저장은 초안을 버리지 않고 거부된다.
- Session은 같은 턴의 뒤 단계까지 포함해 모델 요청마다 최신 버전을 읽는다. 저장은 Session을 재시작하거나, 취소하거나, 깨우지 않는다. 호스트는 각 Session이 쓴 revision을 기록한다. Executor는 자기가 일한 어느 revision이든 읽을 수 있다.
- 배포는 덮어쓰기를 포함한 전체 크기 한도를 정한다. 검증은 알 수 없는 키, 예약된 내장 스킬 이름, 알 수 없는 덮어쓰기 부분, 빠진 템플릿 placeholder를 거부한다. 글을 몰래 자르지 않는다. 기본값과 같은 덮어쓰기는 지워서 그 부분이 앞으로의 기본값을 따르게 한다.
