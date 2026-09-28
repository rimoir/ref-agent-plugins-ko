# 엔지니어링

코드 작업에 매일 쓰는 스킬이다.

## 사용자 호출(User-invoked)

사람이 이름을 입력해야만 실행된다(Claude Code: `disable-model-invocation: true`, Codex: `agents/openai.yaml`의 `policy.allow_implicit_invocation: false`).

- **[ask-matt](./ask-matt/SKILL.md)**: 지금 상황에 맞는 스킬이나 흐름을 묻는다. 이 저장소의 사용자 호출 스킬을 대상으로 각 스킬을 언제 쓰는지 알려 주는 안내 스킬(router)이다.
- **[grill-with-docs](./grill-with-docs/SKILL.md)**: 집요한 질문 세션을 진행하면서 프로젝트의 도메인 모델도 만든다. 용어를 다듬고 `CONTEXT.md`와 ADR(아키텍처 결정 기록)을 그 자리에서 갱신한다.
- **[triage](./triage/SKILL.md)**: 분류(triage) 역할로 이루어진 상태 기계에 따라 이슈를 옮긴다.
- **[improve-codebase-architecture](./improve-codebase-architecture/SKILL.md)**: 코드베이스에서 모듈을 깊게 만들 기회를 찾아 시각적인 HTML 보고서로 보여 주고, 사용자가 고른 후보를 집요하게 질문하며 다듬는다.
- **[setup-matt-pocock-skills](./setup-matt-pocock-skills/SKILL.md)**: 엔지니어링 스킬을 쓸 수 있게 이 저장소를 설정한다(이슈 트래커, 분류 라벨, 도메인 문서 구조). 저장소마다 한 번 실행한다.
- **[to-spec](./to-spec/SKILL.md)**: 현재 대화를 스펙으로 만들어 이슈 트래커에 게시한다.
- **[to-tickets](./to-tickets/SKILL.md)**: 계획, 스펙, 대화를 종단 간 최소 구현(tracer bullet, 모든 계층을 끝까지 얇게 관통해 바로 확인할 수 있는 작은 구현) 티켓 묶음으로 나눈다. 각 티켓에는 차단 관계를 적는데, 로컬 파일의 텍스트로 적거나 실제 이슈 트래커의 차단 링크로 건다.
- **[implement](./implement/SKILL.md)**: 스펙이나 티켓 묶음에 적힌 작업을 구현한다. 미리 합의한 교체 지점(seam, 그 자리의 코드를 고치지 않고 동작을 바꿔 끼울 수 있는 위치이자 모듈 인터페이스가 놓이는 곳)마다 `/tdd`를 실행하고, 커밋하기 전에 `/code-review`로 마무리한다.
- **[wayfinder](./wayfinder/SKILL.md)**: 에이전트 세션 하나에 담을 수 없을 만큼 큰 작업을 이슈 트래커의 공유 계획 이슈(map, 결정 목록과 하위 티켓을 묶는 상위 이슈)로 계획한다. 계획 이슈는 결정 티켓(실행할 작업이 아니라 결정으로 해소되는 질문을 담은 하위 이슈)으로 이루어지고, 최종 목표까지 가는 방법이 분명해질 때까지 티켓을 하나씩 해결한다.

## 모델 호출(Model-invoked)

모델도 사람도 호출할 수 있다(모델이 스스로 호출할 수 있도록 트리거 문구를 풍부하게 적어 둔다).

- **[prototype](./prototype/SKILL.md)**: 설계 질문에 답하는 일회용 프로토타입을 만든다. 상태나 로직을 확인할 때는 공유할 수 있는 HTML 파일 하나를, UI를 확인할 때는 전환해 볼 수 있는 UI 변형 여러 개를 만든다.

- **[diagnosing-bugs](./diagnosing-bugs/SKILL.md)**: 어려운 버그와 성능 회귀를 정해진 순서대로 진단하는 루프다. 이 버그에서 실패하는 피드백 루프 만들기 → 최소화 → 가설 세우기 → 계측 → 수정 → 회귀 테스트 순서로 진행한다.
- **[research](./research/SKILL.md)**: 신뢰도 높은 1차 자료(실제 대화, 커밋, 공식 문서처럼 원본 그대로인 자료)를 바탕으로 질문을 조사하고, 결과를 출처를 단 Markdown 파일로 저장소에 남긴다. 백그라운드 에이전트로 실행한다.
- **[tdd](./tdd/SKILL.md)**: 레드-그린-리팩터(실패하는 테스트 작성, 통과시키기, 리팩터링 순서의 반복) 루프로 하는 테스트 주도 개발이다. 기능을 만들거나 버그를 고칠 때 수직 슬라이스(스키마, API, UI, 테스트 모든 계층을 좁게 관통하는 작업 단위)를 하나씩 진행한다.
- **[domain-modeling](./domain-modeling/SKILL.md)**: 용어를 따져 묻고, 시나리오로 검증하고, `CONTEXT.md`와 ADR을 그 자리에서 갱신하며 프로젝트의 도메인 모델을 적극적으로 만들고 다듬는다.
- **[codebase-design](./codebase-design/SKILL.md)**: 깊은 모듈(작은 인터페이스 뒤에 많은 동작을 담은 모듈)을 설계할 때 여러 스킬이 함께 쓰는 규칙과 용어다. 작은 인터페이스, 깔끔한 교체 지점, 인터페이스를 거쳐 테스트할 수 있는 구조를 다룬다.
- **[code-review](./code-review/SKILL.md)**: 기준점(비교 기준이 되는 커밋, 브랜치, 태그) 이후의 diff를 두 축으로 리뷰하고, 두 축을 병렬 서브에이전트로 실행한다. **코딩 표준**(Standards) 축은 저장소의 코딩 표준과 Fowler의 기본 코드 스멜(리팩터링이 필요할 수 있다는 징후) 목록을 따르는지 보고, **스펙**(Spec) 축은 원래 이슈나 스펙을 충실하게 구현했는지 본다.
- **[resolving-merge-conflicts](./resolving-merge-conflicts/SKILL.md)**: 진행 중인 git merge나 rebase 충돌을 변경 블록(hunk) 단위로 처리한다. 양쪽의 1차 자료까지 추적해 확인한 의도에 따라 해결한 뒤 merge나 rebase를 끝마치며, `--abort`는 절대 쓰지 않는다.
- **[wizard](./wizard/SKILL.md)**: 사람만 할 수 있는 단계를 차례로 안내하는 대화형 bash 마법사(wizard)를 만든다. 인프라 프로비저닝, 자격 증명이나 CI 시크릿 설정, 낯선 외부 서비스 대시보드 조작, 일회성 마이그레이션이나 전환 작업이 여기에 해당한다.
