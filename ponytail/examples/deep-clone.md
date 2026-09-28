# 깊은 복사

**과제:** "이 객체를 깊은 복사해 줘."

## Ponytail 없이

```bash
npm install lodash
```

```js
import { cloneDeep } from "lodash";

const copy = cloneDeep(original);
```

또는 오래전부터 흔히 쓰는 편법:

```js
// fragile: loses Date, undefined, Map, Set, circular refs, functions
const copy = JSON.parse(JSON.stringify(original));
```

## Ponytail 적용

```js
// ponytail: structuredClone does this
const copy = structuredClone(original);
```

**의존성 1개(또는 쉽게 깨지는 편법) → 내장 기능 1개.** `structuredClone`은 `Date`, `Map`, `Set`, `ArrayBuffer`, `RegExp`, 순환 참조 등을 처리한다. 모두 `JSON.parse/stringify`가 알리지 않고 버리는 것들이다. 2022년부터 모든 브라우저에서, v17부터 Node.js에서 쓸 수 있다. lodash는 함수 하나 때문이 아니라 나머지 기능까지 필요할 때 추가한다.
