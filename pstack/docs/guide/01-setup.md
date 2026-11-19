# pstack 설정

이 페이지에서는 플러그인을 설치하고, pstack이 쓸 모델을 고르고, 첫 작업을 돌린다. 설정은 명령 하나와 짧은 대화면 끝난다.

## 플러그인 설치

Cursor 채팅에서 다음을 실행한다.

```text
/add-plugin pstack
```

Cursor가 플러그인 설치를 확인해 준다.

Claude Code에서는 `/plugin marketplace add cursor/plugins`를 돌린 뒤 `/plugin install pstack@cursor-plugins`를 돌린다. Claude Code는 플러그인 명령에 접두어를 붙이므로, 이 가이드의 명령마다 거기서는 `pstack:` 접두어가 붙는다. 예를 들어 `/pstack:setup-pstack`이고, 이 명령은 모델 규칙을 `~/.claude/rules/pstack-models.md`에 쓴다. 나머지 차이는 [Claude Code 어댑터](../harness/claude-code.md)에서 다룬다.

## 모델 고르기

다음을 실행한다.

```text
/setup-pstack
```

[`/setup-pstack`](../../skills/setup-pstack/SKILL.md)은 쓸 수 있는 모델을 감지하고, 추론 예산을 묻고, 각 역할(코드 위임, 판단, 리뷰 패널)을 보여 준 뒤 원하는 바를 묻는다. 질문에 답한다. 그러면 모든 pstack 스킬이 읽는 작은 규칙인 `~/.cursor/rules/pstack-models.mdc`를 쓴다.

기본값은 `large` 예산과 같다. 코드, 산문, 판단은 `xhigh` 추론의 Opus 5.5로 돌고, 리뷰 패널과 swarm 워커는 `high`로 돈다. `xhigh`보다 높게 도는 역할은 없다. 리뷰 패널 밖에서 Fable 5.2는 사용자가 작업에 이름을 지정했을 때나 같은 브리프로 Opus 5.5를 두 번 돌려 검사에 실패했을 때만 돈다. `medium`은 각 역할을 한 단계, `small`은 두 단계 낮추고, 둘 다 토큰을 덜 쓴다.

신경 쓰는 것만 바꾸면 된다. 규칙에 줄이 없는 역할은 스킬의 기본값을 유지한다. 기본값으로 돌리려면 그 역할의 줄을 지운다. `/setup-pstack`을 다시 돌리면 모델이 기본값과 다른 역할은 그대로 둔다. 기본값이 바뀌면 그 전에 쓴 규칙은 `/setup-pstack`을 다시 돌릴 때까지 여전히 옛 기본값을 고정한다. 그 실행은 알아보는 옛 기본값을 바꾸고 어느 것인지 알려 주며, 나머지 선택은 유지한다. 알아보지 못하는 고정을 없애려면 먼저 그 역할 줄이나 파일 자체를 지운다.

Auto를 쓰면 어떻게 되는지 궁금할 수 있다. 역할을 `inherit-parent`나 `auto`로 두면 pstack은 subagent의 `model` 필드를 생략하고, subagent는 부모 채팅 모델을 물려받는다. 두 값은 뜻이 같고 둘 다 모델 slug가 아니다. 패널 역할의 값은 목록이며 항목마다 subagent 하나가 돌기 때문에 목록 길이가 패널 크기를 정한다. 설정은 `swarm workers`도 구성한다. 이것은 race가 갈래마다 모델을 지정하지 않는 한 모든 `/swarm` 워커의 기본 모델이다.

## 검증 제안들을 받아들이거나 거절하기

설정이 끝날 무렵 `/setup-pstack`은 프로젝트에서 앱 동작을 입증할 방법, 즉 `verify-*` 스킬이나 기존 하네스를 찾는다. 둘 다 없으면 [`/create-verification-skill`](../../skills/create-verification-skill/SKILL.md)로 하나 만들자고 한 번 제안한다.

수락하면 에이전트가 사용자처럼 앱을 조작하도록 가르치는 프로젝트 로컬 스킬 `.cursor/skills/verify-<app>/`을 쓴다. 넘겨주기 전에 스킬이 동작함을 한 번 입증한다. 거절하면 설정은 다음으로 넘어간다. `/create-verification-skill`은 언제든 직접 돌릴 수 있다. 자세한 내용은 [검증과 배포](./06-verify-and-ship.md#create-a-project-verification-skill)에서 다룬다.

pstack이 처음이라면 수락하라. 자기 작업을 확인할 수 있는 에이전트는 확인이 통과할 때까지 계속 일한다. 그렇지 못한 에이전트는 모든 결과를 손으로 확인하라고 넘긴다. 이 가이드에 나오는 것 가운데 검증 스킬이 가장 큰 값을 한다.

이어서 설정은 [`/create-formal-verification-skill`](../../skills/create-formal-verification-skill/SKILL.md)로 형식 검증 스킬을 만들자고 한 번 제안한다. 프로젝트에 이미 있으면 제안하지 않는다. 테스트는 누군가 써야겠다고 생각한 경우만 확인한다. 형식 검증 스킬은 "작업 하나가 동시에 두 번 돌지 않는다" 같은 코드의 핵심 속성 하나를 밝혀 둔 범위 안의 모든 경우에서 확인한다. 코드에 동시성, 재시도, 상태 기계, 파서가 있어 버그의 대가가 크고 그것을 깨뜨리는 경우에 테스트가 좀처럼 닿지 못한다면 수락한다. 아니면 거절하고, 사정이 바뀌면 나중에 돌린다. [검증과 배포](./06-verify-and-ship.md#prove-a-property-with-a-formal-verification-skill)에서 다룬다.

설정이 끝나면 새 채팅을 시작한다. 모델 규칙은 새 세션에 적용된다.

## 비용 관리하기

pstack은 subagent와 리뷰 패널에 토큰을 더 쓴다. 엄밀함의 값이다. 덜 쓰려면 이렇게 한다.

- `/setup-pstack`을 다시 돌려 더 작은 추론 예산이나 더 싼 모델을 고른다. 메인 채팅에는 강한 모델을, 코드 역할에는 더 싸고 빠른 모델을 두는 조합이 좋다.
- 역할을 `auto`나 `inherit-parent`로 두어 채팅 자체의 모델로 돌게 한다.
- 패널 목록을 줄인다. 항목 하나가 subagent 하나를 돌린다.
- `/poteto-mode`는 엄밀함이 필요한 일에 아껴 둔다. 작고 뻔한 수정에는 필요 없다.

<a id="run-your-first-task"></a>

## 첫 작업 돌리기

실제이지만 작은 일을 골라 동료에게 설명하듯 적는다.

```text
/poteto-mode 이 명령에 --json 플래그를 추가해 줘. 텍스트 출력은 바이트 단위로 그대로 둬야 해. 둘 다 검증해.
```

할 일 목록을 지켜본다. 첫 항목들은 일치한 플레이북의 단계를 복사해 넣은 것으로, 이 프롬프트에서는 Feature 플레이북이다.

여기서부터는 평소처럼 후속 요청을 입력하면 된다. 채팅 내내 `/poteto-mode`를 켜 두려면 `/` 메뉴에서 고를 때 Enter 대신 Option+Enter(Mac)나 Alt+Enter(Windows)를 누른다. 그러면 [Custom Mode](https://cursor.com/docs/skills#using-a-skill-as-a-custom-mode)가 되어 나갈 때까지 매 턴 컨텍스트에 남는다. Custom Mode는 Agents Window와 CLI에서 쓸 수 있다. 그냥 Enter를 누르면 스킬이 메시지 하나에만 붙고, 채팅이 길어질수록 흐려진다.

다음: [`/poteto-mode`로 작업 보내기](./02-poteto-mode.md).
