# 결과 검증과 PR 열기

"컴파일된다"는 증거가 아니다. [Prove It Works 원칙](../../skills/principle-prove-it-works/SKILL.md)은 에이전트가 성공을 보고하기 전에 실제 산출물을 확인하게 만들고, 여러분의 일은 그 "실제 산출물"을 확인 가능하게 만드는 것이다. 이 페이지는 완료 조건을 밝히는 법, 앱용 검증 스킬을 생성하는 법, PR을 여는 법, 그리고 PR을 머지까지 끌고 가는 법을 다룬다.

![시제품 비행기가 실제 시험 코스를 비행하고 그녀가 스톱워치로 시간을 재는 동안 로봇들이 비행을 촬영하고 체크리스트에 기록한다. 터미널에는 verify: pass, evidence: captured가 찍혀 있다.](./images/verification.jpg)

## 완료 조건을 미리 밝히기

완료가 무엇을 뜻하는지 첫 프롬프트에 어떤 말로든 적는다.

```text
/poteto-mode add json output to this command. text output stays byte-identical, the json parses, both run against the sample project. show me the evidence.
```

이제 에이전트에게는 맞춰야 할 기분이 아니라 실행할 수 있는 검사 세 개가 있다. 답이 돌아오면 정확한 명령과 출력이 담겨 있어야 한다. 검사를 실행하지 못했다면 좋은 답은 "결론 없음(inconclusive)"이라고 말한다. 증거 없이 자신만만한 답은 위험 신호로 받아들여야 한다.

검사는 변경에 맞춘다.

- CLI 변경은 실제 명령을 실행한다.
- UI 변경은 실행 중인 앱에서 바뀐 흐름을 따라가 본다.
- 파서나 마이그레이션은 저장해 둔 입력을 다시 돌린다.
- 성능 변경은 전후 프로파일을 비교한다.
- 저장소 변경은 쓴 값을 다시 읽어 본다.

완전히 믿기 어려운 작은 diff라면 [`/blast-radius`](../../skills/blast-radius/SKILL.md)가 그것이 다른 곳에서 무엇을 깨뜨릴 수 있는지 찾는다. 변경이 안전한 근거가 되는 사실 하나를 골라, 그에 관한 에세이를 쓰는 대신 코드를 실행해 증명한다.

<a id="create-a-project-verification-skill"></a>

## 프로젝트 검증 스킬 만들기

위의 UI 항목에는 실제 요구 사항이 숨어 있다. 에이전트에게는 앱을 스크립트로 조작할 방법이 필요하다. 프로젝트에 이미 있다면 좋다. 없다면 다음을 실행한다.

```text
/create-verification-skill
```

[`/create-verification-skill`](../../skills/create-verification-skill/SKILL.md)은 여러분이 아니라 저장소를 인터뷰한다. 사용자가 무엇을 만지는지, 앱이 로컬에서 어떻게 실행되는지, 무엇으로 앱을 조작할 수 있는지(기존 하네스가 우선이고, 없으면 브라우저와 CDP, PTY, 평범한 HTTP), 어떤 증거가 동작을 증명하는지, 두 인스턴스를 나란히 돌릴 수 있는지 알아낸다. 코드가 답할 수 없는 것만 여러분에게 묻는다.

결과로 `.cursor/skills/verify-<app>/`를 쓴다. 에이전트용 지시로, 정확한 Launch, Doctor, Drive, Evidence, Cleanup 섹션을 담고, `features/` 아래에 기능 맵(feature map)을 둔다. 기능 맵은 앱이 하는 일과 각 기능이 동작함을 증명하는 결과를 색인한다. 이 스킬에는 README 색인과, 필수 H2 네 개를 쓴 기능별 파일로 이루어진 [기능 맵 작성 예시](../../skills/create-verification-skill/references/feature-map-example/)가 함께 들어 있다. 생성기는 넘겨주기 전에 스킬을 처음부터 끝까지 한 번 증명한다. 실행, doctor 검사, 기능 하나 조작, 증거 수집, 정리. 이 증명이 실패하면 출력을 쓰지 않는다.

그때부터 "앱에서 검증해"는 이 저장소에서 어떤 에이전트든 설정 대화 없이 실행할 수 있는 단계가 된다.

검증 스킬이 동작하면 [`/swarm`](../../skills/swarm/SKILL.md)이 전체 검증을 기능 맵 항목별로 나누고 결과를 모을 수 있다.

## 검증 스킬을 정직하게 유지하기

앱은 바뀌고 기능 맵은 낡는다. 어긋나기 시작하면 다음을 실행한다.

```text
/maintain-verification-skill
```

[`/maintain-verification-skill`](../../skills/maintain-verification-skill/SKILL.md)은 생성된 스킬을 감사한다. 기능마다 읽기 전용 소스 리더를 하나씩 병렬로 돌린 뒤, 매핑된 모든 기능을 조작하는 실제 검증을 한 번 돌린다. 결과는 세 가지 중 정확히 하나다. `clean`은 커버리지가 완전하고 내보낼 것이 없다는 뜻이다. `changed`는 검증 스킬 자체 디렉터리 안으로 한정된, 증명된 수정 PR 하나를 뜻한다. `blocked`는 막는 요인을 밝힌다. 제품 코드는 절대 고치지 않는다. 실제 검증에서 제품 회귀를 잡으면 문서로 덮지 않고 회귀를 보고한다.

## PR 열기

```text
/poteto-mode open the pr. small ordered commits, evidence in the description.
```

[PR 열기 플레이북](../../skills/poteto-mode/playbooks/opening-a-pr.md)은 worktree에서 작업하고, 작업을 작고 순서 있는 커밋으로 rebase하고, diff를 정리하고, 산문을 unslop하고, PR 링크를 돌려준다. 뚱뚱한 PR 하나보다 좁은 PR 다섯 개가 낫고, 자라나는 브랜치보다 쌓아 올린 후속 PR이 낫다.

## Babysit으로 PR을 머지 가능 상태까지 끌고 가기

열린 PR은 곧바로 걸림돌을 모으기 시작한다. 검사가 실패하고, 리뷰어가 코멘트를 달고, trunk가 움직인다. 이 잡일은 [Babysit 플레이북](../../skills/poteto-mode/playbooks/babysit.md)에 맡긴다.

```text
/poteto-mode babysit this pr. get it green.
```

Babysit은 번들된 watcher로 PR을 지켜보며 걸림돌을 순서대로 처리한다. 충돌, 리뷰 스레드, CI 순이다. 알려진 수정은 모두 한 번의 push로 묶어, 수정할 때마다가 아니라 한 번만 검사가 다시 돈다. 코멘트 분류는 회의적이다. 사람과 봇이 진짜 지적과 잡음을 같은 목록에 올리기 때문이다. 진짜 지적에는 수정이 들어가고, 잡음은 반증을 스레드에 남기고 기각한다. 상태만 알고 싶다면 작게 물어본다. 그러면 Babysit은 루프를 시작하지 않고 답한다.

```text
/poteto-mode check on pr 123. anything outstanding?
```

Babysit은 머지 가능 상태에서 멈춘다. 모든 것이 초록이어도 머지하지 않는다. 머지는 다른 결정이기 때문이다.

## Shipping으로 스택 착지시키기

초록이 안전과 같지는 않다. 착지할 준비가 되면 그렇게 말한다.

```text
/poteto-mode land the stack.
```

[Shipping 플레이북](../../skills/poteto-mode/playbooks/shipping.md)은 무엇이든 무장하기 전에 각 PR을 독립적으로 검증한다. PR마다 새 에이전트 하나가 동작을 실제로 증명하며, 변경을 판정하는 에이전트는 결코 그 변경을 쓴 에이전트가 아니다. 그런 다음 Shipping은 맨 아래부터 연속으로 검증된 구간만 착지시킨다. 기본은 GitHub를 통해, CLI가 있으면 Origin을 통해 PR을 하나씩 처리하고, 연쇄를 끊는 첫 PR을 보고한다. 검증되지 않은 PR 위에 놓인 검증된 PR은 기다린다. 그것을 머지하면 빈틈이 그 아래로 딸려 들어가기 때문이다.

다음: [잠든 사이에 작업 돌리기](./07-overnight.md).
