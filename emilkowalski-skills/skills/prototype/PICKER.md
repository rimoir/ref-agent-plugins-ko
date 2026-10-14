# 선택기

선택기의 모습은 **디자인 결정이 아니다**. 이 스펙이 곧 그 모습이다. 아래 마크업, CSS, 연결 코드를 그대로 복사한다. 실행마다 바뀌는 값은 변형 이름과 개수뿐이다. 모든 프로젝트에서 똑같이 유지하므로 언제나 하네스의 도구 UI로 읽히고, 평가받는 디자인의 일부로는 절대 읽히지 않는다. 프로젝트의 토큰, 글꼴, 색으로 다시 스타일링하지 않는다.

화면 아래 가운데에 떠 있는 어두운 알약 모양이다. 어두운 유리는 어떤 페이지(밝든 어둡든) 위에서도 잘 어울린다. 그래서 테마를 따르지 않는다.

## 마크업

미끄러지는 하이라이트 span을 먼저 두고, 변형마다 버튼 하나, 얇은 구분선, 그다음 다시 재생 버튼(다시 실행할 모션이 있는 변형이 하나 이상일 때만)을 둔다.

```html
<nav class="proto-picker" aria-label="Prototype variants">
  <span class="proto-picker-highlight" aria-hidden="true"></span>
  <button class="proto-picker-item" data-active aria-current="true">Quiet</button>
  <button class="proto-picker-item">Editorial</button>
  <button class="proto-picker-item">Playful</button>
  <span class="proto-picker-divider" aria-hidden="true"></span>
  <button class="proto-picker-item proto-picker-replay" aria-label="Replay animation (R)">↻</button>
</nav>
```

프레임워크에서는 클래스 이름과 구조를 그대로 두고 렌더링 문법만 바꾼다.

## 스타일

```css
.proto-picker {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2147483647;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px;
  border-radius: 999px;
  background: rgba(10, 10, 10, 0.82);
  -webkit-backdrop-filter: blur(12px) saturate(1.4);
  backdrop-filter: blur(12px) saturate(1.4);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.08) inset,
    0 8px 24px rgba(0, 0, 0, 0.24),
    0 2px 6px rgba(0, 0, 0, 0.12);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 13px;
  line-height: 1;
  -webkit-font-smoothing: antialiased;
  user-select: none;
  -webkit-user-select: none;
}

.proto-picker-highlight {
  position: absolute;
  top: 4px;
  left: 0;
  height: 28px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  will-change: transform;
}

/* 슬라이드 애니메이션은 첫 페인트 뒤(data-ready)에만 켜서 로드할 때는 움직이지 않게 한다. */
.proto-picker[data-ready] .proto-picker-highlight {
  transition:
    transform 250ms cubic-bezier(0.23, 1, 0.32, 1),
    width 250ms cubic-bezier(0.23, 1, 0.32, 1);
}

@media (prefers-reduced-motion: reduce) {
  .proto-picker[data-ready] .proto-picker-highlight { transition: none; }
}

.proto-picker-item {
  position: relative; /* 하이라이트 위에 놓인다 */
  display: flex;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: rgba(255, 255, 255, 0.55);
  font: inherit;
  cursor: pointer;
  transition: color 150ms ease-out;
}

.proto-picker-item:hover {
  color: rgba(255, 255, 255, 0.85);
}

.proto-picker-item:active {
  transform: scale(0.97);
}

.proto-picker-item:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.4);
  outline-offset: 2px;
}

.proto-picker-item[data-active] {
  color: #fff;
}

.proto-picker-divider {
  width: 1px;
  height: 16px;
  margin: 0 4px;
  background: rgba(255, 255, 255, 0.12);
}

.proto-picker-replay {
  padding: 0 10px;
  font-size: 14px;
}

.proto-picker[data-position="top"] {
  bottom: auto;
  top: 24px;
}
```

## 규칙

- **글자 그대로.** 이 값들이 스펙이다. 프로젝트 글꼴, 브랜드 색, 테마 전환, 추가 그림자나 테두리를 쓰지 않는다.
- **하이라이트는 미끄러지고, 변형 교체는 즉시 일어난다.** 활성 알약은 선택기 자체의 공간 피드백으로 버튼 사이를 애니메이션으로 옮겨 간다(250ms, 강한 ease-out). 하지만 미리 보는 변형은 여전히 트랜지션 없이 바뀐다. `width` 트랜지션은 transform/opacity 규칙의 의도된 예외다. 이 요소는 높이가 28px이고, 절대 위치로 놓이며, 이 요소에 따라 레이아웃이 달라지는 요소도 없어서 페인트 비용은 무시해도 될 만큼 작다.
- **허용되는 수정은 하나:** 변형이 화면 아래 가운데를 차지하면(토스트 스택, 바텀 시트, 독) `data-position="top"`을 설정해 선택기가 작업물을 절대 가리지 않게 한다. 그 밖에는 선택기의 어떤 것도 옮기거나 바꾸지 않는다.
- **다시 재생은 조건부다.** 다시 실행할 만한 등장 애니메이션이나 상태 애니메이션이 있는 변형이 하나 이상일 때만 다시 재생 버튼과 그 구분선을 렌더링한다. 정적인 비교에서는 알약이 그만큼 짧아진다.

## 동작 계약

하네스를 어떻게 렌더링하든 계약은 고정이다.

- 숫자 키 `1–N`과 `←`/`→`로 변형을 바꾸고, `R`로 다시 재생한다. 포커스가 input, textarea, select, contenteditable 안에 있거나 보조 키를 누르고 있으면 키 이벤트를 무시한다.
- 항목을 클릭하면 그 항목으로 바뀐다. 언제나 정확히 한 항목만 `data-active`와 `aria-current="true"`를 가지며, 하이라이트가 그 항목으로 미끄러진다.
- 선택은 URL 매개변수(`?v=2`)에 담겨 새로 고침 뒤에도 유지되고, 값이 없으면 변형 1을 기본으로 쓴다. 하이라이트는 애니메이션 없이 처음 위치를 잡는다(`data-ready`는 첫 페인트 뒤에 붙는다).
- 전환하면 변형을 다시 마운트한다(그래서 등장 애니메이션이 다시 실행된다). 다시 재생 키는 전환 없이 다시 마운트한다.

## 참고 연결 코드

독립 실행 HTML 갈래에서는 그대로 쓴다. 프레임워크에서는 같은 동작을 유지하되 그 프레임워크에 맞는 방식으로 표현한다(`innerHTML` 대신 상태, `requestAnimationFrame` 대신 key를 바꿔 다시 마운트, 하이라이트 측정에는 ref와 레이아웃 이펙트).

```js
// `variants`는 변형마다 하나씩, 선택기 순서대로 놓인 렌더 함수 배열이다.
const stage = document.getElementById('stage');
const picker = document.querySelector('.proto-picker');
const highlight = picker.querySelector('.proto-picker-highlight');
const items = [...picker.querySelectorAll('.proto-picker-item:not(.proto-picker-replay)')];
const replay = picker.querySelector('.proto-picker-replay');
let current = 0;

function moveHighlight() {
  const el = items[current];
  highlight.style.width = el.offsetWidth + 'px';
  highlight.style.transform = `translateX(${el.offsetLeft}px)`;
}

function mount(i) {
  stage.innerHTML = '';
  // 먼저 비우고 다음 프레임에 렌더링해서 등장 애니메이션이 다시 실행되게 한다.
  requestAnimationFrame(() => { stage.innerHTML = variants[i](); });
}

function setActive(i) {
  if (i < 0 || i >= variants.length) return;
  current = i;
  items.forEach((el, j) => {
    el.toggleAttribute('data-active', j === i);
    if (j === i) el.setAttribute('aria-current', 'true');
    else el.removeAttribute('aria-current');
  });
  moveHighlight();
  const url = new URL(location);
  url.searchParams.set('v', i + 1);
  history.replaceState(null, '', url);
  mount(i);
}

items.forEach((el, i) => el.addEventListener('click', () => setActive(i)));
replay?.addEventListener('click', () => mount(current));
window.addEventListener('resize', moveHighlight);

document.addEventListener('keydown', (e) => {
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable) return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const num = parseInt(e.key, 10);
  if (num >= 1 && num <= variants.length) setActive(num - 1);
  else if (e.key === 'ArrowRight') setActive((current + 1) % variants.length);
  else if (e.key === 'ArrowLeft') setActive((current - 1 + variants.length) % variants.length);
  else if (e.key === 'r' || e.key === 'R') mount(current);
});

setActive((parseInt(new URLSearchParams(location.search).get('v'), 10) || 1) - 1);
// 슬라이드 애니메이션은 첫 페인트 뒤에만 켜서 로드할 때는 움직이지 않게 한다.
requestAnimationFrame(() => requestAnimationFrame(() => picker.setAttribute('data-ready', '')));
```
