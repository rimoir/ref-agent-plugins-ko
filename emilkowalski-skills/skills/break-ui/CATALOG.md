# 최악의 경우(worst case) 카탈로그

UI를 깨뜨리는 현실적인 값을 컴포넌트가 렌더링하는 값의 종류별로 묶었다. 1단계 표의 필드에 해당하는 행을 쓴다. 모든 값은 실제 사용자가 만들어 낼 수 있는 것이다. 옆 칸의 설명에는 그 값이 흔히 깨뜨리는 것을 적었다.

이메일과 URL에는 `example.com`, `example.org`, `.test` 도메인을 써서 픽스처가 실제 메일함이나 사이트를 가리키지 않게 한다.

---

## 사람과 이름

| 값 | 깨지는 것 |
| --- | --- |
| `Aleksandra Wiśniewska-Kowalczyk` | 길고 하이픈과 발음 구별 기호가 있음. 두 줄로 줄바꿈되고 하이픈이 줄바꿈 지점이 됨 |
| `Christopher Alexander Montgomery III` | 길고 접미사가 붙음. 첫 단어 + 마지막 단어로 만드는 단순한 이니셜은 `CI`가 됨 |
| `Konstantin Oberhauser-Wettstein` | 길고 복합 성씨임. 한 줄짜리 행에서 넘침 |
| `Jo` | 두 글자. 이름 열이 거의 비어 보임 |
| `J` | 한 글자. 이니셜도 한 글자이고 이름이 링크라면 클릭 영역이 아주 짧음 |
| `Ólafur Darri Ólafsson` | 악센트 붙은 대문자로 시작함. 대문자 변환/정렬 로직, 이니셜 `ÓÓ` |
| `Đặng Thị Ngọc Hân` | 베트남어 발음 구별 기호가 겹겹이 쌓임. 빡빡한 `line-height` + `overflow: hidden`에 잘림 |
| `王秀英` | CJK, 공백 없음. "first + last word" 이니셜 로직이 단어를 하나만 찾고 CJK는 아무 데서나 줄바꿈됨 |
| `نور الهدى عبد الرحمن` | RTL. `dir="auto"`가 없으면 문장부호와 아이콘이 반대쪽에 놓임 |
| `Seán O'Brien-Ó Súilleabháin` | 아포스트로피와 악센트. 이스케이프, 이니셜, 검색 |
| `María José de la Cruz y Fernández` | 소문자 연결어. 이니셜 `Md`나 `MF`, "성" 기준 정렬 |
| `dana` | 모두 소문자. 그래도 이니셜은 대문자여야 함 |
| `🦊 Fox` | 이모지로 시작함. `.charAt(0)`이 서로게이트 쌍의 절반(`�`)을 돌려줌 |
| `👩🏽‍💻 Priya` | ZWJ 이모지 시퀀스. `.length`가 7 이상이고 잘라 내면 조각조각 깨짐 |
| `  Sam   Lee ` | 앞뒤 공백과 연속 공백. 빈 단어로 만든 이니셜, 이상한 간격 |
| *(missing)* | 이름이 아예 없고 이메일만 있음. UI가 무언가로 대체해야 함 |

## 이메일, URL, 식별자

끊을 수 없는 문자열이다. 공백이 없어서 브라우저가 줄을 바꿀 자리가 없다.

| 값 | 깨지는 것 |
| --- | --- |
| `bartholomew.fitzgerald@northwind-industries-holdings.example.com` | 고전적인 사례. `overflow-wrap: anywhere`가 없으면 형제 요소를 모두 행 밖으로 밀어냄 |
| `a@b.test` | 현실적으로 가장 짧은 값. 긴 이메일을 가정한 레이아웃이 텅 비어 보임 |
| `first.last+billing-notifications@example.com` | 플러스 주소. `+`를 거부하는 검증, 의미 있는 부분을 말줄임하는 표시 |
| `ops@sub.department.region.example.test` | 하위 도메인이 많음. "도메인" 추출 로직 |
| `https://example.com/workspaces/acme/projects/q3-launch/docs/9f8e7d6c5b4a?tab=comments&filter=unresolved` | 긴 URL. 넘침, 그리고 끝 말줄임이 서로 다른 부분을 가림 |
| `9f8e7d6c-5b4a-4c3d-8e2f-1a0b9c8d7e6f` | UUID. 고정폭 글꼴 너비, 가운데 말줄임 후보 |
| `Q3 Board Deck — FINAL (revised) v12 [approved by legal].pdf` | 파일 이름. 끝 말줄임이 버전과 확장자를 가림, 경로 속 대괄호와 대시 |
| `IMG_20250914_183022_HDR_portrait_edited_edited.HEIC` | 카메라 파일 이름. 끊을 수 없음, 대문자 확장자 |
| `@a` / `@thisisaverylongusernamethatisallowed` | 핸들의 양 극단 |

## 데이터에서 오는 라벨, 제목, 문구

| 값 | 깨지는 것 |
| --- | --- |
| `Senior Product Design Engineer, Platform Infrastructure` | 긴 직함. 부차적인 자리에서 세 줄로 줄바꿈됨 |
| `Invitation expired 12 days ago` | 긴 상태 배지. 배지가 줄바꿈되거나 이름 열을 짓누름 |
| `Benachrichtigungseinstellungen` | 독일어 합성어(30자, 공백 없음). 라벨 넘침, 끊을 수 없음 |
| `Paramètres de confidentialité et de sécurité` | "Privacy & security"의 프랑스어 번역. 번역하면 UI 문구가 ~30% 길어짐 |
| Twelve tags on one item: `design`, `frontend`, `q3`, `urgent`, `needs-review`, … | 태그 행이 줄바꿈되며 벽처럼 쌓임. `+8` 같은 넘침 표시가 필요함 |
| A tag named `customer-feedback-from-enterprise-onboarding` | 컨테이너보다 넓은 태그 하나 |
| `Untitled` / empty string / `   ` | 제목 없음. 무너진 헤딩, 높이 0인 행 |
| `<script>alert(1)</script>` / `&amp;` / `**bold**` | 이스케이프. 문자 그대로 렌더링돼야 함 |
| `Line one` + newline + `Line two` | 한 줄 필드 속 줄바꿈 문자. 행 높이가 두 배가 되거나 아무 표시 없이 버려짐 |
| A 2,000-character pasted description | 줄 수 제한, "show more", textarea 늘어남 |

## 숫자와 금액

| 값 | 깨지는 것 |
| --- | --- |
| `0` | 0일 때의 상태: "0 members", 빈 진행 막대, 퍼센트 계산의 0 나누기 |
| `1` | 복수형: "1 members", "1 days ago" |
| `1284` | 천 단위 구분 기호가 필요함: `1,284` |
| `1000000` | 개수 배지의 너비. 정밀도가 중요하지 않은 곳에서는 `1M` 같은 축약형을 씀 |
| `12345678.9` as currency | `$12,345,678.90`. 합계 열을 넘침 |
| `-42.5` | 음수 부호, 빨간색 표시 로직, 회계 형식의 괄호 |
| `0.1 + 0.2` | `0.30000000000000004`가 그대로 렌더링됨 |
| `142%` / `-3%` | 범위를 넘어선 진행 막대와 미터 |
| `null` / `undefined` / `NaN` | 글자 그대로 렌더링됨 |
| `1.284` in `de-DE` vs `1,284` in `en-US` | 로캘 형식. 하드코딩한 구분 기호는 세계의 절반에서 틀림 |
| A value that changes live (`99` → `100`) | `tabular-nums`가 없으면 너비가 튀고 흔들림 |

## 컬렉션

| 값 | 깨지는 것 |
| --- | --- |
| 0 items | 빈 상태, 그리고 빈 상태가 있기는 한지 |
| 1 item | 카드 하나만 있으면 깨져 보이는 그리드. "1 of 1" |
| Exactly page size, and page size + 1 | "Showing 40 of 40"의 off-by-one 오류, 빈 2페이지를 보여 주는 페이지 나누기 |
| 1,000+ items, unpaginated | 스크롤 성능, 렌더링 시간, 메모리. "Showing 40 of 1,284" 문구도 |
| One item 10× the size of the others | 가장 큰 항목에 맞춰 늘어나는 메이슨리와 그리드 행 |
| Items with identical names | 이름이 유일한 구분 필드인 목록 |

## 시간

| 값 | 깨지는 것 |
| --- | --- |
| Now | "just now" 대신 "0 seconds ago"가 나옴 |
| 12 days ago, 11 months ago, 3 years ago | 상대 시간 임곗값. 7일이 지나면 절대 날짜로 바꿈 |
| A future date | "in 3 days" 대 "-3 days ago" |
| `1970-01-01` | 0 타임스탬프가 실제 날짜처럼 보임 |
| `2025-12-31T23:30:00-08:00` | UTC와 사용자 시간대에서 서로 다른 날로 보임 |
| Very long duration (`1,284 hours`) | 일 단위로 올려 표시하지 않는 기간 형식 |

손으로 조립한 문자열 말고 `Intl.RelativeTimeFormat`과 `Intl.DateTimeFormat`을 쓴다.

## 이미지와 미디어

| 값 | 깨지는 것 |
| --- | --- |
| Avatar URL that 404s | 이니셜 대체 대신 깨진 이미지 아이콘 |
| No avatar at all | 대체 표시 자체: 이니셜, 색, 실제 아바타와 같은 크기 |
| 4000×200 panorama as avatar or cover | `object-fit: cover`가 없으면 일그러짐 |
| 200×4000 tall image | 같은 문제, 다른 축. 카드 높이를 터뜨릴 수도 있음 |
| Transparent PNG logo, dark logo on dark mode | 배경에 묻혀 안 보임 |
| Slow-loading image | 고정 크기나 `aspect-ratio`가 없으면 레이아웃이 밀림 |

## 상태

| 값 | 깨지는 것 |
| --- | --- |
| Loading | 최종 레이아웃과 맞지 않는 스켈레톤, 콘텐츠를 밀어내는 스피너 |
| Error from the API | 오류 상태가 없거나 가공하지 않은 오류 메시지(`TypeError: Cannot read properties of undefined`)가 그대로 보임 |
| Partial data | 같은 목록 안에서 어떤 선택 필드는 채워져 있고 어떤 것은 비어 있음. 행이 어긋남 |
| Every status at once | 모든 enum 값이 한 목록에 있음(`active`, `invited`, `expired`, `suspended`). 배지 너비가 제각각 |
| No permission | 비활성화된 동작. 그래도 행의 레이아웃이 같은가? |
| The current user in the list | "You" 라벨, 자기 자신에게는 적용되면 안 되는 동작 |

## 환경

데이터는 아니지만 같은 방식으로 확인한다. 최악의 경우로 바꾼 뒤 아래 조건을 바꾼다.

| 조건 | 깨지는 것 |
| --- | --- |
| Container at 320px | 위의 모든 넘침이 한꺼번에 |
| Narrow sidebar placement | 전체 너비로 디자인한 컴포넌트를 280px 열에 재사용 |
| 2560px wide | 읽기에 너무 긴 줄, 한쪽에 고립된 콘텐츠 |
| Browser zoom 200% / large text setting | 커지는 텍스트를 잘라 내는 고정 높이 |
| Dark mode | 하드코딩된 색, 보이지 않는 테두리와 로고 |
| `dir="rtl"` | 아이콘, 셰브론, 패딩, 행 끝 동작의 순서 |
| Touch device | hover에만 나타나는 동작(hover 때 나타나는 •••)에 닿을 수 없음 |
