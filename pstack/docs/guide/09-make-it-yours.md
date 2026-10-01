# 내 것으로 만들기

poteto-mode는 한 사람의 스타일이다. 그 밑의 장치, 즉 플레이북, 라우팅, 모델 역할은 당신의 스타일을 입혀도 똑같이 잘 동작한다. 이 페이지는 개인 모드 만들기, 세션에서 교훈 잡아 두기, 초점이 분명한 스킬 쓰기, 스킬 변경을 믿기 전에 테스트하기를 다룬다.

## `/automate-me`로 내 모드 만들기

```text
/automate-me
```

스타일을 설명할 필요가 없다. [`/automate-me`](../../skills/automate-me/SKILL.md)가 이력에서 읽어 낸다. 활성 워크스페이스의 최근 대화록에서 반복되는 선호를 캐낸다. 답을 어떻게 받기 좋아하는지, 위임, 검증, 코드, 글, 절차를 어떻게 하는지다. 그런 다음 어떤 패턴이 정말 당신다운지 묻는다. Cursor에 내장된 `create-skill` 흐름으로 `.cursor/skills/<your-name>-mode/SKILL.md` 초안을 쓰고, 초안을 [`/unslop`](../../skills/unslop/SKILL.md)에 통과시키고, worktree에서 PR을 열어 다른 변경처럼 리뷰하게 한다.

습관이 바뀔 때마다 다시 돌린다.

```text
/automate-me update my mode skill with everything since its last edit
```

업데이트 모드는 스킬이 마지막으로 바뀐 뒤의 이력만 캐낸다. 반박하지 않은 규칙은 남기고, 새 증거가 있는 규칙은 고치고, 정말 새로운 패턴에만 섹션을 추가한다.

## `/reflect`로 세션의 교훈 잡아 두기

무언가를 배운 작업 직후에 돌린다.

```text
/reflect that took way too long. capture what we learned so the next run doesn't repeat it.
```

[`/reflect`](../../skills/reflect/SKILL.md)는 대화록을 병렬 리뷰어 셋에게 보내고, 종합자가 제안을 `Accepted`, `Rejected`, `Backlog`로 나눈 뒤 스킬을 바꾸기 전에 승인을 기다린다. 앞으로의 결정을 바꿀 제안만 승인한다. 이상했던 세션 하나는 일화이지 규칙이 아니다.

## 초점이 분명한 스킬 쓰기

잡아 두고 싶은 워크플로를 이미 알고 있을 때 쓴다.

```text
/poteto-mode write a skill for verifying database migrations in this repo
```

스킬 쓰기는 [Authoring or modifying a skill 플레이북](../../skills/poteto-mode/playbooks/authoring-a-skill.md)에 해당한다. 이 플레이북은 Cursor 내장 `create-skill`을 거치고, frontmatter와 링크를 검증하고, Opening a PR 플레이북으로 결과를 내보낸다. 에이전트가 읽는 글은 사람이 읽는 글보다 기준이 높다. 쓸모없는 문장 하나가 미래의 어떤 에이전트가 따르는 지시가 되기 때문이다. `SKILL.md`를 맨손으로 쓰지 말고 플레이북이 그 기준을 지키게 둔다.

특별한 경우 하나에는 전용 생성기가 있다. 앱을 조작해 동작을 증명해야 하는 스킬은 검증 스킬이므로 대신 [`/create-verification-skill`](../../skills/create-verification-skill/SKILL.md)과 [`/maintain-verification-skill`](../../skills/maintain-verification-skill/SKILL.md)을 쓴다. 둘 다 [검증과 출시](./06-verify-and-ship.md#create-a-project-verification-skill)에서 다룬다.

## `/technical-writing`으로 기준에 맞춰 문서 쓰기

내보내는 글이 스킬만은 아니다. 문서, RFC, readme, PR 설명, 커밋 메시지에는 다음을 쓴다.

```text
/technical-writing review the readme changes
```

[`/technical-writing`](../../skills/technical-writing/SKILL.md)은 목표 하나를 가진 계층형 기준을 적용한다. 지친 엔지니어가 한 번 읽고 이해하는 글이다. 먼저 문서의 모드(튜토리얼, 하우투, 레퍼런스, 설명)를 고르고, 그다음 문장 단위로 다룬다. 누가 무엇을 하는지, 한 문장에 한 생각, 두 가지로 읽히는 것은 없게 한다. 당신이나 에이전트가 방금 쓴 것을 리뷰할 때 쓰거나, 문서를 요청할 때 처음부터 이름을 댄다.

## 스킬 변경을 블라인드로 테스트하기

스킬 수정은 앞으로의 모든 세션에 영향을 주므로 실험답게 테스트한다.

```text
/poteto-mode run the eval playbook on this skill change. same task for both variants, candidates stay blind.
```

[Eval 플레이북](../../skills/poteto-mode/playbooks/eval.md)은 실패 양상 하나, 관찰자 효과를 중심으로 짜여 있다. 평가받는다는 것을 아는 에이전트는 다르게 행동한다. 그래서 후보 에이전트는 정리된 디렉터리에서 자연스러워 보이는 작업을 받고, "eval"이나 "candidate"라는 단어를 보지 못하고, 서로의 존재도 모른다. 판정자 하나가 모든 출력을 중립 라벨 아래에서 채점하고, 지시 사슬을 따랐는지는 후보가 주장하는 것이 아니라 실제로 읽은 파일로 채점한다.

판정을 받아들이기 전에 모든 출력을 직접 읽는다. 판정자와 의견이 다르면 자기 판단보다 채점 기준을 먼저 의심한다.

**함정:** 스킬이 오작동한다고 작업 도중에 고치지 않는다. 별도 PR에서 고치고 작업은 계속 진행한다. 기능 작업에 엉켜 나간 스킬 수정은 리뷰에서 보이지 않고 평가할 수도 없다.

다음: [레시피와 함정](./10-recipes-and-pitfalls.md).
