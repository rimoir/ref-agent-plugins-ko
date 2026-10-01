# pstack 설정

이 페이지에서는 플러그인을 설치하고, pstack이 쓸 모델을 고르고, 첫 작업을 돌린다. 설정은 명령 하나와 짧은 대화면 끝난다.

## 플러그인 설치

Cursor 채팅에서 다음을 실행한다.

```text
/add-plugin pstack
```

Cursor가 플러그인 설치를 확인해 준다.

## 모델 고르기

다음을 실행한다.

```text
/setup-pstack
```

[`/setup-pstack`](../../skills/setup-pstack/SKILL.md)은 쓸 수 있는 모델을 감지하고, 추론 예산을 묻고, 각 역할(코드 위임, 판단, 리뷰 패널)을 보여 준 뒤 원하는 바를 묻는다. 질문에 답한다. 그러면 모든 pstack 스킬이 읽는 작은 규칙인 `~/.cursor/rules/pstack-models.mdc`를 쓴다.

신경 쓰는 것만 바꾸면 된다. 규칙에 줄이 없는 역할은 스킬의 기본값을 유지한다. 기본값으로 돌리려면 그 역할의 줄을 지운다. `/setup-pstack`을 다시 돌리면 모델이 기본값과 다른 역할은 그대로 둔다. 0.15.3 이전에 쓴 규칙은 옛 기본 모델을 고정하므로, 그 역할 줄이나 파일 자체를 지운 뒤 `/setup-pstack`을 다시 돌린다.

Auto를 쓰면 어떻게 되는지 궁금할 수 있다. 역할을 `inherit-parent`나 `auto`로 두면 pstack은 subagent의 `model` 필드를 생략하고, subagent는 부모 채팅 모델을 물려받는다. 두 값은 뜻이 같고 둘 다 모델 slug가 아니다. 패널 역할의 값은 목록이며 항목마다 subagent 하나가 돌기 때문에 목록 길이가 패널 크기를 정한다. 설정은 `swarm workers`도 구성한다. 이것은 race가 갈래마다 모델을 지정하지 않는 한 모든 `/swarm` 워커의 기본 모델이다.

## 검증 제안을 받아들이거나 거절하기

설정이 끝날 무렵 `/setup-pstack`은 프로젝트에서 앱 동작을 입증할 방법, 즉 `verify-*` 스킬이나 기존 하네스를 찾는다. 둘 다 없으면 [`/create-verification-skill`](../../skills/create-verification-skill/SKILL.md)로 하나 만들자고 한 번 제안한다.

수락하면 에이전트가 사용자처럼 앱을 조작하도록 가르치는 프로젝트 로컬 스킬 `.cursor/skills/verify-<app>/`을 쓴다. 넘겨주기 전에 스킬이 동작함을 한 번 입증한다. 거절하면 설정은 다음으로 넘어간다. `/create-verification-skill`은 언제든 직접 돌릴 수 있다. 이 스킬이 언제 제 몫을 하는지는 [검증과 배포](./06-verify-and-ship.md#create-a-project-verification-skill)에서 다룬다.

설정이 끝나면 새 채팅을 시작한다. 모델 규칙은 새 세션에 적용된다.

## 첫 작업 돌리기

실제이지만 작은 일을 골라 동료에게 설명하듯 적는다.

```text
/poteto-mode add a --json flag to this command. text output stays byte-identical. verify both.
```

할 일 목록을 지켜본다. 첫 항목들은 일치한 플레이북의 단계를 복사해 넣은 것으로, 이 프롬프트에서는 Feature 플레이북이다. `/poteto-mode`가 어떤 단계를 건너뛰면 그 단계는 `skip: <reason>`과 함께 목록에 남으므로 무엇을 하지 않기로 했는지 볼 수 있다.

여기서부터는 평소처럼 후속 요청을 입력하면 된다. `/poteto-mode`는 계속 유지된다. 그만두겠다고 말할 때까지 대화 내내 켜져 있다.

다음: [`/poteto-mode`로 작업 보내기](./02-poteto-mode.md).
