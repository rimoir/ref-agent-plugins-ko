---
name: principle-test-behavior-not-implementation
description: "테스트를 쓰거나 바꾸거나 유지할 때 적용한다. 사용자가 부르는 방식대로 코드를 부르고, 사용자가 보는 정확한 결과를 단언한다. import한 모든 함수가 undefined를 반환해도 통과할 테스트는 다시 쓰거나 지운다."
disable-model-invocation: true
---

# 구현이 아니라 동작을 테스트한다

테스트는 사용자가 부르는 방식대로 코드를 부르고, 사용자가 보는 정확한 결과를 단언한다. import한 모든 함수가 `undefined`나 틀린 값을 반환해도 여전히 통과할 테스트는 다시 쓰거나 지운다.

다음 형태는 이 점검을 통과하지 못한다.

- 느슨하거나 없는 단언. `toBeDefined`, `toBeTruthy`, `not.toThrow`, `toBeGreaterThan(0)`.
- 호출이나 부재만 확인. `toHaveBeenCalled`, `not.toHaveBeenCalled`, `toBeUndefined`, `toEqual([])`.
- 테스트 대상 코드가 계산한 기댓값. `expect(f(a)).toBe(f(a))`.
- 상수, 설정 기본값, 표의 행, 프롬프트 문자열을 되풀이하는 단언.
- 대상을 부르지 않고 테스트가 만든 데이터를 단언.

고치는 법: 테스트 본문에서 구체적인 입력 하나로 대상을 부르고 리터럴 출력이나 효과를 단언한다. mock이라면 mock이 받은 페이로드를 단언한다. 부재를 확인하려면 다른 입력에 대한 존재도 단언한다. 상수라면 값을 되풀이하지 말고 그 상수를 읽는 메커니즘을 입력 하나로 테스트한다.

표의 행들 사이의 관계 검사(두 표에 모두 있는 키, 실제로 존재하는 부모)와 `*.test-d.ts` 타입 검사는 남긴다.
