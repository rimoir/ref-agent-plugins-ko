# 차이 보고서: 번역 A (규칙집) vs 번역 B (백지 기준선)

원본: `/tmp/dogfood/toml-src/toml/encoder.py` (toml 0.10.2). 두 번역 모두 비교 전에
prettier로 정규화했다. 이름 규칙(B는 camelCase)과 순수한 서식 차이는 뺐다. 아래의
동작 주장은 모두 Python 원본과, A의 문자열 로직을 충실히 떼어 낸 코드를 실행해서
확인했다. 인용한 출력은 예측이 아니라 실제 값이다.

판정 키: **rulebook right**(규칙집이 옳음) = 규칙집에서 나온 A의 답이 이긴다 · **native right**(독자 판단이 옳음)
= B가 혼자 낸 답이 이긴다 · **both defensible**(둘 다 변호 가능) · **both wrong**(둘 다 틀림).

| # | 차이 | A (규칙집) | B (백지) | 규칙집 절 / 간극 | 판정 + 근거 |
|---|---|---|---|---|---|
| 1 | `_dump_str`에 박힌 제어 문자 | `_repr` + split/join으로 원본의 손상을 재현한다: `_dump_str('a\x01b')` → `"ax01b"` (확인함. 이스케이프 백슬래시를 떨어뜨리는 Python과 똑같다) | `escapeString`은 올바른 TOML을 낸다: `"ab"` | S0("개선하는 것이 아니라 옮기는 것이다")가 자세를 정한다. SILENCE #5: `%r` repr에 규칙집 매핑이 없어 A가 `_repr`을 지어내야 했다 | **rulebook right** (자세 면에서). 이 마이그레이션의 합격 게이트는 원본과의 동작 비교다. B의 수정을 받으면 제어 문자 시나리오마다 diff가 생기고, 번역 오류와 구별할 수 없다. 수정 자체는 진짜이고 내보내야 한다. 다만 표시를 단 패리티 이후 패치로 낸다(→ 수정 제안 1). |
| 2 | `_dump_str`의 맨 앞 제어 문자 | Python: `_dump_str('\x01')` → **IndexError** (확인함). A: 조용히 `"01xundefined"`를 반환한다. JS의 범위 밖 `parts[1]`이 `undefined`를 내고, 표시 없이 이어 붙는다(확인함) | 올바른 `""`를 반환한다 | 간극: IndexError를 던지는 Python 인덱스 접근과 조용히 `undefined`를 내는 JS의 차이에 규칙이 없다 | **both wrong**. A는 자기 기준도 못 지킨다(Python이 던지는 곳에서 던져야 하는데, 문자 그대로 `undefined`가 들어간 쓰레기를 표시 없이 내보낸다). B는 패리티 기준선에서 일부러 벗어난다. 이 간극 탓에 A의 결함이 표시 없이 tsc를 통과했다(→ 수정 제안 2). |
| 3 | 중첩 인라인 테이블 | `"{ " + ... + " }\n"`을 1:1로 옮긴다 → Python의 잘못된 출력 `t = { a = { x = 1 }\n, b = 2 }`를 재현한다(확인함: 인라인 테이블 안의 줄바꿈) | `dumpInlineTable`이 줄바꿈 없이 `{ ... }`를 반환한다. 올바른 TOML을 낸다 | S0 자세. 여기서 원본 출력이 잘못됐다는 사실을 규칙집도 간극 목록도 말하지 않는다 | **rulebook right** (#1과 같은 이유: 먼저 버그까지 그대로, 수정은 패리티 이후 → 수정 제안 1). B의 출력이 라이브러리가 *해야 할* 동작이다. |
| 4 | inf/nan float | `_dump_float(Infinity)` → `"Infinity"` (잘못된 TOML, Python의 `inf`와 패리티 깨짐). A:257에서 `TODO(port)`로 미룸 | `formatFloat` → `nan` / `inf` / `-inf`. Python `str(float)`과 바이트 단위로 같고(확인함) 올바른 TOML이다 | 간극: S2의 int/float→number 행이 float *서식*(`str(float)` vs `String(number)`)을 말하지 않는다 | **native right**. A가 미룬 곳에서 B는 정확한 패리티를 이룬다. 규칙집이 담았어야 할, 알 수 있고 닫힌 형태의 매핑이었다(→ 수정 제안 3). |
| 5 | 2^53을 넘는 정수 | `Number.isInteger` 디스패치 → `2**53`이 `9007199254740992`를 내서 Python int 출력과 같다(확인함) | `Number.isSafeInteger` 관문 → `formatFloat`가 `.0`을 강제한다 → `9007199254740992.0`. TOML 정수를 조용히 TOML float로 바꾼다 | S2의 명시적 행: MAX_SAFE_INTEGER를 넘는 int → TODO 마커, number로 옮긴다 | **rulebook right**. S2 행이 있고 패리티에 맞는 출력을 낸다. B의 "안전" 재작성은 내보내는 타입을 바꾼다. (B가 더한 `bigint` 지원은 범위 밖 과잉 작업이지만 해는 없다.) |
| 6 | 정수 값 float (`5.0`) | `5`를 낸다(Python은 `5.0`). SILENCE #4에 차이를 표시함(`Number.isInteger` 디스패치가 `.0`을 잃는다) | `5`를 낸다(같은 차이, 표시 없음) | 간극: S2가 int/float를 `number`로 합치지만 패리티 결과는 말하지 않는다 | **both defensible**. JS 숫자 모델에서 피할 수 없고 두 쪽 동작이 같다. 다른 점은 A의 마커뿐이다. 패리티 하네스가 정규화할 수 있도록 규칙집이 이 손실을 허용한다고 밝혀야 한다(→ 수정 제안 4). |
| 7 | datetime 모델 | S2에 따른 tz.ts 클래스 stub(구성 요소 + 원래 오프셋. `_dump_time`은 원본대로 오프셋을 버린다). Python의 `2020-01-02T03:04:05+02:00`과 naive `...T03:04:05`를 재현할 수 있다(Python 출력 확인함) | JS `Date`: `toISOString()`은 항상 UTC+ms → `2020-01-02T01:04:05.000Z`. UTC가 아닌 오프셋은 다시 계산되고, naive datetime은 불가능하고, 날짜만/시간만 있는 타입은 표현할 수 없고, `_dump_time`의 로컬 시간 규칙이 사라진다 | S2 datetime 행("JS Date를 쓰지 않는다") | **rulebook right**, 결정적으로. 규칙이 B의 실패 방식을 정확히 예측했다. B는 설계 선택 하나로 동작 네 가지를 잃는다. |
| 8 | 디스패치 테이블 `dump_funcs` | `_py_type` 태그 + 생성자를 키로 쓰는 `Map<string\|Function, DumpFunc>`. Python처럼 하위 클래스가 맵을 바꾼다(`TomlPreserveCommentEncoder`가 `CommentValue`를 등록) | `dumpValue` 안의 `switch`로 재구성. 결과: `TomlNumpyEncoder`가 통째로 빠지고, `TomlPreserveCommentEncoder`는 덕 타이핑한 `isCommentValue`로 오버라이드된다. `dump` 함수가 있는 리프 객체는 모두 주석으로 잘못 분류된다 | S0(같은 클래스 경계, 같은 제어 흐름). SILENCE #3: 타입을 키로 쓰는 dict에 표준 매핑이 없었다 | **rulebook right**. 이 테이블은 기능이 걸린 확장 지점이다. B는 이것을 없애느라 하위 클래스 하나를 지우고 다른 하나를 느슨하게 만들어야 했다. 그래도 S2가 침묵했으니 A가 매핑을 지어냈다. 정식화한다(→ 수정 제안 5). |
| 9 | 죽은 코드: `u` 접두어 제거 (py:90-91) | "unreachable, ported 1:1" 주석과 함께 1:1로 옮김 | 제거함 | S0가 삭제를 금지한다 | **both defensible**. 두 구현 모두에서 확실히 죽은 코드다(A의 `_repr`은 `u` 접두어를 내지 않는다). 남겨 두면 diff 디버깅용 줄 맞춤만 얻고, 지워도 바뀌는 것이 없다. 여기서 S0의 일괄 금지는 가치가 낮은 일을 한다. |
| 10 | 죽은 코드: `TomlArraySeparatorEncoder.dump_list`의 평탄화 루프 (py:257-265) | 1:1로 옮김. 간극 목록 :260 행에 따라 `t: Array<string\|number\|(string\|number)[]>`로 선언해 strict tsc에서 분기가 살아남는다 | 제거함. 단순한 한 번 도는 루프 | S0 + 간극 목록 encoder.py:260 행(분기 삭제를 명시적으로 금지) | **rulebook right**. 이것은 진짜 죽은 코드가 *아니다*. `dump_value`를 오버라이드해 배열을 반환하는 하위 클래스(Python에서는 합법이고 루프가 소비한다)를 B의 제거가 막아 버린다. 간극 목록 행이 바로 이 경우를 내다봤다. |
| 11 | `isTable` 정의 | 제외 목록: 배열/null/tz 클래스/CommentValue가 아닌 객체 ⇒ 테이블. 임의의 클래스 인스턴스를 **테이블로 보고 재귀한다** | 프로토타입 검사(`proto === Object.prototype \|\| null`) ⇒ 클래스 인스턴스는 리프 값이 되어 문자열로 바뀐다. Python과 같다. Python에서는 `isinstance(x, dict)`가 false라 인스턴스가 `_dump_str(repr)` 리프 경로로 간다(확인함) | 간극: 간극 목록 행은 "plain-object guard"라고 하면서 실제로는 제외 목록("not a tz.ts class instance")으로 *명세한다*. 이것은 일반 객체 검사가 아니다 | **native right**. B의 긍정 검사가 `isinstance(x, dict)`를 충실히 옮긴 것이다. A의 제외 목록은 목록에 없는 클래스를 모두 잘못 분류한다. decoder가 만든 데이터에서는 닿지 않지만 사용자가 넘긴 데이터에서는 틀린다(→ 수정 제안 6). |
| 12 | 인라인 테이블의 `null` / `dump_value` 폴백 | `dump_inline_table(null entry)` → `k = "null"`을 낸다(Python은 `k = "None"`. 확인함. 텍스트는 다르지만 항목은 보존된다) | `dumpInlineTable`이 null/undefined 항목을 **조용히 버린다**(`continue`). 자기 문서에는 Python을 "mirrors"한다고 적었지만, Python은 `dump_sections`의 스칼라 분기에서만 None을 건너뛴다 | S2 None→null 행. None이 `dump_value`에 *닿는* 경우는 말하지 않는다 | **rulebook right**. A의 문자 그대로 옮긴 코드는 항목을 보존한다(피할 수 없는 `"None"`/`"null"` repr 텍스트만 다르다). B는 데이터를 잃는다. `"null"` vs `"None"` 텍스트 차이는 두 쪽이 같으니 허용한다고 밝힌다(→ 수정 제안 7). |
| 13 | `dump()` 가드 + 오류 메시지 | `if (!f.write)` truthy 검사 + 원본 메시지 그대로 `"You can only dump an object to a file descriptor"`. 순환 참조와 구분자 메시지도 바이트 단위로 같다 | `typeof sink?.write !== 'function'` + 다시 쓴 메시지 `"dump() requires a sink with a write() method"` | S0/S4(패리티 디버깅이 TS 스타일보다 중요). SILENCE #6/#8: ValueError 매핑에 답이 없다 | **rulebook right** (근소하게). 메시지는 관찰 가능한 패리티 표면의 일부다. B의 더 엄격한 가드는 Python이 받아들이는, 호출할 수 없지만 truthy인 `write`도 거부한다. A가 즉석에서 만든 예외 매핑을 정식화한다(→ 수정 제안 8). |
| 14 | API 표면 | 모든 이름/클래스 보존: `_dict: DictFactory` 매개변수, `TomlPreserveInlineDictEncoder`, 문서화한 shim으로 `TomlNumpyEncoder` + `TomlPathlibEncoder` | `_dict` 매개변수를 빼고, numpy/pathlib encoder를 빼고, `TomlPreserveInlineDictEncoder` → `TomlPreserveInlineTableEncoder`로 이름을 바꾸고, 생성자가 옵션 객체를 받는다 | S0(클래스 하나 → 클래스 하나) + S4(이름은 정확히. 대소문자 규칙 외의 이름 변경 금지) | **rulebook right**, *이 마이그레이션의 목적에서는*. grep 패리티와 시나리오 재사용이 이 표면에 기댄다. B의 표면은 처음부터 새로 짜는 TS 설계로는 더 낫지만, S0가 명시적으로 금지하는 개선이다. |

## 오케스트레이터가 요청한 판정

- A에서 **SILENCE 마커 9개 확인**(49, 59, 73, 82, 95, 182, 355, 472, 505행. 218/293행의 grep 결과는 상호 참조다). 서로 다른 미답 질문 8개를 담는다(ValueError가 두 번 나온다). 8개 모두 규칙집/간극 목록의 진짜 침묵으로 확인했다.
- **B의 `_dump_str` 주장은 참이고 오히려 축소해서 말했다**: 원본은 잘못된 TOML만 내는 것이 아니라(`'a\x01b'` → `"ax01b"`, 이스케이프 백슬래시가 떨어짐) 제어 문자로 *시작하는* 문자열에서 IndexError로 **크래시한다**(`'\x01'`, `'\x1b[31m'`, `'\x00'`, `'\x7f'` 모두 확인함). **판정: 정확히 재현하고, 수정은 받아들이지 않는다**(1~2행). 최종 패리티 게이트는 원본과 비교한다. "고친" 포트는 제어 문자 시나리오를 모두 잡음으로 만들어 진짜 번역 오류를 가린다. 수정은 그 자체로 옳으니 표시를 단 패리티 이후 패치에 넣는다. 덧붙여 A는 정확한 재현에도 실패했다. 똑같이 손상시키지도, 크래시하지도 않고 `"01xundefined"`를 낸다(2행, both wrong).
- **도달할 수 없는 코드 제거**: 판정이 갈린다. `u` 접두어 제거는 정말 죽은 코드라 지워도 해가 없다(9행, 너무 뭉툭한 S0에 맞서 both defensible). `TomlArraySeparatorEncoder` 평탄화 루프는 살아 있는 하위 클래스 확장 지점이라 지우면 Python이 허용하는 동작을 막는다(10행, rulebook right).
- **디스패치 테이블 재구성**: rulebook right(8행). 재구성 탓에 B는 `TomlNumpyEncoder`를 지우고 `TomlPreserveCommentEncoder`를 덕 타이핑으로 약하게 만들어야 했다. 이 테이블이 스타일이 아니라 구조라는 증거다.

## 점수

실질적인 차이 14개: **rulebook right 9 · native right 2 · both defensible 2 · both wrong 1.**
규칙집의 승리는 진짜다(5, 7, 10행은 근거가 있는 결정적 승리다). 하지만 9개 중 4개는
특정 규칙이 아니라 S0 자세에 기대고, native right 2행과 both wrong 1행은 모두 규칙집이
답한 적 없는 질문에 떨어진다. 규칙집의 약점은 틀린 규칙이 아니라 침묵이다. 서로 다른
SILENCE 8개 가운데 두 개(float 서식, 인덱스 의미론)가 관찰 가능한 패리티 결함을 A에 들였다.

## AMENDMENT QUEUE

1. **(1, 3행)** S0에 추가: 원본 동작 자체가 결함일 때(잘못된 출력이나 크래시) 버그까지 그대로 재현하고 그 위치에 `BUG(port): <repro>`를 표시한다. TODO/PERF와 나란히 세 번째 grep 마커다. 패리티 시나리오는 결함 있는 출력을 단언한다. 수정은 표시를 단 패리티 이후 패치로만 내보낸다. (B의 작성자는 이 방침을 짐작해야 했다. A는 버그를 재현했지만 그것이 버그라는 기록을 기계가 찾을 수 있게 남기지 않았다.)
2. **(2행)** S2에 추가: Python 시퀀스 인덱싱은 범위를 벗어나면 IndexError를 던진다. JS는 `undefined`를 반환한다. Python 쪽이 던질 수 있는 번역된 인덱스/`.at()` 접근은 throw를 재현하거나(명시적 범위 검사) 마커를 달아야 한다. A는 지금 규칙 아래에서 표시 하나 없이 `"01xundefined"`를 내보냈다. 조용히 `undefined`가 이어 붙은 결과다.
3. **(4행)** S2에 float 서식 행 추가: `str(float)` ≠ `String(number)`. 유한하지 않은 값에는 `nan`/`inf`/`-inf`를 의무로 한다(Python과 TOML에 정확히 맞고 닫힌 형태이니 TODO를 허용하지 않는다). 남는 지수 표기 차이(`1e-05` vs `0.00001`)는 마커를 달고 허용하는 목록으로 나열한다.
4. **(5, 6행)** S2 int/float 행 확장: int/float 디스패치로 `Number.isInteger`(`isSafeInteger` 아님)를 정식화하고, 알려진 허용 손실을 밝힌다. 정수 값 float는 `.0` 없이 렌더링된다. 그래야 번역자마다 문제를 다시 발견하지 않고 패리티 하네스가 정규화한다.
5. **(8행)** S2에 추가: 타입을 키로 쓰는 Python 디스패치 dict(`{type: fn}`)는 `_py_type` 태그(`'str' | 'bool' | 'int' | 'float' | 'list'`)와 클래스 생성자 참조를 키로 쓰는 `Map<string|Function, fn>`으로 옮긴다. `_py_type`은 명세가 있는 공유 헬퍼가 된다. 테이블을 바꾸는 하위 클래스 계약(numpy, CommentValue)이 이것에 기댄다.
6. **(11행)** 간극 목록의 `isTable` 제외 목록 표현을 긍정 정의로 바꾼다: `Object.getPrototypeOf(v) === Object.prototype || proto === null`. `isinstance(x, dict)`를 충실히 옮긴 모습이다. 소속 모듈을 정한다(A의 SILENCE #2: 의미는 명세했지만 위치는 명세하지 않았다).
7. **(12행)** None→null 행 확장: `dump_value`/`dump_inline_table`에 닿은 `null`은 Python의 `"None"` 대신 `"null"`로 렌더링된다. 허용하며 패리티에서 정규화한다고 밝힌다. 인라인 테이블 안의 null 항목은 출력해야 하고 절대 건너뛰지 않는다.
8. **(13행)** S2에 예외 행 추가: encoder 쪽 `ValueError`/`TypeError`는 메시지가 바이트 단위로 같은 `Error`/`TypeError`로 옮긴다. 메시지는 패리티 표면의 일부다. (A는 이것을 두 번 즉석에서 만들었고(SILENCE #6/#8) B와 맞은 것은 운이었다.)
9. **(8, 14행 + SILENCE #1, #9)** 대응 타입이 없는 경우의 범위 행 추가: Decimal, numpy 스칼라, pathlib마다 명시적 처리를 정한다(shim 클래스는 보존하고 버리거나, 타입이 있는 확장 지점으로 둔다). A의 SILENCE 9개 중 3개가 이 빠진 행 하나에서 나왔다.
10. **(1행)** A의 `_repr`을 테스트 벡터가 있는 공유 헬퍼(`%r` 에뮬레이션)로 정식화한다. 따옴표 선택 규칙 + 이스케이프 표를 두고, 이 보고서에서 확인한 제어 문자 벡터를 fixture 세트로 쓴다. 그래야 팬아웃 파일들이 CPython repr 의미론을 각자 다시 유도하지 않는다.
