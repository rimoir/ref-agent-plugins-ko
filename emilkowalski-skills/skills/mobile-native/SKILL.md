---
name: mobile-native
description: 웹 앱이 휴대폰에서 네이티브 앱처럼 느껴지게 만든다. "브라우저 안의 웹사이트"와 설치된 앱처럼 느껴지는 것을 가르는 작은 CSS와 메타 태그 수정이 대상이다. 탭한 뒤 남는 hover 상태, 탭 하이라이트 깜빡임, 100vh 버그, 페이지를 확대하는 입력 필드, 반응이 늦은 탭, 스크롤을 가로채는 당겨서 새로 고침, 노치 아래의 콘텐츠, 길게 누르면 선택되는 버튼 글자, 엉뚱한 방향으로 스크롤되는 캐러셀, 맞지 않는 상태 표시줄, 실제 기기에서 테스트한다는 규칙까지 다룬다. 웹 앱을 모바일용으로 만들거나 모바일에서 리뷰할 때, "works in Chrome but feels wrong on my phone"(Chrome에선 되는데 폰에서는 느낌이 이상해) 같은 일이 생길 때, PWA, 바텀 시트, 캐러셀, 전체 화면 레이아웃, 터치 상호작용을 만들 때 쓴다. 모션 자체에는 animate를, React Native에는 animate-expo를 쓴다.
---

# 모바일에서 네이티브처럼 느껴지게 하기

## 첫 응답

구체적인 질문 없이 이 스킬이 처음 호출되면 다음 내용으로만 답한다.

> 웹 앱이 모바일에서 네이티브 앱처럼 느껴지게 만들 준비가 됐습니다. Emil Kowalski의 디자인 엔지니어링 철학을 바탕으로 합니다.

사용자가 질문하기 전에는 다른 정보를 주지 않는다.

고치는 스킬이다. 하는 일은 **하나**다. 휴대폰에서 웹사이트처럼 느껴지는 웹 앱을 받아, 웹사이트라는 정체를 드러내는 티를 하나씩 없앤다. 모션 설계(`animate`가 맡는다), 모션 리뷰(`review-animations`가 맡는다), React Native용 개발(`animate-expo`가 맡는다)은 하지 않는다. 여기 규칙은 플랫폼 계층(뷰포트, 터치, 스크롤, 안전 영역, 브라우저 UI)을 다룬다. 이 계층에서는 코드 몇 줄로 앱이 설치된 것처럼 느껴질지, 브라우저 안에 끼워 넣은 것처럼 느껴질지가 갈린다.

## 작업 태도

드로어, 시트, 제스처로 움직이는 UI를 실제 휴대폰에 내보냈고 아래 항목 하나하나에 데어 본 시니어 디자인 엔지니어로 일한다. 기기 툴바를 켠 데스크톱 브라우저가 휴대폰이 아니라는 것을 안다. "모바일에서 앱이 버벅인다"는 보고 대부분이 애니메이션 문제가 아니라는 것도 안다. 대개는 300ms 탭 지연, 탭할 때 번쩍이는 회색, 풀리지 않는 hover 상태다.

기준은 사용자의 휴대폰이다. 실제 기기에서 돌려 볼 수 없으면, 아래 수정 중 어느 것을 코드로 확인할 수 있고 어느 것에 실제 기기가 필요한지 말한다.

실패 유형은 두 가지이고, 첫 번째가 더 나쁘다.

1. **데스크톱이 보여 주는 것만 고친다.** 이 스킬이 다루는 버그는 Chrome 기기 에뮬레이션에서 재현되지 않는다. 거기서만 테스트하면 버그를 전부 그대로 내보낸다.
2. **CSS나 메타 태그로 되는 일에 JavaScript를 꺼낸다.** 여기 나오는 항목은 거의 다 선언 한 줄이다. hover 상태를 숨기려고 `useIsTouchDevice()` 훅을 쓰는 것은 잘못된 도구다. 맞는 도구는 미디어 쿼리다.

## 철칙

1. **모든 수정에는 이유를 붙여 내보낸다.** 아래 규칙에는 저마다 *이유*가 있다. 습관처럼 전역에 적용하지 말고 그 이유가 들어맞는 곳에 적용한다. 본문 텍스트에 `user-select: none`을 주면 결함이고 버튼에 주면 맞다.
2. **기기 스니핑보다 미디어 쿼리.** 플랫폼은 `(hover: hover)`, `(pointer: fine)`, `env()`, `dvh`로 자기가 무엇을 할 수 있는지 알려 준다. 터치 여부를 짐작하려고 user agent 문자열이나 화면 너비로 절대 분기하지 않는다.
3. **터치와 마우스는 배타적이지 않다.** 트랙패드를 단 iPad, 터치스크린 노트북, 마우스를 연결한 휴대폰이 있다. 둘을 한꺼번에 고려해 쓴다. 기기가 아니라 기능으로 제한한다.
4. **확대를 절대 막지 않는다.** `user-scalable=no`와 `maximum-scale=1`은 접근성 실패다. 대신 확대를 일으킨 진짜 원인인 입력 필드 글꼴 크기를 고친다.
5. **끝났다고 하기 전에 실제 기기에서 테스트한다.** 휴대폰을 연결하고 IP로 개발 서버를 연 뒤 Safari의 Web Inspector나 Chrome 원격 디버깅을 쓴다. 에뮬레이션은 풀리지 않는 hover, 탭 지연, 러버밴딩(rubber-banding), 안전 영역, 키보드를 재현하지 못한다.

## 증상 표

여기서 시작한다. 사용자가 보는 증상을 표에서 찾은 뒤, 해당 절에서 이유와 정확한 코드를 읽는다.

| 문제 | 해결 |
| --- | --- |
| 탭한 뒤 남는 hover 상태 | `@media (hover: hover) and (pointer: fine)`로 감싸기 |
| 탭할 때 번쩍이는 회색/파란색 | `-webkit-tap-highlight-color` 없애기 |
| 틀린 레이아웃 높이 | `100dvh`(앱) 또는 `100svh`(히어로) |
| 입력 필드로 확대되는 페이지 | 입력 필드 글꼴 크기 최소 16px |
| 반응이 늦은 탭 | pointer-down 시점의 피드백 + `touch-action: manipulation` |
| 스크롤을 가로채는 당겨서 새로 고침 | `html, body`에 `overscroll-behavior: none` |
| 노치 앞에서 멈추는 콘텐츠 | `viewport-fit=cover` + `env(safe-area-inset-*)` |
| 길게 누르면 선택되는 버튼 글자 | `user-select: none` 추가 |
| 세로로 스크롤되는 캐러셀 | 제스처 영역에 `touch-action: pan-y` |
| 맞지 않는 상태 표시줄 색 | 색 구성표마다 `theme-color` |
| Chrome에서는 맞고 휴대폰에서는 어긋남 | 실제 기기에서 테스트 |

## 수정 방법

### 1. 탭한 뒤 남는 hover 상태

터치에는 hover가 없어서 브라우저가 흉내를 낸다. 요소를 처음 탭하면 `:hover`가 적용되고 사용자가 다른 곳을 탭할 때까지 그대로 남는다. hover 때 커지는 버튼은 탭한 뒤에도 커진 채로 있다. 모든 hover 스타일은 기능 쿼리로 제한한다.

```css
@media (hover: hover) and (pointer: fine) {
  .button:hover {
    background: var(--gray-3);
    transform: scale(1.02);
  }
}
```

두 조건 모두 중요하다. `(hover: hover)`는 주 입력 장치가 hover할 수 있다는 뜻이다. `(pointer: fine)`은 마우스처럼 정밀하다는 뜻이다. 이 조건이 스타일러스를 걸러 내고, hover를 지원한다고 주장하는 드문 Android 기기도 걸러 낸다. Tailwind v4에서는 `hover:` 변형이 이미 `@media (hover: hover)`로 컴파일된다. v3에서는 `future.hoverOnlyWhenSupported`를 설정한다.

터치 사용자에게도 누름 피드백은 필요하다. 모든 입력 방식에서 동작하는 `:active`로 준다(§5 참고).

### 2. 탭할 때 번쩍이는 회색/파란색

iOS Safari와 Android Chrome은 클릭 핸들러가 있는 요소를 탭하면 그 위에 반투명한 하이라이트를 칠한다. "이건 웹사이트다"라고 가장 크게 외치는 신호이고 직접 설계한 누름 피드백과 충돌한다.

```css
html {
  -webkit-tap-highlight-color: transparent;
}
```

전역에 한 번만 설정한다. 그런 다음 탭할 수 있는 모든 요소에 자체 `:active` 상태가 있는지 확인한다. 브라우저가 주던 유일한 피드백을 방금 없앴기 때문이다.

### 3. 틀린 레이아웃 높이

모바일에서 `100vh`는 *가장 큰* 뷰포트, 즉 브라우저 UI가 접혔을 때의 높이다. 페이지를 불러올 때는 주소창이 보이므로 `100vh` 요소는 주소창 높이만큼 넘치고 아래쪽에 고정한 버튼은 주소창에 가려진다. 대신 동적 단위와 작은 단위를 쓴다.

```css
/* 앱 셸, 드로어 등 브라우저 UI가 나타나고 사라질 때 보이는 영역을 따라가야 하는 모든 것 */
.app { height: 100dvh; }

/* 히어로와 첫 화면. 뷰포트의 가장 작은 크기라서 어떤 것도 잘리지 않는다 */
.hero { min-height: 100svh; }
```

`dvh`는 주소창이 접히면서 크기가 바뀐다. 앱 셸에는 맞지만 마케팅 콘텐츠에서는 스크롤 도중 레이아웃이 밀린다. `svh`는 안정적이고 절대 넘치지 않아서 히어로에 맞다. `lvh`는 예전 `vh`와 같다. 쓸 일이 거의 없다. 오래된 브라우저용 `100vh` 대체 줄은 프로젝트의 지원 범위가 요구할 때만 위에 둔다.

### 4. 입력 필드로 확대되는 페이지

iOS Safari는 글꼴 크기가 16px 미만인 입력 필드에 포커스가 가면 페이지를 확대하고 포커스가 빠져도 다시 축소하지 않는다. 사용자는 잘리고 옆으로 밀린 레이아웃을 보게 된다. 사람들이 `maximum-scale=1`을 꺼내는 이유가 이것이다. 하지만 잘못된 수정이다(철칙 4).

```css
input, textarea, select {
  font-size: 16px; /* 최솟값, 기본 루트 크기에서 1rem */
}
```

디자인상 데스크톱 입력 필드에 더 작은 글자가 필요하면, 필요한 곳에서만 키운다.

```css
@media (pointer: coarse) {
  input, textarea, select { font-size: 16px; }
}
```

입력 필드를 손보는 김에 키보드도 맞춘다. 인증 코드에는 `inputmode="numeric"`, 금액에는 `inputmode="decimal"`, 이메일 필드와 전화번호 필드에는 각각 `type="email"`과 `type="tel"`, 사용자 이름과 인증 코드에는 `autocapitalize="none"`과 `autocorrect="off"`를 쓴다. 리턴 키가 하는 일을 보여 주도록 `enterkeyhint="send"` / `"search"` / `"done"`도 쓴다.

### 5. 반응이 늦은 탭

서로 다른 두 원인이 겹친다.

**300ms 클릭 지연.** 두 번 탭하면 확대되므로, 브라우저는 탭한 뒤 두 번째 탭이 오는지 기다린다. 최신 브라우저는 뷰포트가 `width=device-width`로 설정되어 있으면 기다리지 않지만 모든 경우는 아니다(iOS Safari는 일부 요소에서 아직 지연한다). `touch-action: manipulation`은 이 요소가 두 번 탭으로 확대되는 일이 없다고 브라우저에 알려서 `click`이 바로 발생하게 한다.

```css
button, a, [role="button"], .tappable {
  touch-action: manipulation;
}
```

**누를 때가 아니라 뗄 때 오는 피드백.** 네이티브 버튼은 손가락이 닿는 순간 반응한다. `click`에서만 바뀌는 웹 버튼은 손가락이 *떨어질 때* 반응하므로, 0ms여도 지연으로 느껴진다. `:active`에 스타일을 주고 JavaScript가 필요하면 `click`이 아니라 `pointerdown`에 리스너를 단다.

```css
.button {
  transition: transform 100ms var(--ease-out), background 100ms;
}
.button:active {
  transform: scale(0.97);
  background: var(--gray-4);
}
```

누름 피드백은 100–160ms와 `ease-out`으로 유지한다. 코드베이스가 `animate` 스킬의 토큰을 쓰고 있으면 그 토큰을 쓴다. 새 곡선을 따로 만들지 않는다.

### 6. 스크롤을 가로채는 당겨서 새로 고침

페이지 맨 위를 넘어 스크롤하면 Android Chrome에서는 당겨서 새로 고침이, iOS에서는 페이지 전체 러버밴딩이 일어난다. 문서라면 괜찮다. 자체 스크롤 컨테이너가 있는 앱, 사용자가 아래로 끌어내리는 드로어, 캔버스라면 잘못된 동작이다.

```css
html, body {
  overscroll-behavior: none;
}
```

그런 다음 안쪽의 스크롤 영역(시트 내용, 채팅 목록, 사이드바)마다 끝에 닿았을 때 스크롤이 페이지로 이어지지 않게 막는다.

```css
.sheet-content {
  overflow-y: auto;
  overscroll-behavior: contain;
}
```

`contain`은 컨테이너 자체의 바운스(네이티브처럼 느껴진다)는 남기고 뒤의 페이지가 움직이지 않게 한다. 루트에는 `none`, 자식에는 `contain`을 쓴다. 이 목적으로 `touchmove` + `preventDefault()` 리스너를 절대 쓰지 않는다. 스크롤을 완전히 막고 리스너를 passive가 아니게 만들어 프레임을 놓친다.

### 7. 노치 앞에서 멈추는 콘텐츠

브라우저는 기본적으로 페이지를 안전 영역 안에 레터박스로 넣는다. 그래서 노치, Dynamic Island, 홈 인디케이터 영역은 body의 배경색으로 남는다. 네이티브 앱은 화면 가장자리까지 칠하고 *콘텐츠*만 그 영역에서 떨어지게 여백을 준다. 두 단계로 한다.

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

```css
.app-header {
  padding-top: env(safe-area-inset-top);
}
.bottom-bar {
  padding-bottom: env(safe-area-inset-bottom);
}
.sheet {
  padding-bottom: calc(1rem + env(safe-area-inset-bottom));
}
```

`viewport-fit=cover`는 페이지를 노치 아래까지 펼친다. `env(safe-area-inset-*)`는 다시 안쪽으로 여백을 줄 인셋 값을 알려 준다. 메타 태그가 없으면 `env()` 값은 모두 `0px`이다. 이 처리가 필요한 요소는 고정 헤더, 하단 탭 바, 토스트, 시트다. 일반 페이지 콘텐츠는 보통 헤더의 패딩 덕분에 따로 할 일이 없다. 값을 calc 안에서 쓸 때는 `env()`에 대체값(`env(safe-area-inset-bottom, 0px)`)을 준다.

### 8. 길게 누르면 선택되는 버튼 글자

웹 버튼에 손가락을 대고 있으면 iOS가 버튼 글자를 선택하거나 링크라면 복사/공유 콜아웃을 띄운다. 네이티브 컨트롤은 절대 그러지 않는다. *컨트롤*인 텍스트는 선택되면 안 된다. *콘텐츠*인 텍스트는 반드시 선택할 수 있어야 한다.

```css
button, [role="button"], .tab, .chip, .drag-handle {
  user-select: none;
  -webkit-user-select: none;   /* Safari는 아직 접두사가 필요하다 */
  -webkit-touch-callout: none; /* 컨트롤로 쓰는 링크/이미지에는 길게 누르기 콜아웃을 띄우지 않는다 */
}
```

`body`에 `user-select: none`을 절대 넣지 않는다. 사용자는 주소, 오류 메시지, 주문 번호를 복사한다. 그것은 콘텐츠다.

### 9. 세로로 스크롤되는 캐러셀

캐러셀 위의 가로 스와이프는 브라우저에게 모호하다. 페이지를 스크롤하는지 트랙을 스크롤하는지 몰라서 짐작하는데, 캐러셀이 움직이는 동안 페이지가 위로 들썩이는 쪽으로 짐작하는 일이 잦다. 요소가 어느 축을 맡는지 알려 준다.

```css
.carousel {
  touch-action: pan-y; /* 가로는 캐러셀이 처리하고, 세로는 브라우저가 맡는다 */
}
.drag-surface {
  touch-action: none;  /* 커스텀 제스처(끌어서 닫는 시트, 슬라이더)가 모든 축을 맡는다 */
}
.vertical-sheet-handle {
  touch-action: pan-x; /* 세로 드래그는 시트가 처리하고, 가로는 브라우저에 남긴다 */
}
```

이 값은 *브라우저*가 여전히 해도 되는 일을 가리킨다. 가로 캐러셀의 `pan-y`는 "브라우저야, 세로 이동은 네가 맡아. 가로는 내가 처리할게"라는 뜻이다. `none`은 요소가 모든 것을 처리한다는 뜻이다. 정말 그런 요소에만 쓴다. 그렇지 않으면 사용자가 그 요소를 지나 스크롤할 수 없다.

캐러셀이 JS 제스처가 아니라 네이티브 스크롤이라면 트랙에 `scroll-snap-type: x mandatory`, 슬라이드에 `scroll-snap-align: start`를 쓰는 편이 낫다. 브라우저 자체의 물리가 손으로 짠 스프링보다 뛰어나고 `touch-action`도 필요 없어진다.

### 10. 맞지 않는 상태 표시줄 색

상태 표시줄과 브라우저 UI는 `theme-color`에서 색을 가져온다. 값이 하나뿐이면 라이트 모드에 어두운 막대가 생기거나 다크 모드에 흰 막대가 생긴다. 구성표마다 따로 값을 준다.

```html
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" />
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0a0a0a" />
<meta name="color-scheme" content="light dark" />
```

값은 페이지 맨 위의 색에 맞춘다. 브랜드 색이 아니라 헤더 배경색이다. Next.js에서는 `viewport` export(`themeColor: [{ media, color }]`)로 설정한다. 앱이 OS 설정이 아니라 클래스로 테마를 바꾼다면, 토글할 때 JavaScript로 태그를 갱신한다. 설치된 PWA라면 `apple-mobile-web-app-status-bar-style`과 매니페스트의 `theme_color`/`background_color`도 같은 결정이다.

### 11. Chrome에서는 맞고 휴대폰에서는 어긋남

위 내용은 어느 것도 기기 에뮬레이션에서 재현되지 않는다. 풀리지 않는 hover, 탭 하이라이트, 주소창이 `vh`에 주는 영향, 입력 필드 확대, 클릭 지연, 오버스크롤, 안전 영역, 소프트웨어 키보드는 모두 실제 기기에서만 나오는 동작이다.

- 휴대폰을 USB로 연결하고 개발 서버를 `0.0.0.0`에서 돌린 뒤 컴퓨터의 LAN IP로 연다.
- iOS: Safari → Develop → 해당 기기. Android: `chrome://inspect`.
- 책상 위의 최신 휴대폰 말고 몇 년 된 휴대폰으로 테스트한다. 키보드를 연 상태로 테스트한다. 가로 모드로도 한 번 테스트한다.
- 설치형 PWA가 대상이면 설치한 상태로도 테스트한다. standalone 모드에서는 뷰포트, 안전 영역, 상태 표시줄 동작이 달라진다.

Xcode Simulator는 에뮬레이션보다 한 단계 낫지만 여전히 터치 느낌은 놓친다. 기준은 실제 기기다.

## 기본 설정

모바일 사용자를 대상으로 하는 앱을 시작할 때 이것이 최소한이다. 첫 컴포넌트보다 먼저 내보낸다.

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content" />
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" />
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0a0a0a" />
```

```css
html {
  -webkit-tap-highlight-color: transparent;
  -webkit-text-size-adjust: 100%; /* 가로 모드에서 글꼴 확대 없음 */
  overscroll-behavior: none;
}

input, textarea, select {
  font-size: 16px;
}

button, a, [role="button"] {
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
}

@media (hover: hover) and (pointer: fine) {
  /* 모든 :hover 규칙은 여기에 둔다 */
}
```

`interactive-widget=resizes-content`를 주면 Android Chrome에서 소프트웨어 키보드가 레이아웃 뷰포트를 줄인다. 그래서 `100dvh`와 아래에 고정한 입력 필드가 iOS에서처럼 키보드에 반응한다. 앱이 당겨서 새로 고침을 반기는 스크롤 문서라면 `html`에서 `overscroll-behavior: none`을 뺀다.

## 절대 내보내지 말 것

끝내기 전에 스스로 확인한다.

| 금지 | 대신 |
| --- | --- |
| `user-scalable=no` 또는 `maximum-scale=1` | 16px 입력 필드로 원인 해결 |
| 제한하지 않은 `:hover` | `@media (hover: hover) and (pointer: fine)` |
| 앱 셸이나 아래에 고정한 UI에 `100vh` | `100dvh` |
| 마케팅 히어로에 `100dvh` | `100svh`(스크롤할 때 레이아웃 밀림 없음) |
| `click`에만 거는 누름 피드백 | `:active` / `pointerdown` |
| 오버스크롤을 막으려는 `touchmove` + `preventDefault()` | `overscroll-behavior` |
| `body`에 `user-select: none` | 컨트롤에만 |
| 사용자가 지나 스크롤해야 하는 요소에 `touch-action: none` | `pan-x` / `pan-y` |
| `viewport-fit=cover` 없이 쓰는 `env(safe-area-inset-*)` | 메타 태그 추가(없으면 값이 `0`) |
| 두 구성표에 `theme-color` 하나 | `prefers-color-scheme`마다 하나 |
| 터치를 감지하려는 user agent 스니핑 | `(hover)` / `(pointer)` 미디어 쿼리 |
| 기기 에뮬레이션만 보고 고쳤다고 선언 | 실제 기기 |

## 출력

수정을 적용한다. 그다음 많아야 몇 줄로 다음을 적는다.

- **무엇이 잘못됐나**: 표에서 찾은 증상과 한 줄짜리 이유
- **무엇을 바꿨나**: 파일과 선언, 각각 한 줄
- **휴대폰이 필요한 것**: 코드로 확인할 수 있었던 수정과 사용자가 실제 기기에서 확인해야 하는 수정

이것을 보고서로 부풀리지 않는다. 산출물은 코드다.

## 어조

의견은 분명하게, 말은 짧게 한다. 여기 항목은 대부분 한 줄이다. 그 한 줄과 이유를 말하고 넘어간다. 솔직한 답이 "기기 없이는 이걸 확인할 수 없다"라면 고쳤다고 주장하지 말고 그렇게 말한다.
