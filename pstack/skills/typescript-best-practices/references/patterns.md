# TypeScript 패턴

`SKILL.md`의 규칙별 코드 예시. 바탕에 깔린 원칙은 언어와 무관하다. **type-system-discipline**과 **boundary-discipline** 원칙 스킬을 본다.

## 브랜드 타입

원시 타입에 브랜드를 붙여 서로 섞이지 않게 한다. 검증은 경계에서 한 번만 한다. 하류 코드는 타입을 신뢰한다.

```ts
type AgentId = string & { readonly __brand: "AgentId" };

function parseAgentId(input: string): AgentId {
  if (!isUUID(input)) throw new Error(`Invalid agent id: ${input}`);
  return input as AgentId;
}

function focusAgent(id: AgentId): void {
  /* 입력은 신뢰한다 */
}
```

`readonly __brand: 'X'` 형태를 따른다. 새 관례를 지어내지 않는다.

## 판별 유니온

변형은 리터럴 판별자로 모델링한다. 모든 변형이 같은 필드 이름을 공유하고 변형마다 값이 고유하므로, 불가능한 조합을 표현할 수 없다.

```ts
// 하지 말 것. 불리언 + 선택 필드는 모순된 상태를 허용한다.
type DiffState = { loading: boolean; diff?: GitDiff; error?: string };

// 할 것. 유효한 상태만 존재한다.
type DiffState =
  | { kind: "loading" }
  | { kind: "ready"; diff: GitDiff }
  | { kind: "error"; error: string };
```

판별자 이름(`kind`, `type`, `tag`)을 하나 골라 계속 쓴다.

## 구성적 모델링

느슨한 타입을 런타임 검사로 제한하지 말고, 전부 유효한 부품으로 타입을 짓는다.

가변 튜플로 표현한 비어 있지 않음:

```ts
type NonEmpty<T> = [T, ...T[]];

// 하지 말 것: T[]에 모든 호출자가 반복해야 하는 길이 검사를 더함
function pickWinner(entries: string[]): string {
  if (entries.length === 0) throw new Error("no entries");
  return entries[Math.floor(Math.random() * entries.length)];
}

// 할 것: 이 타입의 빈 값은 존재할 수 없다
function pickWinner(entries: NonEmpty<string>): string {
  return entries[Math.floor(Math.random() * entries.length)];
}
```

평범한 `T[]`가 들어오는 곳에서는 가드로 한 번 좁힌다. 그러면 그 사실이 타입에 실려 다닌다.

```ts
const isNonEmpty = <T>(arr: T[]): arr is NonEmpty<T> => arr.length > 0;
```

짝으로 표현한 짝수 길이:

```ts
type Pairs<T> = [T, T][];
```

시작과 길이로 표현한 시간 범위:

```ts
// 하지 말 것: 불변식을 주석이 쥐고 있다
type TimeRange = { start: Date; end: Date }; // start <= end

// 할 것: 음수 범위는 쓸 수 없다. end는 필요할 때 파생한다
type TimeRange = { start: Date; durationMs: number };
```

`durationMs`는 평범한 number로 둔다. 길이를 기대하는 자리에 날것의 숫자가 들어올 수 있을 때만 (브랜드 타입에 따라) 브랜드를 붙이고, 반사적으로 붙이지 않는다. 나쁜 상태를 만들 수 없게 하는 표현을 고른 뒤, 필요한 읽기 방식은 그 위에 노출한다(`pairs.flat()`, `rangeEnd()` 헬퍼).

## 가장 단순한 전함수 타입

모든 것을 강화하지는 않는다. 그 위의 모든 연산이 전함수라면 `T[]`를 유지한다.

```ts
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0); // []는 0이다, 문제없다
```

느슨한 타입이 사용 지점에서 거짓말을 강요할 때 강화한다. 징후는 `!`, `arr[0] as T`, "일어날 리 없음" throw다.

```ts
// 하지 말 것: 부분성을 컴파일러 몰래 들여온다
function newestSession(sessions: Session[]): Session {
  return sessions.at(0)!;
}

// 할 것: 입력을 강화하면 단언이 사라진다
function newestSession(sessions: NonEmpty<Session>): Session {
  return sessions[0];
}
```

결과를 `Session | undefined`로 약화하는 것이 또 다른 전함수 시그니처다.

## `any`보다 `unknown`

외부 데이터는 언제나 `unknown`이다. 쓰기 전에 좁힌다.

```ts
// 하지 말 것
function handle(input: any) {
  return input.foo.bar;
}

// 할 것
function handle(input: unknown) {
  if (typeof input === "object" && input !== null && "foo" in input) {
    // 좁혀졌다. 컴파일러가 접근을 검증한다
  }
}
```

외부 출처에는 RPC 페이로드, `JSON.parse`, `postMessage`, IPC, 파일 내용, 환경변수, 데이터베이스 결과가 있다.

## 손으로 짠 가드보다 스키마 먼저

외부 데이터용으로 속성 하나하나를 검사하는 타입 가드를 쓰기 전에, 저장소의 런타임 스키마 라이브러리와 기존 스키마를 찾는다. 검증은 스키마 하나가 맡게 하고 TypeScript 타입은 거기서 파생한다. 서로 어긋날 수 있는 스키마, 중복 인터페이스, 가드를 따로 유지하지 않는다.

```ts
import { z } from "zod";

const UserSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(["admin", "member"]),
});

type User = z.infer<typeof UserSchema>;

function parseUser(input: unknown): User {
  return UserSchema.parse(input);
}
```

실패가 예상된 분기라면 `safeParse`를 쓴다. 저장소가 다른 스키마 라이브러리를 쓴다면 그에 맞는 추론 헬퍼를 쓴다. 가드 하나 때문에 새 스키마 의존성을 추가하지 않는다. 이 규칙은 코드베이스가 이미 신뢰하는 스키마 시스템을 우선한다.

## `as` 캐스트 금지

모든 `as`는 잠재적 런타임 크래시다. 타입 시스템이 주장을 검증한 뒤에만 캐스트한다.

```ts
import { z } from "zod";

// 하지 말 것
const user = data as User;

// 하지 말 것
function isUser(data: unknown): data is User {
  return typeof data === "object" && data !== null && "id" in data;
}

// 할 것
const userSchema = z.object({ id: z.string(), name: z.string() });
type User = z.infer<typeof userSchema>;

function parseUser(data: unknown): User {
  return userSchema.parse(data);
}
```

타입이 먼저 있으면 검증기에 그것이 증명하는 타입을 붙인다. 그러면 타입보다 덜 증명하는 검증기를 컴파일러가 거부한다. 아래 객체에서 `name`을 빼면 대입이 컴파일되지 않는다.

```ts
type User = { id: string; name: string };

const userSchema: z.ZodType<User> = z.object({ id: z.string(), name: z.string() });
```

기존 코드에서 `as`를 걷어 내는 리팩터링을 할 때는 TypeScript가 왜 추론하지 못하는지 찾는다.

- 판별자 누락: 하나 추가하고 판별 유니온으로 바꾼다.
- 지나치게 넓은 원천 타입(예: `Record<string, unknown>`): 좁힌다.
- 타입 없는 경계: 그 형태를 소유한 스키마로 파싱한다. 스키마가 없는 곳에만 새로 추가한다.
- 정말로 표현할 수 없음: 브랜드 타입이나 `satisfies`를 쓴다.

## 좁히기 위계

가장 좋은 것부터 최후의 수단까지.

1. **판별 유니온 switch / if.** 컴파일러가 자동으로 좁힌다.
2. **`in` 연산자.** `"key" in obj`는 그 키를 가진 변형으로 좁힌다.
3. **`typeof` / `instanceof`.** 원시 타입과 클래스 인스턴스용.
4. **사용자 정의 타입 가드.** 위의 것으로 부족할 때.
5. **`as` 캐스트.** 검증 뒤에만.

```ts
function area(s: Shape): number {
  if ("radius" in s) return Math.PI * s.radius ** 2; // circle로 좁혀짐
  return s.width * s.height; // rect로 좁혀짐
}
```

## 타입 가드

가드는 주장을 실제로 검증해야 한다. 거짓말하는 가드는 `as`보다 나쁘다.

```ts
function isCircle(s: Shape): s is Shape & { kind: "circle" } {
  return s.kind === "circle";
}
```

가능하면 판별자 좁히기를 쓴다.

## 완전성 검사

default 갈래에서 판별 대상을 `never` 타입 지역 변수에 대입한다.

```ts
// 값을 반환하는 switch
function area(s: Shape): number {
  switch (s.kind) {
    case "circle":
      return Math.PI * s.radius ** 2;
    case "rect":
      return s.width * s.height;
    default: {
      const _exhaustive: never = s;
      return _exhaustive;
    }
  }
}

// void switch
function handle(s: Shape): void {
  switch (s.kind) {
    case "circle":
      drawCircle(s);
      break;
    case "rect":
      drawRect(s);
      break;
    default: {
      const _exhaustive: never = s;
      void _exhaustive;
    }
  }
}
```

값을 반환하는 switch에는 return 방식, 문장 switch에는 void 방식을 쓴다.

## `as`보다 `satisfies`

`satisfies`는 리터럴 타입을 넓히지 않고 검증한다.

```ts
// 하지 말 것. 넓혀져서 리터럴 타입을 잃는다.
const config = { theme: "dark", cols: 3 } as Config;

// 할 것. 검증하면서 리터럴 타입도 보존한다.
const config = { theme: "dark", cols: 3 } satisfies Config;
// config.theme은 string이 아니라 "dark"(리터럴)다
```

## 경계 검증

데이터가 들어오는 곳에서 한 번 검증한다. 안쪽에서는 타입을 신뢰한다. **boundary-discipline** 원칙 스킬을 본다.

- **와이어 포맷**(proto, JSON-RPC): `ignoreUnknownFields`로 파싱해 앞으로 호환되는 변경이 옛 클라이언트를 깨뜨리지 않게 한다.
- **영속화된 JSON:** 버전이 붙은 blob, 파싱은 try/catch로 감싼다.
- 호출 사슬 깊은 곳에서 **다시 검증하지 않는다**.

## 스키마에서 파생한 타입

`.proto`, OpenAPI 명세, GraphQL 스키마, 데이터베이스 마이그레이션이 이미 형태를 정의한다면, 중복 정의하지 말고 생성된 타입에서 파생한다.

```ts
// 하지 말 것. 형태가 중복되어 스키마가 바뀌면 어긋난다.
type CheckSummary = {
  totalCount: number;
  checks: { name: string; status: string }[];
};
function renderChecks(s: CheckSummary) {
  /* ... */
}

// 할 것. 생성된 스키마 타입에서 파생한다.
import type { ChecksMessage } from "<generated module>";
function renderChecks(s: Pick<ChecksMessage, "totalCount" | "checks">) {
  /* ... */
}
```

새 인터페이스를 쓰기 전에 `Pick`, `Omit`, `Parameters`, `ReturnType`, `Awaited`, `typeof`를 먼저 쓴다.

## 객체 인자

```ts
// 하지 말 것. 두 인자를 바꿔도 컴파일된다.
openFile(uri, {
  startLineNumber: 10,
  startColumn: 1,
  endLineNumber: 10,
  endColumn: 1,
});

// 할 것. 순서와 무관하고 스스로 설명된다.
openFile({
  uri,
  selection: {
    startLineNumber: 10,
    startColumn: 1,
    endLineNumber: 10,
    endColumn: 1,
  },
});
```

핫 패스에서는 건너뛴다. 프레임마다 렌더, 토크나이저, 파서, 할당 비용이 중요한 촘촘한 루프 속의 모든 것.
