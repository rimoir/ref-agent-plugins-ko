---
name: principle-test-behavior-not-implementation
description: "테스트를 쓰거나 바꾸거나 유지할 때 적용한다. 사용자가 부르는 방식대로 코드를 부르고, 사용자가 관찰하는 결과를 리터럴 기댓값과 비교해 단언한다. import한 모든 함수가 undefined를 반환해도 테스트가 통과한다면 단언을 다시 쓰거나 테스트를 지운다."
disable-model-invocation: true
---

# 구현이 아니라 동작을 테스트한다

테스트는 사용자가 부르는 방식대로 코드를 부르고, 사용자가 관찰하는 결과를 리터럴 기댓값과 비교해 단언한다. 코드가 어떤 호출을 했는지 단언하거나 코드에 들어 있는 상수를 되풀이하는 테스트는 둘 중 어느 것도 하지 않는다.

점검법: 테스트를 남기기 전에, 그 테스트가 import하는 모든 함수가 `undefined`를 반환해도 여전히 통과할지 묻는다. 그렇다면 그 테스트는 아무 동작도 관찰하지 않고 결함 때문에 실패할 수도 없다. 단언을 다시 쓰거나 테스트를 지운다.

**이유:** 결함 때문에 실패할 수 없는 테스트는 CI 시간과 리뷰 주의력을 잡아먹으면서 아무것도 잡지 못한다. 상수 고정 테스트는 누군가 그 상수나 그것이 되풀이하는 프롬프트를 고쳐도 실패하므로, 그 수정을 가로막는다.

**import한 모든 함수가 `undefined`를 반환해도 통과하는 다섯 가지 형태:**

- **약하거나 없는 단언.** `expect`가 없거나, `toBeDefined`, `toBeTruthy`, `not.toThrow`, `toBeInstanceOf`, `toBeGreaterThan(0)`뿐이다.
- **mock이나 부재만 확인.** `toHaveBeenCalled`, `not.toHaveBeenCalled`, `toBeUndefined`, `toEqual([])`, `toHaveLength(0)`, `not.toBe(wrongValue)`뿐이다.
- **자기 참조.** 기댓값이 테스트 대상 코드에서 나온다. `expect(f(a)).toBe(f(a))`, `expect(parsed.url).toBe(buildUrl(...))`.
- **상수 고정.** 단언이 손으로 관리하는 상수, 설정 기본값, 표의 행, 프롬프트 문자열을 되풀이한다. `expect(LIMITS.maxTools).toBe(8)`, `expect(PROMPT).toContain("You are")`.
- **fixture가 fixture를 단언.** 단언이 테스트가 만든 데이터나 `beforeEach`에서 계산한 값을 읽고, 테스트 대상은 본문 안에서 한 번도 실행되지 않는다.

**고치는 법:** 테스트 본문 안에서 구체적인 입력 하나로 대상을 부르고, 리터럴 출력이나 관찰 가능한 효과를 단언한다. `expect(slugify("Hello, World!")).toBe("hello-world")`. 부재를 확인하려면 같은 테스트에서 다른 입력에 대한 존재도 단언한다. 상수라면 값을 되풀이하지 말고 그 상수를 읽는 메커니즘을 입력 하나로 테스트한다. mock이라면 호출됐는지가 아니라 mock이 받은 페이로드나 호출 뒤의 상태를 단언한다. 그런 단언이 없다면 테스트를 지운다.

**남길 것:** 표의 행들 사이의 관계를 확인하는 테스트(두 표에 모두 있는 키, 실제로 존재하는 부모)와 `*.test-d.ts` 파일의 컴파일 시점 검사.
