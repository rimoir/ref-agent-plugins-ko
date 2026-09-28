# 숫자 서식

**과제:** "숫자를 통화 형식으로, 그리고 천 단위 구분 기호를 넣어 표시해 줘."

## Ponytail 없이

```bash
npm install numeral
# or: npm install accounting
```

```js
import numeral from "numeral";

numeral(1234567.89).format("$1,234.00"); // "$1,234,567.89"
numeral(0.745).format("0.0%");           // "74.5%"
numeral(1500).format("0.0a");            // "1.5k"
```

## Ponytail 적용

```js
// ponytail: Intl.NumberFormat does this, locale-aware
new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
  .format(1234567.89);
// → "$1,234,567.89"

new Intl.NumberFormat("en-US", { style: "percent" })
  .format(0.745);
// → "74.5%"

new Intl.NumberFormat("en-US", { notation: "compact" })
  .format(1500);
// → "1.5K"
```

**의존성 1개 → 의존성 0개.** `Intl.NumberFormat`은 모든 JS 런타임에 내장되어 있고, 모든 로케일을 올바르게 처리하며, 조회 테이블 없이도 어느 시장에서든 통화 기호, 소수점 구분 기호, 자릿수 묶음을 맞게 표시한다. 형식을 하드코딩한 라이브러리는 어떤 사용자에게는 반드시 틀린 결과를 낸다.
