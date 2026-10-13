# 번역 규칙집: Python (toml 0.10.2) → TypeScript

META-RULE: 두 에이전트가 한 질문에 서로 다르게 답할 수 있다면 그 답은 이 파일에
둔다. 코드를 쓰기 전에 이 문서를 끝까지 읽는다. 루프 안에서는 읽기 전용이다.
수정 제안은 대기열에 넣고 스스로 반영하지 않는다.

## 0. 범위와 기본 자세
- 구조 보존. .py 파일 하나 -> .ts 파일 하나, 함수/클래스 경계와 제어 흐름을
  그대로 둔다. 개선하는 것이 아니라 옮기는 것이다.
- CHEAP-REFEREE VARIANT: tsc를 루프 안에서 돌린다(strict 모드). 타입 검사를
  통과하지 못한 초안은 끝난 것이 아니다. ("컴파일러를 돌리지 않는다"를 대신한다.
  타입 검사가 싼 경우를 위해 문서화한 Step 4 해체다.)
- 첫 패스는 성능이 아니라 동작 충실도를 목표로 한다. 느린 줄 아는 번역은
  PERF(port):로 표시하고 넘어간다.

## 1. 생태계
- 런타임 의존성 ZERO. 원본과 같다. Node 표준 라이브러리만 쓴다.
- 대상: ES2022 모듈, strict tsconfig(저장소 루트에 커밋).
- `any`는 BANNED. `unknown` + 좁히기를 쓴다. 예외마다 같은 줄에 TODO(port):
  정당화가 필요하다.

## 2. 대응물이 없는 구문: 표준 매핑
| Python | TypeScript |
|---|---|
| dict | 일반 객체로 만든 Record<string, TomlValue> (JS는 삽입 순서를 보존한다. 그래서 ordered.py의 OrderedDict 변형은 아무것도 하지 않는 shim이 된다. 그래도 주석을 달아 1:1로 옮긴다) |
| None (데이터) | null. 자료구조 안에서 undefined는 절대 쓰지 않는다 |
| 선택 매개변수 =None | 시그니처에서 param?: T |
| str/unicode | string |
| int / float (둘 다) | number. Number.MAX_SAFE_INTEGER를 넘는 TOML 정수: TODO(port) 마커, number로 옮긴다 |
| datetime/date/time + TomlTz | tz.ts의 TomlDateTime/TomlDate/TomlTime 클래스. 구성 요소와 원래 오프셋 문자열을 저장한다. 출력에는 toISOString(). JS Date를 데이터 모델로 쓰지 않는다(가변성 + ms 정밀도 손실) |
| TomlDecodeError(msg, doc, pos) | class TomlDecodeError extends Error {doc: string; pos: number; lineno: number; colno: number}. 필드도 생성 위치도 같다 |
| isinstance(x, T) 연쇄 | 같은 순서의 typeof / instanceof 좁히기 |
| load()의 io 파일 객체 | load()는 문자열 경로나 경로 배열만 받는다. 파일 같은 객체: TODO(port) 마커 + TypeError throw (패리티 시나리오가 다루지 않는다) |

## 3. 탈출구
- 마커: TODO(port): 미룬 결정 · PERF(port): 느린 줄 앎 · 둘 다 grep할 수 있고 형식이 정확해야 한다.
- 번역한 파일은 모두 이렇게 끝난다: // PORT STATUS: confidence=<high|medium|low> todos=<N>

## 4. 이름과 출력 경로
- toml/<name>.py -> src/<name>.ts , toml/__init__.py -> src/index.ts
- 모든 함수, 클래스, 메서드, 매개변수 이름을 원본 그대로(snake_case 포함)
  보존한다. 패리티 디버깅이 TS 스타일보다 중요하다. 이름을 바꾸지 않는다.

## 5. 간극 목록
- nullability와 union 타입 계약은 정하는 것이 아니라 찾아본다:
  migration/inventory.tsv. 위치가 없으면 간극 목록의 버그다. 표시하고, 가장
  보수적인 타입을 적용하고, TODO(port)를 달고, 계속 진행한다.

## AMENDMENT LOG (게이트에서 사람/오케스트레이터가 반영한다. 루프 안에서는 절대 반영하지 않는다)
- A1 (간극 목록 작성 후): S2에 행 추가. InlineTableDict sentinel (decoder.py:631,
  :644의 동적 다중 상속, TS로 표현 불가) -> Symbol 브랜드:
  `const INLINE_TABLE = Symbol('toml.inline_table')`를 일반 객체에 단다.
  `isInlineTable()`이 브랜드를 확인한다. 값이 isTable()과 dict->일반 객체
  매핑을 모두 만족해야 하므로 클래스 대신 이 방식을 골랐다. 출처: 간극 목록의
  UNKNOWN 행 encoder.py:227, skeptic 리뷰로 확인.

- A2 (스트레스 테스트 후, diff-report.md의 수정 제안 10개):
  1. S0: 원본 결함은 버그까지 그대로 재현하고 BUG(port): <repro>로 표시한다(세 번째
     grep 마커). 패리티는 결함 있는 출력을 단언한다. 수정은 패리티를 맞춘 뒤에 한다.
  2. S2: Python 쪽이 IndexError를 던질 수 있는 인덱스 접근은 그 throw를 재현하거나
     (범위 검사) 마커를 단다. 조용한 undefined는 결함이다.
  3. S2 float 서식: 유한하지 않은 값 -> 정확히 nan/inf/-inf (TODO 허용 안 함).
     지수 표기 차이(1e-05 vs 0.00001)는 마커를 달고 허용하며 패리티에서 정규화한다.
  4. S2 int/float 디스패치: Number.isInteger (isSafeInteger 아님). 정수 값 float는
     ".0"을 잃는다. 허용하며 패리티에서 정규화한다.
  5. S2: 타입을 키로 쓰는 디스패치 dict -> _py_type 태그('str','bool','int',
     'float','list') + 클래스 생성자 참조를 키로 쓰는 Map. _py_type은 tz.ts의 공유 헬퍼다.
  6. isTable()의 긍정 정의: Object.getPrototypeOf(v) === Object.prototype || null.
     소속 모듈: decoder.ts, export한다.
  7. None->null 확장: dump_value에 닿은 null은 "null"로 렌더링된다(Python은 "None").
     허용하며 패리티에서 정규화한다. 인라인 테이블 안의 null은 출력하고 절대 건너뛰지 않는다.
  8. S2 예외: encoder 쪽 ValueError/TypeError -> 메시지가 바이트 단위로 같은 Error/TypeError.
     메시지는 패리티 표면의 일부다.
  9. S2 대응 타입 없음: Decimal -> 버린다(number 경로가 처리한다). numpy/pathlib encoder
     하위 클래스 -> 원래 이름 그대로 아무것도 하지 않는 shim으로 보존한다.
  10. _repr (%r 에뮬레이션): tz.ts의 공유 헬퍼. diff-report의 제어 문자 벡터를
      fixture 세트로 쓴다. 팬아웃 파일은 이것을 import하고 절대 다시 유도하지 않는다.
DEVIATION LOG: 새 파일로 다시 돌리는 bakeoff 라운드를 Step 3 첫 단위의 규칙 준수
리뷰에 합쳤다(예산에 맞춘 축소, dogfood 한정). 파일럿도 마찬가지다(selection.md 참고).
