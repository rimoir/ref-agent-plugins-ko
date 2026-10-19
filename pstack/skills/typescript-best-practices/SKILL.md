---
name: typescript-best-practices
description: "TypeScript 모범 사례. .ts나 .tsx 파일을 읽거나 편집할 때 쓴다."
paths: ["**/*.ts", "**/*.tsx"]
disable-model-invocation: true
---

# TypeScript 모범 사례

**type-system-discipline** 원칙 스킬을 먼저 적용한다.

| 규칙 | 요약 |
|------|---------|
| 판별 유니온(Discriminated unions) | 변형은 `kind` 리터럴 판별자로 모델링해 불가능한 상태를 표현할 수 없게 한다. 선택 필드 묶음은 쓰지 않는다. |
| 브랜드 타입(Branded types) | 원시 타입에 `& { readonly __brand: "X" }`로 브랜드를 붙여 서로 섞이지 않게 한다. 검증은 경계에서 한 번만. 브랜드는 `as`가 아니라 검증하는 타입 가드(`input is AgentId`)에서 얻는다. |
| 구성적 모델링(Constructive modeling) | 잘못된 값을 아예 만들 수 없도록 형태를 짠다. 비어 있지 않음은 `[T, ...T[]]`, 짝수 길이는 `[T, T][]`, 범위는 `start`와 `duration`. 런타임 가드도 아니고, 정제 타입(refinement type)을 바라는 것도 아니다. |
| 가장 단순한 전함수 타입 | 그 위의 모든 연산이 전함수(total)로 남는 한 `T[]`를 유지한다. 느슨한 타입 때문에 `!`, 캐스트, "일어날 리 없음" throw가 필요해지는 곳에서만 `NonEmpty<T>`로 강화한다. |
| `any`보다 `unknown` | 외부 데이터는 `unknown`이다. |
| 가드보다 스키마 먼저 | 속성 하나하나를 검사하는 타입 가드를 손으로 쓰기 전에, 저장소의 런타임 스키마 라이브러리를 쓰고 `z.infer`처럼 스키마에서 타입을 추론한다. |
| `as` 캐스트 금지 | 모든 `as`는 터지기를 기다리는 런타임 크래시다. 캐스트는 검증 뒤에만. |
| 좁히기 위계 | 판별자 switch > `in` 연산자 > `typeof`/`instanceof` > 사용자 정의 타입 가드 > `as`. |
| 타입 가드 | 주장을 실제로 검증해야 한다. 거짓말하는 가드는 `as`보다 나쁘다. 안전하다고 말하는 이름 뒤에 버그가 숨기 때문이다. 이름은 `isX`나 `hasX`로. |
| 완전성 검사 | default 갈래에 `const _exhaustive: never = x;`를 인라인으로 넣어, 새 변형이 추가되면 컴파일러가 오류를 내게 한다. |
| `as`보다 `satisfies` | 리터럴 타입을 넓히지 않고 값을 검증한다. |
| 경계 검증 | 데이터가 들어오는 곳에서 이름 붙은 도메인 타입으로 파싱한다. `Record<string, unknown>`(어떻게 쓰든)은 그 파싱에서 멈춘다. 안쪽에서는 타입을 신뢰한다. **boundary-discipline** 원칙 스킬을 본다. |
| 스키마에서 파생한 타입 | 새 인터페이스를 선언하기 전에 `Pick`/`Omit`/`Parameters`/`ReturnType`/`Awaited`/`typeof`를 먼저 쓴다. |
| 객체 인자 | 위치 인자 대신 객체를 넘겨 인자 순서가 스스로 설명되게 한다. 핫 패스(프레임마다 렌더, 토크나이저, 파서)에서는 건너뛴다. |
| 진짜 테스트 | 돌릴 수 있는 것은 목(mock)으로 만들지 않는다. 누수/disposable 검사가 있는 프레임워크의 실제 테스트 기본 요소를 쓰고, UI는 실행 중인 빌드에서 검증한다. 로컬에서 돌릴 수 없는 것만 목으로 만든다. |
| 구조화된 텔레메트리 | id 하나로 디버깅할 수 있을 만큼 맥락을 담은 구조화된 로거 진단을 쓴다. 출시 코드에 `console.log`는 없다. |

예시: `references/patterns.md`.
