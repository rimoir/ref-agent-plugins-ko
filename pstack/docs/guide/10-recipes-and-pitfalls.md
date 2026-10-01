# 레시피와 함정

먼저 베껴 쓸 만한 프롬프트, 그다음 누구나 한 번은 저지르는 실수다. 경로와 종료 조건은 자기 것으로 바꿔 넣는다. 레시피는 일부러 격식 없이 썼다. 실제로 그렇게 입력하고, 스킬은 의도를 잘 읽는다.

![그녀가 완성된 요리를 맛보는 동안 로봇들이 레시피 상자를 보며 요리하고, 조리대 위에는 /how, /tdd, /loop라고 적힌 카드가 꽂혀 있다.](./images/recipes.jpg)

## 낯선 하위 시스템 이해하기

```text
use /how first to understand how this initialization works. then use /why to figure out why it broke recently.
```

동작 방식이 먼저, 이력이 나중이다. 각 스킬의 보고서는 어떤 출처를 검색했는지 알려 주므로 답이 무엇에 근거하는지 알 수 있다.

## 설계에 대한 다른 의견 받기

```text
ask /arena for a second opinion on this thread and our approach
```

지금 설계가 여러 후보 중 하나가 되고, 종합 결과가 패널이 더 나은 것을 찾았는지 아니면 지금 것을 확인했는지 알려 준다. 비싼 결정을 내리기 전에 드는 싼 보험이다.

## 독립된 조각을 병렬로 점검하기

```text
/swarm check every package under packages/ against its check.sh. one worker per package. one report.
```

worker마다 패키지 하나를 맡는다. 부모는 모든 조각을 기다렸다가 worker 출력을 날것으로 쏟아 내는 대신 `PASS`, `ISSUES`, `BLOCKED` 보고서 하나를 돌려준다.

## 브랜치를 회의적으로 리뷰하기

```text
/interrogate the whole branch, but skeptically. don't change anything yet. no nitpicks unless it's an actual bug or regression in behavior.
```

수식어가 실제로 일을 한다. "don't change anything yet"은 읽기 전용으로 묶어 두고, 사소한 지적 규칙은 잡음을 미리 걸러 `Act on` 발견이 시간을 들일 가치가 있게 한다.

## 실패하는 테스트로 버그 고치기

```text
/poteto-mode repro the duplicate write first. if there's a cheap test path, /tdd it. then fix and rerun.
```

"if there's a cheap test path"가 중요하다. 깨지기 쉬운 목으로 테스트를 억지로 만들면 실제 명령을 돌리는 것보다 증명하는 것이 적고, 플레이북은 그렇다고 말할 수 있다.

## 자리를 비운 동안 실행을 정직하게 유지하기

```text
im going to bed, keep going autonomously until every fixture passes. do not stop. keep a decision log i can audit in the morning.
```

전체 계약은 [밤샘 페이지](./07-overnight.md)에 있다. 작업과 종료 조건이 이미 대화에 있으면 짧은 형태로도 된다.

## 엇나가는 실행 바로잡기

방향을 잡는 프롬프트는 한 줄이다.

```text
i said the goal is to repro. i did not ask for a fix yet.
```

```text
apply prove it works. show me the real output, not the build log.
```

```text
/unslop that, no emdashes
```

말이 더 필요한 경우는 드물다. 필요한 것은 맞는 이름이고, [원칙 페이지](./08-principles.md)가 그 어휘다.

## 쉬운 말로 답 받기

```text
/bro
```

이게 프롬프트 전부다. [`/bro`](../../skills/bro/SKILL.md)는 마지막 메시지를 사람이 사람에게 말하듯, 전문어 없이, 더 짧게 다시 말한다. 답이 기술적으로는 빈틈없는데 무슨 말인지 여전히 모를 때 쓴다.

## 함정

- **프롬프트에 스킬 나열하기.** "use /how then /architect then /arena"는 플레이북이 이미 정한 순서를 뒤섞는다. 목표와 제약을 말한다. 기본값을 덮어쓸 때만 스킬 이름을 댄다.
- **모호한 종료 조건.** "make it better"는 `/loop`에게 확인할 것을 주지 않는다. 통과하거나 실패할 수 있는 명령이나 산출물을 준다.
- **worktree 하나에 병렬 에이전트 여럿.** 서로 덮어쓰고 diff는 고고학이 된다. "own worktree per attempt"라고 말하면 격리는 공짜다.
- **커버리지를 위해 `/arena` 쓰기.** `/arena`는 설계나 코드 브리프 하나를 반복한 뒤 기반을 고르고 가장 좋은 부분을 접목한다. `/swarm`은 조각이나 명시한 경주 갈래로 나누고 보고서 하나로 모은다.
- **리뷰 코멘트 전부 받아들이기.** 봇도 사람도 진짜 발견과 잡음을 한 목록에 섞어 낸다. `/interrogate`는 발견을 이유와 함께 act-on과 dismissed 바구니로 나누고, 어느 쪽이든 직접 뒤집을 수 있다.
- **`auto`를 모델 slug로 여기기.** `auto`와 `inherit-parent`는 "model 필드를 생략해 subagent가 부모 채팅 모델을 물려받게 한다"는 뜻이다. 역할은 [Setup](./01-setup.md)에서 다룬다.
- **초록색 빌드만 보고 성공 보고하기.** 빌드는 컴파일된다는 것만 증명한다. 실제 명령, 흐름, 저장된 값, 프로파일을 요청하고 답에 증거가 있기를 기대한다.
- **`SKILL.md`를 맨손으로 쓰기.** 검증과 리뷰가 일어나도록 [Authoring or modifying a skill 플레이북](../../skills/poteto-mode/playbooks/authoring-a-skill.md)을 거친다.

가이드는 여기까지다. 건너뛰고 왔다면 [setup](./01-setup.md)으로 돌아가 실제 작업 하나를 돌려 본다. 습관은 읽어서가 아니라 써 봐야 붙는다.

[가이드 색인](./README.md)으로 돌아간다.
