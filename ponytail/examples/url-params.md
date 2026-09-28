# URL 매개변수

**과제:** "URL 쿼리 문자열을 파싱하고 만들어 줘."

## Ponytail 없이

```bash
npm install query-string
# 4.5 kB gzipped, 3.5M downloads/week
```

```js
import qs from "query-string";

// Parse
const params = qs.parse(location.search);
// → { page: "2", sort: "name", tags: ["js", "css"] }

// Build
const url = qs.stringify({ page: 2, sort: "name", tags: ["js", "css"] });
// → "page=2&sort=name&tags=js&tags=css"
```

## Ponytail 적용

```js
// ponytail: URLSearchParams does this
const params = new URLSearchParams(location.search);

// Read
params.get("page");         // "2"
params.getAll("tags");      // ["js", "css"]

// Build
const out = new URLSearchParams({ page: 2, sort: "name" });
out.append("tags", "js");
out.append("tags", "css");
out.toString(); // "page=2&sort=name&tags=js&tags=css"
```

**의존성 1개 → 의존성 0개.** `URLSearchParams`는 모든 브라우저에 있고 Node.js에는 v10부터 있다. 인코딩, 반복되는 키, 순회를 처리한다. 이 패키지는 이미 몇 년 전부터 모든 환경에 들어 있는 API의 폴리필이었다.
