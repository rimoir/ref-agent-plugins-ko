# 플랫폼 기본 해결책

게으른 시니어 개발자가 가장 먼저 묻는 질문은 늘 같다. *플랫폼이 이미 이 일을 하는가?*

이 문서는 가장 흔한 경우에 그 질문의 답을 정리한다. 패키지를 설치하기 전에 여기부터 훑어본다. 플랫폼 기능은 추가 비용 없이 앱과 함께 제공되고, 업데이트해도 깨지지 않으며, 바로 그 문제를 푸는 것이 업무인 사람들이 만들었다.

---

## HTML 요소

브라우저가 이미 폼 컨트롤로 제공하는 것들이다.

| 필요하다고 생각하는 것 | 플랫폼이 이미 제공하는 것 |
|---|---|
| 날짜 선택 라이브러리 | `<input type="date">` |
| 시간 선택 라이브러리 | `<input type="time">` |
| 색상 선택 라이브러리 | `<input type="color">` |
| 범위 슬라이더 라이브러리 | `<input type="range">` |
| 진행 막대 컴포넌트 | `<progress value="70" max="100">` |
| 미터/게이지 컴포넌트 | `<meter value="0.7">` |
| 모달/대화상자 라이브러리 | `<dialog>` + `dialog.showModal()` |
| 아코디언/FAQ 컴포넌트 | `<details><summary>Title</summary>…</details>` |
| 툴팁 라이브러리 | `title` 속성 + CSS `::before`/`::after` |
| 검색 가능한 드롭다운 | `<input list="id"> <datalist id="id">` |
| 내용에 맞춰 늘어나는 textarea | `field-sizing: content` (CSS) |
| 고정 헤더 | `position: sticky; top: 0` (CSS) |

---

## CSS 기능

개발자가 JavaScript로 구현하려고 하는 것들이다.

| JS가 필요하다고 생각하는 것 | CSS가 제공하는 것 |
|---|---|
| 반응형 글꼴 크기 | `font-size: clamp(1rem, 2.5vw, 2rem)` |
| 화면 크기에 따라 변하는 여백 | `padding: clamp(1rem, 5vw, 3rem)` |
| 다크 모드 | `@media (prefers-color-scheme: dark)` |
| 애니메이션 줄이기 | `@media (prefers-reduced-motion: reduce)` |
| 브레이크포인트 없는 반응형 레이아웃 | `grid-template-columns: repeat(auto-fill, minmax(250px, 1fr))` |
| 컴포넌트 단위 반응형 디자인 | `@container` 쿼리 |
| 전역 디자인 토큰 / 테마 | CSS 사용자 정의 속성 (`--color-primary: #7c3aed`) |
| 부드러운 스크롤 | `scroll-behavior: smooth` |
| 스크롤 스냅 캐러셀 | `scroll-snap-type: x mandatory` + `scroll-snap-align: start` |
| 가로세로 비율 고정 | `aspect-ratio: 16 / 9` |
| 말줄임표로 텍스트 자르기 | `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` |
| 여러 줄 텍스트 자르기 | `-webkit-line-clamp: 3` |
| CSS 캐스케이드 레이어 (스타일 격리) | `@layer base, components, utilities` |
| 중첩 CSS 선택자 | CSS 기본 중첩 (전처리기 필요 없음) |
| `has()` 부모 선택자 | `:has(input:checked)` |

---

## JavaScript / 브라우저 API

런타임에 이미 들어 있는데도 사람들이 설치하는 라이브러리들이다.

| 필요하다고 생각하는 것 | 플랫폼이 이미 제공하는 것 |
|---|---|
| `query-string` / `qs` | `new URLSearchParams(location.search)` |
| `lodash.clonedeep` | `structuredClone(obj)` |
| `lodash.groupby` | `Object.groupBy(arr, fn)` |
| `lodash.debounce` | 아래 debounce 한 줄 코드 참고 |
| `numeral` / `accounting` | `new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })` |
| `date-fns` 형식 지정 | `new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(date)` |
| `date-fns` 상대 시간 | `new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(-3, "day")` |
| `plural` / `i18n` 복수형 | `new Intl.PluralRules("en-US").select(count)` |
| `clipboard.js` | `navigator.clipboard.writeText(text)` |
| `uuid` (v4) | `crypto.randomUUID()` |
| 무한 스크롤 라이브러리 | `new IntersectionObserver(cb).observe(sentinel)` |
| 크기 변경 감지 라이브러리 | `new ResizeObserver(cb).observe(element)` |
| DOM 변경 감시 | `new MutationObserver(cb).observe(el, options)` |
| `uuid-validate` | `/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)` |
| `is-online` / `connectivity check` | `navigator.onLine` + `online`/`offline` 이벤트 |
| `sharesheet` 라이브러리 | `navigator.share({ title, text, url })` |
| `store.js` / `localForage` (단순한 경우) | `localStorage.setItem(key, JSON.stringify(val))` |
| 시간 초과 시 fetch 중단 | `fetch`에 `AbortSignal.timeout(5000)` 전달 |
| 직접 만든 이벤트 버스 | `new EventTarget()` / `dispatchEvent(new CustomEvent("x", { detail }))` |

**debounce 한 줄 코드** (라이브러리 없이):
```js
// ponytail: 의존성 하나보다 3줄이 낫다
let t;
const debounce = (fn, ms) => (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
```

---

## Swift / SwiftUI

사람들이 라이브러리나 직접 만든 뷰로 해결하려고 하는 UI 컴포넌트들이다.

| 필요하다고 생각하는 것 | 플랫폼이 이미 제공하는 것 |
|---|---|
| 날짜/시간 선택 라이브러리 | `DatePicker` |
| 색상 선택 라이브러리 | `ColorPicker` |
| 검색창 + 필터링 | `.searchable(text:)` |
| 당겨서 새로고침 라이브러리 | `.refreshable { }` |
| 밀어서 삭제 / 행 동작 | `.swipeActions { }` |
| 비동기 이미지 로딩 + 캐시 | `AsyncImage` |
| 차트 라이브러리 | Swift Charts (`import Charts`) |
| 마크다운 렌더링 | `Text(...)` 마크다운 / `AttributedString(markdown:)` |
| 공유 시트 래퍼 | `ShareLink` |
| 로딩 스피너 | `ProgressView()` |
| 사진 선택기 | `PhotosPicker` |
| 지도 SDK (기본) | `Map` (SwiftUI용 MapKit) |
| 그리드 레이아웃 라이브러리 | `Grid` / `LazyVGrid` |

래퍼 라이브러리가 감싸고 있는 프레임워크와 표준 라이브러리다.

| 필요하다고 생각하는 것 | 플랫폼이 이미 제공하는 것 |
|---|---|
| JSON 라이브러리 (SwiftyJSON) | `Codable` + `JSONDecoder` / `JSONEncoder` |
| HTTP 클라이언트 (Alamofire, 단순한 용도) | `URLSession` async/await. 대규모에서 복잡한 재시도나 multipart가 필요하면 Alamofire를 쓸 만하다 |
| 날짜/숫자/통화 형식 지정 | `.formatted()` / `FormatStyle` |
| 정규식 라이브러리 | Swift 정규식 리터럴 + `Regex` |
| 암호화 라이브러리 (CryptoSwift) | `CryptoKit` |
| 키체인 래퍼 | Security `SecItem`. 의존성이 아니라 코드 몇 줄이면 된다 |
| 영속성 / ORM | `SwiftData`, 작은 키-값에는 `@AppStorage` |
| 로깅 라이브러리 | `Logger` (`os.log`) |
| UUID / Base64 헬퍼 | `UUID()`, `Data(...).base64EncodedString()` |
| 이미지 다운샘플링 | ImageIO `CGImageSourceCreateThumbnailAtIndex` |
| 비동기용 Combine 래퍼 | async/await + `AsyncSequence` |

---

## Node.js 표준 라이브러리

Node 기본 모듈을 감싼 패키지들이다.

| 필요하다고 생각하는 것 | Node가 제공하는 것 |
|---|---|
| `mkdirp` | `fs.mkdirSync(path, { recursive: true })` |
| `rimraf` | `fs.rmSync(path, { recursive: true, force: true })` |
| `make-dir` | `fs.mkdirSync(path, { recursive: true })` |
| `slash` (윈도우 경로) | `path.posix` 또는 `path.normalize()` |
| `uuid` (v4) | `crypto.randomUUID()` |
| `ms` (기간 문자열 파싱) | `ms`는 그대로 쓴다. 실제로 쓸모 있고 작다 |
| `is-stream` | `val instanceof stream.Readable` |
| `object-assign` | `Object.assign()` / 전개 구문 |
| `array-uniq` | `[...new Set(arr)]` |
| `array-flatten` | `arr.flat(Infinity)` |
| `flat` | `arr.flat(depth)` |
| `path-exists` | `fs.existsSync(path)` |
| `load-json-file` | `JSON.parse(fs.readFileSync(path, "utf8"))` |
| `write-json-file` | `fs.writeFileSync(path, JSON.stringify(obj, null, 2))` |
| `pkg-dir` | `path.resolve(__dirname, "..")` / `import.meta.dirname` |

---

## Python 표준 라이브러리

Python에 이미 들어 있는 기능을 감싼 패키지들이다.

| 필요하다고 생각하는 것 | Python이 제공하는 것 |
|---|---|
| `python-dateutil` (기본 파싱) | `datetime.fromisoformat()` (Python 3.7+) |
| `pytz` | `zoneinfo.ZoneInfo("America/New_York")` (Python 3.9+) |
| `attrs` (단순한 데이터 클래스) | `@dataclass` |
| `six` | 지운다. Python 2는 더 이상 쓰지 않는다 |
| `pathlib2` | `pathlib.Path` (Python 3.4부터 내장) |
| `enum34` | `enum.Enum` (Python 3.4부터 내장) |
| `typing_extensions` (흔한 타입) | `from __future__ import annotations` + 내장 제네릭 |
| `simplejson` (기본 용도) | `json` (표준 라이브러리) |
| `requests` (단순한 GET) | `urllib.request.urlopen(url)`. 그보다 복잡한 요청에는 `requests` |
| `click` (명령 하나) | `argparse` (표준 라이브러리) |
| `mergedeep` | `dict \| other_dict` (Python 3.9+) |
| `more-itertools` (기본) | `itertools` (표준 라이브러리): `chain`, `islice`, `groupby`, `product` |
| `toolz` (기본) | `functools`: `lru_cache`, `partial`, `reduce` |
| `tabulate` (개발/디버그 전용) | 빠르게 들여다볼 때는 `pprint.pprint()` |

---

## 데이터베이스

데이터베이스가 이미 하는 일을 애플리케이션 계층에서 구현하는 것들이다.

| 앱 코드가 필요하다고 생각하는 것 | 데이터베이스가 제공하는 것 |
|---|---|
| offset/limit 페이지네이션 | `LIMIT 20 OFFSET 40` |
| 누적 합계 | `SUM(...) OVER (ORDER BY date)` (윈도 함수) |
| 그룹 안 순위 | `RANK() OVER (PARTITION BY category ORDER BY score DESC)` |
| 피벗 / 교차표 | `FILTER (WHERE ...)` + 조건부 집계 |
| 중복 제거 | `SELECT DISTINCT` / `ON CONFLICT DO NOTHING` |
| 소프트 삭제 필터링 | 생성 열 + 부분 인덱스 |
| 트리 탐색 | 재귀 CTE (`WITH RECURSIVE`) |
| 전문 검색 (기본) | `tsvector` / `MATCH AGAINST` / `FTS5` |
| JSON 저장 + 조회 | `jsonb` (Postgres) / `JSON_EXTRACT` (SQLite/MySQL) |
| UUID 생성 | `gen_random_uuid()` (Postgres) / `UUID()` (MySQL) |
| 삽입/수정 시 타임스탬프 | `DEFAULT now()` + 트리거 또는 `ON UPDATE CURRENT_TIMESTAMP` |
| 고유성 보장 | 애플리케이션 수준 검사가 아니라 `UNIQUE` 제약 |
| 참조 무결성 보장 | 애플리케이션 수준 검사가 아니라 `FOREIGN KEY` |
| 값 범위 보장 | 애플리케이션 수준 검증이 아니라 `CHECK (price > 0)` |

---

## 반복되는 패턴

어느 계층에서나 패턴은 같다.

```
플랫폼 팀이 몇 년에 걸쳐 문제를 해결한다.
패키지 작성자가 그것을 감싼다.
개발자는 그 래퍼를 설치한다.
래퍼는 관리되지 않고 방치된다.
개발자는 래퍼를 디버깅한다.
```

래퍼를 건너뛴다. 플랫폼 기능은 추가 비용 없이 앱과 함께 제공된다.

기본 해결책이 정말로 부족할 때(오래된 브라우저 지원, 기본 기능이 처리하지 못하는 예외 상황, 대규모에서 중요해지는 사용 편의성)에는 라이브러리를 쓸 이유가 있다. 그때 설치하고, 그 전에는 설치하지 않는다.
