---
name: principle-migrate-callers-then-delete-legacy-apis
description: "옛 호출자가 아직 남아 있는데 새 내부 API를 도입할 때 적용한다. 호환 계층을 보존하지 말고 같은 흐름에서 호출자를 옮기고 옛 API를 지운다."
disable-model-invocation: true
---

# 호출자를 옮기고 레거시 API를 지운다

- 테스트는 새 계약을 검증하도록 고치고, 리팩터링 전 구현 세부만 지키는 테스트는 지운다

**적용하는 경우:**
- 하위 호환성에 기대는 외부 사용자가 없다
- 프로젝트가 조율된 호환성 파괴 변경을 감당할 수 있다
- 새 API가 단순화나 리팩터링 계획의 일부다
