---
name: migrate-to-shoehorn
description: "테스트 파일의 `as` 타입 단언을 @total-typescript/shoehorn으로 옮긴다. 사용자가 shoehorn을 언급할 때, 테스트의 `as`를 바꾸고 싶을 때, 일부만 채운 테스트 데이터가 필요할 때 쓴다."
---

# Shoehorn으로 옮기기

## 왜 shoehorn인가?

`shoehorn`을 쓰면 테스트에서 일부만 채운 데이터를 넘겨도 TypeScript 타입 검사를 통과한다. `as` 단언을 타입 안전한 방법으로 바꿔 준다.

**테스트 코드에만 쓴다.** 프로덕션 코드에서는 shoehorn을 절대 쓰지 마라.

테스트에서 `as`를 쓸 때의 문제는 다음과 같다.

- 개발자는 `as`를 쓰지 않도록 배워 왔다.
- 대상 타입을 직접 적어야 한다.
- 일부러 틀린 데이터를 넘기려면 `as`를 두 번 써야 한다(`as unknown as Type`).

## 설치

```bash
npm i @total-typescript/shoehorn
```

## 옮기는 패턴

### 필요한 속성은 적은데 큰 객체

변경 전:

```ts
type Request = {
  body: { id: string };
  headers: Record<string, string>;
  cookies: Record<string, string>;
  // ...20 more properties
};

it("gets user by id", () => {
  // Only care about body.id but must fake entire Request
  getUser({
    body: { id: "123" },
    headers: {},
    cookies: {},
    // ...fake all 20 properties
  });
});
```

변경 후:

```ts
import { fromPartial } from "@total-typescript/shoehorn";

it("gets user by id", () => {
  getUser(
    fromPartial({
      body: { id: "123" },
    }),
  );
});
```

### `as Type` → `fromPartial()`

변경 전:

```ts
getUser({ body: { id: "123" } } as Request);
```

변경 후:

```ts
import { fromPartial } from "@total-typescript/shoehorn";

getUser(fromPartial({ body: { id: "123" } }));
```

### `as unknown as Type` → `fromAny()`

변경 전:

```ts
getUser({ body: { id: 123 } } as unknown as Request); // wrong type on purpose
```

변경 후:

```ts
import { fromAny } from "@total-typescript/shoehorn";

getUser(fromAny({ body: { id: 123 } }));
```

## 함수별 쓰임새

| 함수            | 쓰는 경우                                          |
| --------------- | -------------------------------------------------- |
| `fromPartial()` | 일부만 채웠지만 타입 검사는 통과하는 데이터를 넘길 때 |
| `fromAny()`     | 일부러 틀린 데이터를 넘길 때(자동 완성은 유지된다) |
| `fromExact()`   | 객체 전체를 강제할 때(나중에 fromPartial로 바꿔 쓴다) |

## 작업 순서

1. **요구사항 수집**: 사용자에게 묻는다.
   - 어떤 테스트 파일의 `as` 단언이 문제를 일으키는가?
   - 일부 속성만 중요한 큰 객체를 다루고 있는가?
   - 오류를 테스트하려고 일부러 틀린 데이터를 넘겨야 하는가?

2. **설치하고 옮기기**:
   - [ ] 설치한다: `npm i @total-typescript/shoehorn`
   - [ ] `as` 단언이 있는 테스트 파일을 찾는다: `grep -r " as [A-Z]" --include="*.test.ts" --include="*.spec.ts"`
   - [ ] `as Type`을 `fromPartial()`로 바꾼다.
   - [ ] `as unknown as Type`을 `fromAny()`로 바꾼다.
   - [ ] `@total-typescript/shoehorn`에서 import를 추가한다.
   - [ ] 타입 검사를 실행해 확인한다.
