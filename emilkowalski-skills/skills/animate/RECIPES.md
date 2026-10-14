# 애니메이션 레시피

가장 자주 나오는 경우를 바로 만들 수 있는 구현이다. 레시피에서 시작해 맞게 고친다. 처음부터 다시 만들지 않는다.

곡선은 SKILL.md에 정의한 `--ease-out`, `--ease-in-out`, `--ease-drawer` 토큰이다.

---

## 버튼 누름

누를 수 있는 모든 요소에 쓴다. 인터페이스가 사용자의 입력을 받았다고 바로 알려 준다.

```css
.button {
  transition: transform 160ms var(--ease-out);
}

.button:active {
  transform: scale(0.97);
}
```

`scale()`은 자식의 크기도 함께 바꾼다. 라벨과 아이콘이 같이 움직이고, 그래서 물리적으로 누른 것처럼 읽힌다.

여기에는 hover 제한이 필요 없다. 터치에서 `:active`는 실제 누름이다. `:hover` 스타일은 따로 제한한다.

---

## 드롭다운, 팝오버, 메뉴, 셀렉트

허공이 아니라 트리거에서 커져 나온다.

```css
.popover {
  transform-origin: var(--transform-origin); /* Base UI가 이 값을 넣어 준다 */
  transition:
    opacity 200ms var(--ease-out),
    transform 200ms var(--ease-out);
}

.popover[data-starting-style],
.popover[data-ending-style] {
  opacity: 0;
  transform: scale(0.95);
}
```

핵심은 `transform-origin`이다. 패널은 클릭한 대상에서 나온 것처럼 보여야 한다.

---

## 툴팁

팝오버와 모양은 같고 더 빠르다. 여기에 대부분의 구현이 놓치는 디테일이 하나 더 있다.

```css
.tooltip {
  transform-origin: var(--transform-origin);
  transition:
    transform 125ms var(--ease-out),
    opacity 125ms var(--ease-out);
}

.tooltip[data-starting-style],
.tooltip[data-ending-style] {
  opacity: 0;
  transform: scale(0.97);
}

/* 툴팁 하나가 열리면 이웃 툴팁은 즉시 열린다 */
.tooltip[data-instant] {
  transition-duration: 0ms;
}
```

첫 지연은 실수로 열리는 것을 막는다. 그 뒤로 지연과 애니메이션을 모두 건너뛰면 툴바 전체가 더 빠르게 느껴진다.

---

## 모달

가운데에 머무는 유일한 팝오버다.

```css
.modal {
  transform-origin: center; /* 예외, 트리거에 붙어 있지 않다 */
  transition:
    opacity 250ms var(--ease-out),
    transform 250ms var(--ease-out);
}

.modal[data-starting-style],
.modal[data-ending-style] {
  opacity: 0;
  transform: scale(0.96);
}

.backdrop {
  transition: opacity 250ms var(--ease-out);
}
```

백드롭의 opacity도 함께 애니메이션해 둘이 한 면으로 읽히게 한다.

---

## 드로어 / 시트

```css
.drawer {
  transform: translateY(0);
  transition: transform 500ms var(--ease-drawer);
}

.drawer[data-closed] {
  transform: translateY(100%);
}
```

Vaul은 이렇게 드로어를 숨겨 두었다가 애니메이션으로 들여온다.

드래그를 더하면 제스처 문제가 된다. 아래 **끌어서 닫기**를 참고한다.

---

## 토스트

```css
.toast {
  opacity: 1;
  transform: translateY(0);
  transition:
    opacity 400ms ease,
    transform 400ms ease;

  @starting-style {
    opacity: 0;
    transform: translateY(100%);
  }
}
```

- `ease`를 쓰고(`ease-out`이 아니다) 보통 UI보다 조금 느리게 한다. Sonner가 우아하게 읽히는 이유 중 하나는 모션을 일반적인 UI 예산이 아니라 컴포넌트의 성격에 맞췄기 때문이다.
- `@starting-style`을 쓸 수 없으면 마운트 플래그로 대신한다.

```jsx
useEffect(() => { setMounted(true); }, []);
// <div data-mounted={mounted}>
```

토스트가 쌓이고 목록이 다시 배치되면 opacity 변화와 높이 변화의 균형을 맞춰야 한다. 이 둘의 조합에는 공식이 없다. 느낌이 맞을 때까지 조정하고, 다음 날 다시 확인한다.

---

## 아코디언 / 접기

```css
.content {
  overflow: hidden;
  transition:
    height 200ms var(--ease-out),
    opacity 200ms var(--ease-out);
}
```

짧게 둔다. 매 프레임 레이아웃 비용이 드는 몇 안 되는 애니메이션이라, 지속 시간이 길면 굼뜰 뿐 아니라 비싸다. `auto`로 애니메이션하지 말고 JS로 콘텐츠 높이를 잰다(아니면 그 값을 넣어 주는 헤드리스 프리미티브를 쓴다).

---

## 그룹 등장에 스태거 넣기

사용자가 가끔 보는 목록이나 그리드에 쓴다. 하루 종일 스크롤하며 지나치는 목록에는 쓰지 않는다.

```css
.item {
  opacity: 0;
  transform: translateY(8px);
  animation: fadeIn 300ms var(--ease-out) forwards;
}

.item:nth-child(2) { animation-delay: 50ms; }
.item:nth-child(3) { animation-delay: 100ms; }
.item:nth-child(4) { animation-delay: 150ms; }

@keyframes fadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

스태거는 장식이다. 재생되는 동안 절대 상호작용을 막지 않는다.

---

## 길게 눌러 확인

그냥 클릭하면 실수로 실행하기 너무 쉬운 파괴적인 동작에 쓴다.

```css
.overlay {
  clip-path: inset(0 100% 0 0);
  transition: clip-path 200ms var(--ease-out); /* 뗄 때: 재빠르게 */
}

.button:active .overlay {
  clip-path: inset(0 0 0 0);
  transition: clip-path 2s linear;             /* 누를 때: 느리고 신중하게 */
}

.button:active {
  transform: scale(0.97);
}
```

여기서는 `linear`가 맞다. 채워지는 부분은 진행 표시이고, 진행에는 이징을 넣으면 안 된다.

---

## 색 전환이 있는 탭 인디케이터

탭 목록 전체에서 색 전환을 하나하나 타이밍 맞추면 끝내 딱 맞아떨어지지 않는다. 대신 잘라서 보여 준다.

탭 목록을 복제한다. 복제본은 활성 상태로 스타일링한다(다른 배경, 다른 글자 색). 활성 탭만 보이도록 복제본을 잘라 내고, 탭이 바뀌면 잘라 낸 영역을 애니메이션한다.

```css
.tabs-active-copy {
  clip-path: inset(0 60% 0 20%); /* 활성 탭의 위치에 따라 정해진다 */
  transition: clip-path 250ms var(--ease-in-out);
}
```

글자와 배경이 완벽하게 맞춰 함께 바뀐다. 두 색을 보간하는 것이 아니라 요소 하나를 드러내는 것이기 때문이다.

---

## 스크롤 등장

마케팅 화면에만 쓴다. 사용자가 매일 찾는 기능 UI에는 하지 않는다.

```css
.reveal {
  clip-path: inset(0 0 100% 0);
  transition: clip-path 600ms var(--ease-in-out);
}

.reveal[data-visible] {
  clip-path: inset(0 0 0 0);
}
```

`IntersectionObserver`로 트리거하거나, Motion의 `useInView`에 `{ once: true, margin: "-100px" }`를 넘겨 트리거한다. 한 번만 실행한다. 스크롤로 지나칠 때마다 다시 애니메이션하면 인터페이스가 읽는 사람과 싸우는 꼴이다.

---

## 끌어서 닫기

제스처 레시피다. 사용자가 움직이는 도중에 방향을 되돌릴 수 있으니 지속 시간이 아니라 스프링을 쓴다.

```js
// 거리만이 아니라 플릭으로도 닫는다
const timeTaken = Date.now() - dragStartTime.current;
const velocity = Math.abs(swipeAmount) / timeTaken;

if (Math.abs(swipeAmount) >= SWIPE_THRESHOLD || velocity > 0.11) {
  dismiss();
}
```

```js
// 드래그하는 요소에 transform을 직접 설정한다.
// 부모의 CSS 변수로 움직이면 자식마다 스타일을 다시 계산한다.
element.style.transform = `translateY(${distance}px)`;
```

좋은 드래그와 나쁜 드래그는 다음 네 가지 디테일에서 갈린다.

- **포인터 캡처**: 드래그가 시작되면 건다. 그래야 포인터가 요소 경계를 벗어나도 드래그가 이어진다.
- **멀티터치 보호**: 새 터치 지점에서는 `if (isDragging) return`을 둔다. 그러지 않으면 드래그 중에 손가락을 바꿀 때 요소가 튄다.
- **경계 너머 감쇠**: 자연스러운 가장자리를 넘어 끌면 멀리 갈수록 요소가 덜 움직인다. 실제 사물은 멈추기 전에 느려진다.
- **벽이 아니라 마찰**: 지나치게 끄는 것을 거부하지 말고, 저항을 키우며 허용한다.

중단된 드래그가 속도를 유지하도록 스프링으로 자리를 잡게 한다.

```js
{ type: "spring", duration: 0.5, bounce: 0.2 }
```

---

## 끝내 어색한 크로스페이드 가리기

전환 중에 두 상태가 눈에 띄게 겹치고 이징이나 지속 시간을 아무리 조정해도 고쳐지지 않으면 이음매를 블러로 흐린다.

```css
.content {
  transition:
    filter 200ms ease,
    opacity 200ms ease;
}

.content.transitioning {
  filter: blur(2px);
  opacity: 0.7;
}
```

블러가 없으면 눈은 서로 다른 두 물체가 맞바뀌는 것으로 읽는다. 블러는 둘을 섞어 하나의 변화로 느끼게 한다. 20px 미만으로 둔다. 강한 블러는 비싸고, 특히 Safari에서 그렇다.

---

## 라이브러리 없이 프로그래밍 방식으로

모션에 JS 제어는 필요하지만 의존성은 필요 없을 때, WAAPI는 CSS 수준의 성능을 낸다.

```js
element.animate(
  [{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0 0)' }],
  { duration: 1000, fill: 'forwards', easing: 'cubic-bezier(0.77, 0, 0.175, 1)' }
);
```

하드웨어 가속되고, 중단 가능하고(interruptible), 번들 비용이 없다.
