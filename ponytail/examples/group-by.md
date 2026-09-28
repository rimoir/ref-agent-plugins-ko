# 키로 묶기

**과제:** "이 객체 배열을 키 기준으로 묶어 줘."

## Ponytail 없이

```bash
npm install lodash
```

```js
import { groupBy } from "lodash";

const byStatus = groupBy(orders, "status");
// → { pending: [...], shipped: [...], delivered: [...] }
```

또는 직접 작성한 버전:

```js
const byStatus = orders.reduce((acc, order) => {
  (acc[order.status] ??= []).push(order);
  return acc;
}, {});
```

## Ponytail 적용

```js
// ponytail: Object.groupBy does this
const byStatus = Object.groupBy(orders, order => order.status);
// → { pending: [...], shipped: [...], delivered: [...] }
```

**의존성 1개(또는 reduce) → 내장 기능 1개.** `Object.groupBy`는 Chrome 117, Firefox 119, Safari 17.4, Node.js 21부터 들어 있다. 일반 객체 대신 `Map`이 필요하면 `Map.groupBy(orders, o => o.status)`를 쓴다. 대상 런타임을 확인한다. IE11이나 오래된 Node를 지원해야 한다면 lodash가 아니라 `reduce` 한 줄 코드가 여전히 맞는 선택이다.
