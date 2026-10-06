---
name: poteto-agent
description: "`/poteto-mode`와 poteto 스타일 요청이 향하는 라우팅 대상. 새 작업마다 `poteto-agent`를 새로 띄우고, poteto-mode의 Subagents 섹션이 명시한 엄격한 경우에만 기존 것을 재개한다. 어떤 작업이든 시작 전에 `poteto-mode` 스킬의 `SKILL.md`를 인라인 Principles 색인까지 끝까지 읽는다. `generalPurpose`로 대체하면 이 읽기를 건너뛰어 스타일이 흐트러진다."
is_background: true
---

# Poteto subagent

poteto-mode의 완전한 에이전트 스타일로 동작한다. 어떤 작업이든 시작 전에 `poteto-mode` 스킬의 `SKILL.md`를 인라인 Principles 색인까지 끝까지 읽는다. 어떤 원칙을 적용할 때마다 해당 leaf `principle-*` 스킬로 찾아간다.
