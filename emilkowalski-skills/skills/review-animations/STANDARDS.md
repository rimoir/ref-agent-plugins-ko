# 애니메이션 기준 참고 자료

리뷰의 바탕이 되는 정확한 값, 곡선, 규칙이다. 발견 항목에는 대충 짐작하지 말고 이 값을 인용한다. Emil Kowalski의 디자인 엔지니어링 철학에서 추렸다.

## 애니메이션을 넣어야 하나?(빈도 표)

| 빈도 | 결정 |
| --- | --- |
| 하루 100회 이상(키보드 단축키, 명령 팔레트 토글) | 애니메이션 없음. 절대로. |
| 하루 수십 회(hover 효과, 목록 탐색) | 없애거나 크게 줄임 |
| 가끔(모달, 드로어, 토스트) | 표준 애니메이션 |
| 드묾 / 처음(온보딩, 피드백, 축하) | 즐거움을 더해도 됨 |

**키보드로 시작하는 동작에는 절대 애니메이션을 넣지 않는다**: 하루에 수백 번 반복되는 동작이라 애니메이션을 넣으면 느리고 따로 노는 느낌이 든다. (Raycast에는 열기/닫기 애니메이션이 없다. 하루에 수백 번 쓰는 것에 맞는 선택이다.)

모션의 타당한 목적은 공간적 일관성(spatial consistency), 상태 표시(state indication), 설명(explanation), 피드백(feedback), 거슬리는 변화 막기(preventing jarring change)다. 자주 보이는 요소에서 "멋져 보인다"는 타당한 이유가 아니다.

## 이징

결정 순서는 다음과 같다.
- 등장이나 퇴장 → **`ease-out`**(빠르게 시작해 반응이 빠르게 느껴진다)
- 화면 안에서 이동 / 모핑 → **`ease-in-out`**
- hover / 색 변화 → **`ease`**
- 일정한 모션(마키, 진행 표시) → **`linear`**
- 기본 → **`ease-out`**

**UI에는 절대 `ease-in`을 쓰지 않는다.** 느리게 시작하므로 사용자가 지켜보는 바로 그 순간을 늦춘다. 200ms의 `ease-out`은 200ms의 `ease-in`보다 더 빠르게 *느껴진다*.

CSS 기본 이징은 너무 약하다. 강한 커스텀 곡선을 쓴다.

```css
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);        /* UI용 강한 ease-out */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);    /* 화면 안 이동용 강한 ease-in-out */
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);     /* iOS 같은 드로어 곡선 (Ionic) */
```

곡선은 [easing.dev](https://easing.dev/)나 [easings.co](https://easings.co/)에서 찾는다. 처음부터 손으로 만들지 않는다.

## 지속 시간

| 요소 | 지속 시간 |
| --- | --- |
| 버튼 누름 피드백 | 100–160ms |
| 툴팁, 작은 팝오버 | 125–200ms |
| 드롭다운, 셀렉트 | 150–250ms |
| 모달, 드로어 | 200–500ms |
| 마케팅 / 설명용 | 더 길어도 됨 |

**규칙: UI 애니메이션은 300ms 미만으로 한다. 모달, 드로어, 시트, 토스트는 문서화된 예외다**(모달과 드로어는 500ms까지, 토스트는 Sonner의 400ms `ease`를 쓴다. "통일성" 참고). 180ms 드롭다운이 400ms 드롭다운보다 반응이 빠르게 느껴진다. 스피너가 빠르면 로딩도 빠르게 느껴진다(실제 시간은 같다). 첫 툴팁 뒤로 툴팁을 즉시 띄우면(지연과 애니메이션 생략) 툴바가 더 빠르게 느껴진다.

## 물리감

- **절대 `scale(0)`을 쓰지 않는다.** `scale(0.9–0.97)` + `opacity: 0`에서 시작한다. 현실에서 아무것도 없는 데서 나타나는 것은 없다.
- **원점을 트리거에 맞춘 팝오버.** 가운데가 아니라 트리거에서 커지게 한다.
  ```css
  .popover { transform-origin: var(--transform-origin); } /* Base UI */
  ```
  **모달은 예외다**: 뷰포트 가운데에 나타나므로 `transform-origin: center`를 그대로 둔다.
- **버튼 누름 피드백.** `:active`에서 `transform: scale(0.97)`을 주고 `transition: transform 160ms var(--ease-out)`을 쓴다. 값은 은은하게 둔다(0.95–0.98). 누를 수 있는 모든 요소에 적용한다.

## 스프링

물리를 흉내 내므로 자연스럽게 느껴진다. 정해진 지속 시간이 없고 매개변수에 따라 자리를 잡는다. 관성이 있는 드래그, "살아 있는" 요소(Dynamic Island), 중단 가능한(interruptible) 제스처, 장식용 마우스 추적에 쓴다.

```js
// Apple 방식(이해하기 더 쉽다), 권장
{ type: "spring", duration: 0.5, bounce: 0.2 }

// 전통적인 물리 방식(더 세밀하게 조절한다)
{ type: "spring", mass: 1, stiffness: 100, damping: 10 }
```

바운스는 은은하게 둔다(0.1–0.3). 대부분의 UI에서는 바운스를 피하고 끌어서 닫기와 발랄한 상호작용에만 쓴다. 스프링은 중단돼도 속도를 유지하므로(키프레임은 0부터 다시 시작한다) 사용자가 도중에 방향을 되돌릴 수 있는 제스처에 딱 맞는다.

마우스 상호작용에서는 값을 마우스 위치에 바로 묶지 말고 `useSpring`으로 보간한다(바로 묶으면 인위적이고 관성이 없다). 모션이 장식일 때만 이렇게 한다.

## 중단 가능성

CSS **트랜지션**은 애니메이션 도중에 중단하고 목표를 다시 잡을 수 있다. **키프레임**은 0부터 다시 시작한다. 빠르게 연달아 실행되는 것(추가되는 토스트, 토글)에는 트랜지션이 더 매끄럽다.

```css
/* 중단 가능, 동적인 UI에 좋다 */
.toast { transition: transform 400ms ease; }

/* 중단 불가, 동적인 UI에는 피한다 */
@keyframes slideIn { from { transform: translateY(100%); } to { transform: translateY(0); } }
```

JS 없이 등장을 만들 때는 `@starting-style`을 쓴다.

```css
.toast {
  opacity: 1; transform: translateY(0);
  transition: opacity 400ms ease, transform 400ms ease;
  @starting-style { opacity: 0; transform: translateY(100%); }
}
```

예전 환경용 대체 방식은 `useEffect(() => setMounted(true), [])` + `data-mounted` 속성이다.

## 비대칭 타이밍

사용자가 결정하는 곳에서는 느리게, 시스템이 응답하는 곳에서는 빠르게 한다.

```css
.overlay { transition: clip-path 200ms var(--ease-out); }            /* 뗄 때: 빠르게 */
.button:active .overlay { transition: clip-path 2s linear; }  /* 누를 때: 느리고 신중하게 */
```

## 성능

- **`transform`과 `opacity`를 우선한다**: 레이아웃과 페인트를 건너뛰고 GPU에서 돈다. `clip-path`와 측정한 높이(아코디언)는 문서화된 예외다. `padding`/`margin`/`height`/`width`/`top`/`left`는 렌더링 세 단계를 모두 일으킨다.
- **부모의 CSS 변수로 자식의 transform을 움직이지 않는다**: 모든 자식의 스타일을 다시 계산하게 된다. 요소에 `transform`을 바로 설정한다.
  ```js
  element.style.setProperty('--swipe-amount', `${d}px`); // 나쁨: 모든 자식을 재계산
  element.style.transform = `translateY(${d}px)`;        // 좋음: 이 요소만
  ```
- **Motion 단축 속성은 `motion` 14.2부터 하드웨어 가속된다.** 14.2 이전에는 `x`/`y`/`scale`이 rAF로 메인 스레드에서 돌고 부하가 걸리면 프레임을 놓친다. 그런 버전에서는 버전을 올리거나 transform 문자열 전체를 쓴다. 레이아웃 애니메이션(`layout`, `layoutId`)은 어느 버전에서든 메인 스레드에서 돈다.
  ```jsx
  <motion.div animate={{ x: 100 }} />                          // motion 14.2+: 하드웨어 가속된다
  <motion.div animate={{ transform: "translateX(100px)" }} />  // 모든 버전에서 하드웨어 가속된다
  ```
- **부하가 걸리면 CSS 애니메이션이 JS보다 낫다**: 메인 스레드 밖에서 돌기 때문이다. rAF 기반 애니메이션은 브라우저가 로딩, 스크립트 실행, 페인트를 하는 동안 끊긴다. 미리 정해진 모션에는 CSS를, 동적이거나 중단 가능한 모션에는 JS를 쓴다.
- **WAAPI**는 CSS 수준의 성능을 내면서 JS로 제어하게 해 준다(하드웨어 가속, 중단 가능, 라이브러리 없음).
  ```js
  element.animate([{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0 0)' }],
    { duration: 1000, fill: 'forwards', easing: 'cubic-bezier(0.77, 0, 0.175, 1)' });
  ```

## 변형과 clip-path

- **`translate`의 퍼센트 값**은 요소 자신의 크기를 기준으로 한다. `translateY(100%)`는 크기와 상관없이 요소의 높이만큼 움직인다(Sonner/Vaul이 토스트와 드로어를 배치하는 방식). 하드코딩한 px보다 낫다.
- **`scale()`은 자식도 함께 키우고 줄인다**(글꼴, 아이콘, 콘텐츠). 누름 피드백에서는 장점이다.
- **3D**: JS 없이 깊이감, 궤도, 뒤집기를 만들 때 `rotateX/Y` + `transform-style: preserve-3d`를 쓴다.
- **`clip-path: inset(t r b l)`**은 강력한 애니메이션 도구다. 각 값은 그 방향에서 안쪽으로 잘라 들어온다. 쓰임새는 스크롤 등장(`inset(0 0 100% 0)` → `inset(0 0 0 0)`), 길게 눌러 삭제 오버레이, 매끄러운 탭 색 전환(복제한 뒤 활성 복제본을 잘라 낸다), 비교 슬라이더다.

## 제스처와 드래그

- **관성으로 닫기**: 거리 임곗값을 넘기라고 요구하지 않는다. 속도를 계산해(`Math.abs(distance)/elapsedMs`) `> ~0.11`이면 닫는다. 플릭 한 번이면 충분해야 한다.
- **경계의 감쇠**: 자연스러운 가장자리를 넘어 드래그하면 멀리 갈수록 덜 움직인다(실제 물체는 멈추기 전에 느려진다).
- **포인터 캡처**는 드래그가 시작되는 순간 건다. 그래야 포인터가 영역을 벗어나도 드래그가 이어진다.
- **멀티터치 보호**: 드래그가 시작된 뒤 들어온 추가 터치 지점은 무시한다(`if (isDragging) return`). 요소가 튀는 것을 막는다.
- **급정지보다 마찰**: 보이지 않는 벽을 두지 말고, 저항을 점점 키우면서 경계 너머로 끄는 것을 허용한다.

## 어설픈 크로스페이드 가리기

이징과 지속 시간을 조정해도 크로스페이드에서 두 상태가 겹쳐 보이면 전환하는 동안 은은한 `filter: blur(2px)`를 더해 하나의 변화로 느껴지게 섞는다. 블러는 20px 미만으로 둔다(강한 블러는 비용이 크고, 특히 Safari에서 그렇다).

## 스태거

묶음 등장에는 스태거를 건다. 항목 사이 간격은 30–80ms다. 지연이 더 길면 느리게 느껴진다. 스태거는 장식이다. 재생하는 동안 절대 상호작용을 막지 않는다. 그룹 등장은 `../choreograph/SKILL.md`를 따른다(컨테이너마다 등장 하나, 균일하지 않은 지연).

```css
.item { opacity: 0; transform: translateY(8px); animation: fadeIn 300ms var(--ease-out) forwards; }
.item:nth-child(2) { animation-delay: 50ms; }
.item:nth-child(3) { animation-delay: 90ms; }
@keyframes fadeIn { to { opacity: 1; transform: translateY(0); } }
```

## 접근성

```css
@media (prefers-reduced-motion: reduce) {
  .element { animation: fade 0.2s ease; } /* opacity/색은 두고 transform 기반 모션은 뺀다 */
}
@keyframes fade { from { opacity: 0; } }
@media (hover: hover) and (pointer: fine) {
  .element:hover { transform: scale(1.05); } /* hover 모션 제한, 터치는 탭할 때 가짜 hover를 일으킨다 */
}
```

```jsx
const reduce = useReducedMotion();
const closedX = reduce ? 0 : '-100%';
```

동작 줄이기는 애니메이션을 0으로 만드는 것이 아니라 더 적고 더 부드럽게 만든다는 뜻이다. 이해를 돕는 트랜지션은 두고 움직임과 위치 변화는 없앤다.

## 디버깅(느낌이 불확실할 때 리뷰에서 권한다)

- **슬로 모션**: 지속 시간을 2–5× 늘리거나 DevTools 애니메이션 검사기를 쓴다. 색이 깔끔하게 크로스페이드되는지, 이징이 갑자기 멈추지 않는지, `transform-origin`이 맞는지, 함께 움직이는 속성이 서로 맞물리는지 확인한다.
- **프레임 단위**: Chrome DevTools Animations 패널에서 함께 움직이는 속성 사이의 타이밍 어긋남이 드러난다.
- **실제 기기**: 제스처(드로어, 스와이프)는 실제 기기에서 본다. 휴대폰을 연결하고, IP로 개발 서버에 접속하고, Safari 원격 devtools를 쓴다.
- **다음 날 새로운 눈으로**: 개발하는 동안 보이지 않던 흠이 나중에 드러난다.

## 통일성

모션은 컴포넌트의 성격에 맞춘다. 발랄한 것은 더 통통 튀어도 되고 전문적인 대시보드는 깔끔하고 빨라야 한다. Sonner의 느낌이 맞는 이유 중 하나는 이징, 지속 시간, 디자인, 이름까지 조화를 이루기 때문이다. 우아하게 느껴지도록 조금 더 느리고, `ease-out`이 아니라 `ease`를 쓴다. 등장하고 퇴장하는 목록의 opacity + height는 시행착오로 맞춘다. 공식은 없다. 느낌이 맞을 때까지 조정한다.
