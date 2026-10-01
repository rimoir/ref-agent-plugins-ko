# pstack 가이드

pstack은 에이전트를 세세하게 관리하지 않을 때 가장 잘 동작한다. 원하는 것과 완료를 어떻게 알아볼지만 설명한다. `/poteto-mode`가 플레이북을 고르고, 단계에 필요할 때 다른 스킬을 돌리고, 증거를 보여 준다. 이 가이드는 현실적인 프롬프트로 그 습관을 가르친다.

배울 내용은 다음과 같다.

1. [pstack 설정](./01-setup.md). 플러그인을 설치하고 모델을 고른다.
2. [`/poteto-mode`로 작업 보내기](./02-poteto-mode.md). 목표를 주고 플레이북을 고르는 모습을 지켜본다.
3. [코드 이해하기](./03-understand.md). 무엇이든 고치기 전에 `/how`, `/why`, `/teach`, `/recall`.
4. [변경 설계하기](./04-design.md). 코드가 모양을 굳히기 전에 `/architect`, `/arena`, `/swarm`, `/interrogate`.
5. [변경을 만들고 정리하기](./05-build-and-clean.md). 빌드 플레이북, `/tdd`, `/unslop`, `/no-comments`.
6. [검증하고 내보내기](./06-verify-and-ship.md). 실제 앱에서 동작을 증명하고, 초점 잡힌 PR을 열어 머지까지 끌고 간다.
7. [잠든 사이에 작업 돌리기](./07-overnight.md). 밤샘 계약, 감사할 수 있는 결정 로그, 에이전트 하나를 넘어 규모를 키우는 플레이북.
8. [원칙 이름으로 방향 잡기](./08-principles.md). 작업 도중 에이전트의 방향을 바꾸는 23개의 이름.
9. [내 것으로 만들기](./09-make-it-yours.md). 나만의 모드, 그리고 스킬 변경을 테스트하는 법.
10. [레시피와 함정](./10-recipes-and-pitfalls.md). 복사할 프롬프트와 피할 실수.

처음에는 순서대로 읽는다. 그다음부터는 각 페이지가 독립적으로 읽힌다.

## 하나만 기억한다면

에이전트에게 목표와 그것을 확인할 방법을 여러분의 말로 준다.

```text
/poteto-mode the export writes duplicate rows when a retry lands mid-run. repro first, then fix and verify.
```

플레이북 이름을 대거나 스킬을 나열할 필요는 없다. "repro first"(먼저 재현)와 확인 가능한 결과만 있으면 `/poteto-mode`가 라우팅하는 데 충분하다. Bug fix 플레이북에 맞춰 단계를 todo 목록으로 옮기고, 각 단계가 시작될 때 알맞은 스킬을 호출한다.

다음: [pstack 설정](./01-setup.md).
