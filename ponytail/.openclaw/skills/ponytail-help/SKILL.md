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
| **Lite** | `/ponytail lite` | 요청한 것을 만들고, 더 게으른 대안을 한 줄로 알려 준다. |
| **Full** | `/ponytail` | 선택 순서(the ladder, 위에서부터 차례로 확인하는 해결책 목록)를 강제한다: YAGNI(지금 필요하지 않은 기능은 만들지 않는다) → 표준 라이브러리 → 플랫폼 기본 기능 → 한 줄 → 최소 코드. 기본값이다. |
| **Ultra** | `/ponytail ultra` | YAGNI를 극단까지 적용한다. 추가보다 삭제를 먼저 한다. 만들기 전에 요구 사항이 정말 필요한지 따진다. |

레벨은 바꾸거나 세션이 끝날 때까지 그대로 유지된다.

## 스킬

| 스킬 | 트리거 | 하는 일 |
|-------|---------|--------------|
| **ponytail** | `/ponytail` | 게으른 모드 자체다. 동작하는 가장 단순한 해결책을 고른다. |
| **ponytail-review** | `/ponytail-review` | 과잉 설계 리뷰: `L42: yagni: factory, one product. Inline.` |
| **ponytail-audit** | `/ponytail-audit` | 저장소 전체 과잉 설계 감사: 삭제할 항목을 우선순위대로 나열한다. |
| **ponytail-debt** | `/ponytail-debt` | 의도적 단순화를 표시한 `ponytail:` 주석을 모아 추적할 수 있는 부채 목록으로 만든다. |
| **ponytail-gain** | `/ponytail-gain` | 측정한 효과를 보여 주는 점수표: 코드 감소, 비용 감소, 속도 향상. |
| **ponytail-help** | `/ponytail-help` | 이 카드를 보여 준다. |

Codex CLI와 IDE 확장에서는 `$ponytail:ponytail`, `$ponytail:ponytail-review`, `$ponytail:ponytail-help`로 스킬을 호출한다.
Claude Code와 OpenCode는 위의 슬래시 명령 형식을 쓴다(OpenCode는 위의 스킬을 모두 슬래시 명령으로 제공한다).

## 끄기

"stop ponytail" 또는 "normal mode"라고 입력한다.
언제든 `/ponytail`로 다시 켤 수 있다.
`/ponytail off`로도 끌 수 있다.

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
