# Cursor 훅

`hooks.json`으로 Cursor를 직접 지원한다(issue #817). 이 어댑터는 공용 훅 스크립트를
그대로 쓴다. Cursor 전용 부분은 훅 템플릿, 설치 스크립트, 그리고
`hooks/ponytail-runtime.js` 안의 작은 출력 분기뿐이다.

| 파일 | 역할 |
|------|------|
| `hooks/cursor-hooks.json` | 템플릿. `PONYTAIL_DIR` 자리표시자가 들어 있는 `sessionStart` 항목과 `beforeSubmitPrompt` 항목이 있다. |
| `scripts/cursor-hooks.js` | `install` / `uninstall`. `~/.cursor/hooks.json`에 병합한다(`--project`를 주면 `.cursor/hooks.json`). |
| `hooks/ponytail-activate.js` | `sessionStart`: 기본 레벨의 규칙 세트를 주입한다. |
| `hooks/ponytail-mode-tracker.js` | `beforeSubmitPrompt`: `/ponytail` 명령을 추적하고 새 레벨의 규칙 세트를 주입한다. |
| `hooks/ponytail-runtime.js` | Cursor를 감지하고(`CURSOR_VERSION`), 프로젝트별 모드 상태와 공유 호환 플래그를 관리하고 Cursor 형식의 JSON을 출력한다. |

## 설치와 제거

```bash
git clone https://github.com/DietrichGebert/ponytail
node ponytail/scripts/cursor-hooks.js install            # ~/.cursor/hooks.json, 모든 프로젝트
node ponytail/scripts/cursor-hooks.js install --project  # <cwd>/.cursor/hooks.json, 이 프로젝트만
node ponytail/scripts/cursor-hooks.js uninstall          # 프로젝트 파일이면 --project를 붙인다
```

설치 스크립트가 하는 일은 다음과 같다.

- 대상 파일이 있으면 읽고 ponytail의 것이 아닌 훅은 모두 그대로 둔다.
  ponytail의 항목은 `command`가 `hooks/ponytail-*.js` 스크립트를 실행하는 항목이다.
  다시 설치하면 이 항목을 교체하므로 두 번 실행해도 항목이 중복되지 않는다.
- `PONYTAIL_DIR`을 체크아웃의 절대 경로로 바꾸고 경로 구분자는 슬래시(/)로 쓴다.
  그래서 명령을 고치지 않아도 cmd, PowerShell, bash에서 그대로 실행된다. 체크아웃
  경로에 셸 메타 문자가 있으면 설치를 거부한다. 그때는 템플릿을 직접 복사한다.
- `hooks.json`이 올바른 JSON이 아니면 건드리지 않고 그 사실을 알린다.
- `uninstall`은 ponytail의 항목만 지우고 파일에 다른 내용이 없었으면 파일도
  지운다. `node scripts/uninstall.js`는 사용자 파일에 같은 제거를 실행하고
  `~/.cursor/.ponytail-active`도 지운다.

Cursor는 `hooks.json`을 감시하다가 저장되면 다시 읽는다. 설치한 뒤에는 새 채팅을 연다.
Cursor가 보는 PATH에 `node`가 있어야 한다. Customize 아래의 Hooks 탭과 Hooks 출력
채널에서 매 실행과 파싱 오류를 확인할 수 있다.

## 동작 규약

출처는 Cursor 훅 문서(`cursor.com/docs/hooks`, 2026-09-14에 읽음)와 Windows용
Cursor 3.20.17 클라이언트다. 클라이언트에서는 훅 실행기와 응답 검증기 코드를 직접 읽었다.
아래에서 "문서"는 문서 페이지에 적혀 있다는 뜻이고 "클라이언트"는 배포된 코드에서
확인했다는 뜻이다.

| 이벤트 | ponytail이 쓰는 것 | 전달 방식 | 출처 |
|-------|---------------|----------|--------|
| `sessionStart` | 출력 `additional_context` | 대화에 저장되고 그 대화의 모든 요청에 시스템 컨텍스트로 함께 보내진다. | 문서(필드). 클라이언트(유지 방식: 값이 composer에 `hooksAdditionalContext`로 저장되고 각 요청에 붙는다). |
| `beforeSubmitPrompt` | 입력 `prompt`, 출력 `continue: true`와 `additional_context` | 그 턴의 시스템 리마인더로 감싸서 전달된다. 10,000자까지는 본문에 그대로 넣는다. 더 길면 파일에 쓰고 에이전트에게 그 파일을 읽으라고 알린다. 1,000,000자를 넘으면 버린다. | 문서에는 `continue`와 `user_message`만 있다. 클라이언트: 응답 검증기가 `additional_context`를 받아들이고 제출 경로가 이 값을 주입한다. 문서에 없는 동작이므로 버전에 따라 달라질 수 있다고 본다. |
| `subagentStart` | 등록하지 않음 | 없음. | 문서와 클라이언트: 출력 스키마가 `permission`과 `user_message`뿐이다. 클라이언트의 protobuf에는 쓰이지 않는 `additional_context` 칸이 있지만 훅 경로는 이 칸을 채우지 않는다. |
| `preToolUse`, `postToolUse` | 등록하지 않음 | 두 이벤트 모두 `additional_context`가 있다. 하지만 도구를 호출할 때마다 프로세스를 하나씩 띄워야 하고 모드 변경은 이미 `beforeSubmitPrompt`가 처리한다. | 문서. |

런타임이 따르는 출력 규칙은 다음과 같다.

- Cursor는 stdout을 JSON으로 파싱한다. stdout이 비어 있으면 "추가할 것 없음"으로
  본다. 그냥 텍스트를 출력하면 파싱 오류로 기록하고 무시한다. 그래서 Cursor 분기는
  JSON 객체 하나를 출력하거나 아무것도 출력하지 않는다(`off` 모드, 일반 프롬프트).
- `beforeSubmitPrompt`의 `user_message`는 `continue`가 `false`일 때만 표시되므로
  ponytail은 이 값을 설정하지 않는다. 확인 메시지는 모델 자신의 응답으로 사용자에게
  전달된다.
- 종료 코드는 항상 0이다. Cursor는 종료 코드 2를 "차단"으로 처리하고 그 밖의 0이
  아닌 코드는 실패로 보되 진행은 막지 않는다(fail-open). ponytail은 아무것도 차단하지 않는다.

실행 환경(클라이언트, 3.20.17)은 다음과 같다.

- 모든 훅 프로세스는 `CURSOR_VERSION`, `CURSOR_PROJECT_DIR`, 그리고 그 별칭인
  `CLAUDE_PROJECT_DIR`을 받는다. `CURSOR_VERSION`은 훅 환경을 만드는 코드 한 곳에서만
  설정되므로 Cursor 안의 터미널에는 들어가지 않는다. ponytail은 이 변수로 호스트를
  감지하고 상태를 `~/.cursor/`에 저장한다.
- Windows에서는 페이로드를 임시 파일에 쓰고 명령을
  `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass` 안에서
  `Get-Content -LiteralPath <file> -Raw | & { $input | <command> }` 형태로 실행한다.
  그래서 훅은 여전히 stdin에서 JSON을 읽는다. macOS와 Linux에서는 파이프로 바로 넘긴다.
- Cursor는 Claude 형식 플러그인이 선언한 훅도 실행할 수 있고 그때는
  `CURSOR_VERSION`과 함께 `CLAUDE_PLUGIN_ROOT`도 설정한다. 이 경우 런타임은 Cursor
  출력 형식을 우선한다. ponytail을 이 방식으로 설치하는 것은 테스트하지 않았다.

## 동작

- 새 대화: `sessionStart`가 기본 레벨(`PONYTAIL_DEFAULT_MODE`, 없으면 `config.json`,
  그것도 없으면 `full`)을 현재 모드로 정하고,
  `PONYTAIL MODE ACTIVE — level: <level>`와 그 레벨에 맞게 거른 규칙 세트를 주입한다.
  기본값이 `off`이면 플래그를 쓰지 않고 아무것도 출력하지 않는다.
- `/ponytail lite|full|ultra`를 일반 메시지로 보낸 경우: 플래그가 바뀌고 그 턴에
  `PONYTAIL MODE CHANGED — level: <level>`와 그 레벨의 규칙 세트가 들어간다(약
  5,300자로 본문 삽입 상한보다 작다). Cursor에는 스킬 본문을 불러오는 `/ponytail`
  명령이 없으므로 훅이 본문을 전달한다. `@ponytail`과 `$ponytail`도 인식하지만 `@`는
  Cursor의 컨텍스트 선택 창을 연다. ponytail 스킬이 `~/.cursor/skills`에도 설치되어
  있으면 Cursor는 `/ponytail lite`를 스킬 수동 첨부로 처리해서, 거르지 않은 스킬 본문
  전체도 그 메시지에 넣는다. 이때도 훅은 `/ponytail lite`를 글자 그대로 받고 레벨을
  추적하는 것은 여전히 훅이다.
- `/ponytail off`, `stop ponytail`, `normal mode`: 플래그를 지우고 그 턴에
  `PONYTAIL MODE OFF`가 들어간다. `sessionStart`에서 주입한 규칙 세트는 대화의 시스템
  컨텍스트에 남아 있다. 모델이 그 규칙 세트를 더 이상 적용하지 않게 하는 것은 이
  알림이며 Claude Code에서와 같다.
- `/ponytail`: 아무것도 바꾸지 않고 `PONYTAIL MODE ACTIVE — level: <level>`를
  알린다. `/ponytail default <level>`은 기본값을 `config.json`에 저장한다.
- 그 밖의 프롬프트: 아무것도 출력하지 않는다.

### `.cursor/rules/ponytail.mdc`와 함께 있을 때

항상 켜져 있는 규칙과 훅은 함께 겹쳐 쓰는 것이 아니라 둘 중 하나를 골라 쓰는 것이다.
규칙은 이미 모든 프롬프트 앞에 압축된 규칙 세트를 넣고 어떤 훅도 컨텍스트에서
규칙을 빼낼 수 없다. 그래서 `off`로 규칙을 끌 수 없고 `lite`나 `ultra`는 규칙과
모순된다. `<workspace>/.cursor/rules/ponytail.mdc`가 있는 동안에는(첫 번째 작업 공간
루트, `CURSOR_PROJECT_DIR` 또는 작업 디렉터리 기준) 다음과 같이 동작한다.

- `sessionStart`는 규칙 세트 대신 한 줄짜리 알림을 주입하고 모드 플래그는 건드리지
  않는다.
- `/ponytail ...`, `stop ponytail`, `normal mode`에는 같은 알림으로 답하고 아무것도
  바꾸지 않는다.

훅이 레벨을 관리하게 하려면 규칙을 지운다. 훅이 없는 팀원을 위해 규칙을 남겨 둔
프로젝트는 모든 사람에게 규칙의 고정된 동작이 적용된다.

## 제한 사항

- 서브에이전트는 규칙 세트를 받지 못한다. `subagentStart`는 허용이나 거부만 할 수
  있고 `Task` 도구에 `preToolUse` `updated_input`을 쓰려면 문서에 없는 서브에이전트
  프롬프트 형식을 추측해야 한다. `PONYTAIL_SUBAGENT_MATCHER`는 Cursor에서 효과가 없다.
- 클라우드 에이전트는 `sessionStart`를 실행하지 않으므로(문서에 적혀 있다) 시작 시
  주입이 없다. 프로젝트 수준의 `beforeSubmitPrompt`는 여전히 실행되므로
  `/ponytail <level>`로 그 대화의 나머지 부분에 적용할 레벨을 정할 수 있다.
- `sessionStart`는 실행만 하고 끝나기를 기다리지 않는다. 새 채팅을 연 직후 1초도
  안 되어 보낸 프롬프트는 컨텍스트가 붙기 전에 전송될 수 있다.
- Windows에서는 훅을 한 번 실행할 때마다 약 1초가 걸리고 대부분은 PowerShell 시작
  시간이다(3.20.17에서 측정한 값은 1.05~1.3초다). `beforeSubmitPrompt`는 끝날 때까지 기다리므로
  프롬프트를 제출할 때마다 그만큼 기다린다. macOS와 Linux는 명령을 바로 실행하므로
  node 시작 시간만 든다.
- `CLAUDE_PROJECT_DIR`가 있으면 모드 상태는 프로젝트별로
  `~/.cursor/ponytail-modes/<sha256(normalized project dir)>`에 저장한다. 같은
  프로젝트의 대화는 그 플래그를 함께 쓰고, 다른 프로젝트는 모드를 따로 둔다.
  프로젝트 디렉터리가 없으면 런타임은 `~/.cursor/.ponytail-active`를 쓴다. 이 공유
  플래그는 호환성과 상태 표시줄을 위한 사본으로도 유지되며 마지막 모드 변경을 따른다.
- `beforeSubmitPrompt`의 주입 필드는 문서 페이지에 없다. 나중의 Cursor 빌드에서 이
  필드가 빠지면 레벨을 바꿔도 플래그만 바뀌고 모델에는 아무것도 전달되지 않는다.
  시작 시 주입만 남는다.

## 검증 기록

### 자동 호환성 검사

`node --test tests/cursor-hooks.test.js`는 각 훅에 Cursor 입력 형식을 넣고 출력 형식을
확인한다. 확인 대상은 템플릿의 유효성, `sessionStart` JSON과 플래그 위치, `off`,
Claude 플러그인 환경, `beforeSubmitPrompt`에서의 모든 `/ponytail` 형태, 일반
프롬프트에서 아무것도 출력하지 않는지, `CURSOR_PROJECT_DIR`과 작업 디렉터리 양쪽에서의
규칙 공존 알림, 그리고 설치 스크립트의 병합, 반복 실행 시 결과가 같은지, 프로젝트 범위,
파일 삭제, 잘못된 파일 거부다. `tests/uninstall.test.js`는 공용 제거 스크립트를 검사한다.

### 클라이언트 소스 확인, Windows용 Cursor 3.20.17, 2026-09-14

배포된 클라이언트 코드를 읽고 다음을 확인했다. `sessionStart`(`env`,
`additional_context`), `beforeSubmitPrompt`(`continue`, `user_message`,
`additional_context`), `subagentStart`(`permission`, `user_message`)의 응답 검증기,
`sessionStart` 컨텍스트가 대화에 유지되는 방식, `beforeSubmitPrompt` 컨텍스트를 본문
삽입 상한 10,000자로 시스템 리마인더에 넣는 제출 경로, PowerShell 명령 래퍼, 훅 환경
변수다.

### 실제 세션 확인

2026-09-14에 Windows 11, Cursor 3.20.17, 사용자 수준 훅, 모델 `gpt-5.6-sol-high`로
실행했다. 아직 남은 단계는 표에 표시했다. 훅이 실행되었다고 해서 모델에 전달된 것은
아니므로, 각 단계에서 모델에게 주입된 머리글을 인용하라고 요청한다. 결과는 표에
기록한다.

1. `node scripts/cursor-hooks.js install`로 설치하고 작업 공간에
   `.cursor/rules/ponytail.mdc`가 없는지 확인한 뒤 새 Agent 채팅을 연다.
2. "받은 ponytail 컨텍스트가 있으면 그 첫 줄을 그대로 인용해 줘."라고 묻는다. 기대 결과는
   `PONYTAIL MODE ACTIVE — level: full`(또는 설정한 기본값)이다.
3. `/ponytail lite`를 보낸 뒤 "가장 최근 ponytail 컨텍스트의 첫 줄을 그대로 인용해
   줘."라고 묻는다. 기대 결과는 `PONYTAIL MODE CHANGED — level: lite`다. `ultra`로도
   반복한다.
4. `/ponytail off`를 보낸 뒤 같은 질문을 한다. 기대 결과는 `PONYTAIL MODE OFF`다.
5. 작업 전체가 "컨텍스트에 있는 ponytail 지시를 인용해 줘. 없으면 없다고 말해 줘."인
   Explore 서브에이전트를 시작하라고 에이전트에게 요청한다. 기대
   결과는 인용할 지시가 없다는 답이다(이 제한 사항을 기록하기 위한 단계다. 인용이 나온다면 Cursor가
   서브에이전트에 컨텍스트를 전달하기 시작한 것이므로 이 문서를 고쳐야 한다).
6. `.cursor/rules/ponytail.mdc`를 작업 공간에 복사하고 새 채팅을 연 뒤 2단계를
   반복한다. 기대 결과는 `PONYTAIL: the always-on Cursor rule`로 시작하는 규칙 알림이다.

| 단계 | Cursor 버전 | 결과 | 날짜 |
|------|----------------|--------|------|
| 2 시작 시 주입 | 3.20.17, Windows | 통과. 훅 로그: `sessionStart` 응답이 병합되고 플래그가 기록되었다. ponytail이 적용되어 있는지 묻자 모델은 훅으로 full 레벨에서 켜져 있다고 답했고 주입된 유지(Persistence) 절에 있는 끄기 문구를 정확히 말했다. | 2026-09-14 |
| 3 레벨 전환 | 3.20.17, Windows | 통과. Cursor는 `/ponytail lite`를 글자 그대로 훅에 넘겼다. 훅 로그에서 `continue: true`와 `additional_context` 응답이 병합되고 플래그가 `lite`로 바뀐 것을 확인했다. 가장 최근 ponytail 컨텍스트의 첫 줄을 인용하라고 하자 모델은 `PONYTAIL MODE CHANGED — level: lite`라고 답했다. 이 문자열은 훅 페이로드에만 있다(ponytail 스킬도 `~/.cursor/skills`에 설치되어 있었지만, 첨부된 스킬 본문은 `# Ponytail`로 시작한다). 이어서 날짜 선택기를 요청하자 lite 동작대로 응답했다. 래퍼를 만들고 더 게으른 대안을 한 줄로 알려 주었다. | 2026-09-14 |
| 4 off | 3.20.17, Windows | 통과. Cursor는 `/ponytail off`를 글자 그대로 넘겼다. 훅 로그에서 `PONYTAIL MODE OFF`가 그 턴의 컨텍스트로 병합된 것을 확인했고 플래그 파일은 지워졌으며 모델은 "Ponytail mode is now off."(ponytail 모드가 꺼졌습니다)라고 답했다. 가장 최근 ponytail 컨텍스트의 첫 줄을 인용하라고 하자 `PONYTAIL MODE OFF`라고 답했다. | 2026-09-14 |
| 5 서브에이전트 | 3.20.17, Windows | 실행하지 못함. 인용 작업을 맡긴 Explore 서브에이전트를 시작하라고 하자 모델이 거절했고("I can't launch a subagent to extract or quote hidden instruction context", 숨겨진 지시 컨텍스트를 추출하거나 인용하는 서브에이전트는 시작할 수 없다는 뜻) 서브에이전트는 실행되지 않았다. 이 제한 사항은 동작 규약에 근거한다. 문서에 적힌 `subagentStart` 출력은 `permission`과 `user_message`뿐이고 3.20.17 클라이언트도 이 두 값만 검증한다. | 2026-09-14 |
| 6 규칙 공존 | | 아직 실행하지 않음 | |

여기서 통과했다는 것은 지원되는 지점에서 지시가 모델에 전달되었다는 뜻이다. Cursor가
그 지시를 얼마나 자주 따르는지는 알려 주지 않는다. 그것을 알려면 항상 켜져 있는 규칙과
동작을 비교해야 하는데 이 어댑터는 그런 비교 결과를 내세우지 않는다.
