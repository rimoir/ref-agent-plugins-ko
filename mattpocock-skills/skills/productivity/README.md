# 생산성

코드에 한정되지 않는 일반 워크플로 도구다.

## 사용자 호출(User-invoked)

사람이 이름을 입력해야만 실행된다(Claude Code: `disable-model-invocation: true`, Codex: `agents/openai.yaml`의 `policy.allow_implicit_invocation: false`).

- **[grill-me](./grill-me/SKILL.md)**: 계획이나 설계를 두고 설계 결정 트리(결정 하나가 그 결정에 딸린 결정들로 갈라지는 구조)의 모든 분기가 정해질 때까지 집요한 인터뷰를 받는다.
- **[handoff](./handoff/SKILL.md)**: 다른 에이전트가 작업을 이어 갈 수 있도록 현재 대화를 인계 문서로 압축한다.
- **[teach](./teach/SKILL.md)**: 현재 디렉터리를 상태를 남기는 학습 작업 공간으로 써서, 여러 세션에 걸쳐 사용자에게 새 기술이나 개념을 가르친다.
- **[to-questionnaire](./to-questionnaire/SKILL.md)**: 혼자서는 답할 수 없는 결정을, 답할 수 있는 사람에게 보낼 Markdown 질문지로 만든다(그 사람이 비동기로 채우거나 회의에서 함께 채운다).
- **[wait-what](./wait-what/SKILL.md)**: 메시지를 이해하지 못한 순간 바로 실행한다. 에이전트가 사용자에게 부족했던 컨텍스트를 채워 `GLOSSARY.md` 용어를 써서 쉬운 말로 다시 설명한다.

## 모델 호출(Model-invoked)

모델도 사람도 호출할 수 있다(모델이 스스로 호출할 수 있도록 트리거 문구를 풍부하게 적어 둔다).

- **[grilling](./grilling/SKILL.md)**: 계획, 결정, 아이디어를 두고 설계 결정 트리의 모든 분기가 정해질 때까지 사용자를 집요하게 인터뷰한다.
- **[writing-for-agents](./writing-for-agents/SKILL.md)**: 에이전트가 읽는 문서를 쓴다. 스킬, AGENTS.md/CLAUDE.md, 에이전트가 포인터를 따라 찾아가는 모든 문서가 대상이다.
