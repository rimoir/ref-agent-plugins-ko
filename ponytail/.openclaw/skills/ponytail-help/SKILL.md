---
name: ponytail-help
description: "ponytail의 모드, 스킬, 명령을 한눈에 보는 참고 카드다. 한 번만 표시한다."
homepage: https://github.com/DietrichGebert/ponytail
license: MIT
---

# Ponytail 도움말

호출되면 이 참조 카드를 보여 준다.
한 번만 표시하고, 모드를 바꾸거나 플래그 파일을 쓰거나 아무것도 저장하지 않는다.

## 레벨

| 레벨 | 트리거 | 무엇이 바뀌나 |
|-------|---------|-------------|
| **Lite** | `/ponytail lite` | 요청한 것을 만들고, 더 작은 선택지를 한 줄로 알려 준다. |
| **Full** | `/ponytail` | 가장 작은 완전한 변경을 하고, 로직에 필요한 곳에는 검사를 남기고, 건너뛴 것과 위험을 밝히는 답을 한다. 기본값이다. |
| **Ultra** | `/ponytail ultra` | 요청 자체도 따지고, 만들기 전에 필요 없는 부분은 하지 말자고 말한다. |

레벨은 바꾸거나 세션이 끝날 때까지 그대로 유지된다.

## 스킬

| 스킬 | 트리거 | 하는 일 |
|-------|---------|--------------|
| **ponytail** | `/ponytail` | 게으른 모드 자체다. 새 코드를 가장 적게 쓰고, 건너뛴 작업과 위험을 밝히는 분명한 답을 한다. |
| **ponytail-review** | `/ponytail-review` | diff의 품질 리뷰. 버그, 보안, 부하, 빠진 테스트, 속도, 잘라낼 것을 본다. 항목마다 무엇이 잘못되는지와 고치는 방법을 적는다. |
| **ponytail-audit** | `/ponytail-audit` | 같은 품질 리뷰를 저장소 전체에 하고 순위를 매긴다. |
| **ponytail-debt** | `/ponytail-debt` | 의도적 단순화를 표시한 `shortcut:` 주석을 모아 추적할 수 있는 부채 목록으로 만든다. |
| **ponytail-gain** | `/ponytail-gain` | 측정한 효과를 보여 주는 점수표: 코드 감소, 비용 감소, 속도 향상. |
| **ponytail-help** | `/ponytail-help` | 이 카드를 보여 준다. |

Codex CLI와 IDE 확장에서는 `$ponytail:ponytail`, `$ponytail:ponytail-review`, `$ponytail:ponytail-help`로 스킬을 호출한다.
Claude Code와 OpenCode는 위의 슬래시 명령 형식을 쓴다(OpenCode는 위의 스킬을 모두 슬래시 명령으로 제공한다).

## 끄기

"stop ponytail" 또는 "normal mode"라고 입력한다.
언제든 `/ponytail`로 다시 켤 수 있다.
`/ponytail off`로도 끌 수 있다.

## 밴드 (Claude Code)

`/ponytail band`는 프롬프트 위의 밴드를 숨기고, 같은 명령으로 다시 보여 준다.
`/ponytail band on`과 `/ponytail band off`는 상태를 바로 정한다. 레벨은 그대로다.
`/ponytail band import`는 지난 Claude Code 세션(비용, 에이전트 시간, 토큰)을 보드에 추가한다.

## 기본 모드 설정

기본 모드는 `full`이고, 모든 세션에서 자동으로 켜진다.
바꾸는 방법은 다음과 같다.

**환경 변수** (가장 높은 우선순위):
```bash
export PONYTAIL_DEFAULT_MODE=ultra
```

**설정 파일** (`~/.config/ponytail/config.json`, Windows: `%APPDATA%\ponytail\config.json`):
```json
{ "defaultMode": "lite" }
```

`"off"`로 설정하면 세션을 시작할 때 자동으로 켜지지 않는다.
필요할 때 `/ponytail`로 직접 켠다.

적용 우선순위: 환경 변수 > 설정 파일 > `full`.

## 업데이트

자동 업데이트를 한 번 켜 둔다. `/plugin`을 열고 Marketplaces로 이동해 ponytail을 고른 뒤 Enable auto-update를 선택한다.
그러면 Claude Code가 시작할 때 새 버전을 받아 온다(안내가 나오면 `/reload-plugins`를 실행한다).
직접 새로 고치려면 `/plugin marketplace update ponytail`을 실행한 다음 `/reload-plugins`를 실행한다.

`/plugin`을 인식하지 못하면 Claude Code가 오래된 버전이다.
Claude Code를 업데이트하고(`npm install -g @anthropic-ai/claude-code@latest` 또는 `brew upgrade claude-code`) 다시 시작한다.
다른 호스트는 각자의 업데이트 방식을 따른다.

## 더 보기

전체 문서와 예시: https://github.com/DietrichGebert/ponytail
