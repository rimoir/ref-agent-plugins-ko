# 안무 레시피

[SKILL.md](SKILL.md)의 관계를 바로 옮겨 쓸 수 있는 패턴이다. 값은 출발점이니 녹화를 보며 조정한다.

## 겹침: 인덱스 변수를 쓴 CSS 스태거

단발성 등장(히어로, 개인 사이트 인트로)에 쓴다. 지연은 CSS 변수에서 요소마다 계산되니 항목마다 클래스를 둘 필요가 없다.

```tsx
<div className="stagger">
  <h1 style={{ "--i": 0 }}>Title</h1>
  <p style={{ "--i": 0 }}>First paragraph, same beat as the title</p>
  <p style={{ "--i": 1 }}>Supporting paragraph</p>
  <div style={{ "--i": 2 }}>CTAs</div>
</div>
```

```css
.stagger > * {
  --step: 120ms;
  animation: enter 0.6s ease both;
  animation-delay: calc(var(--step) * var(--i));
}

@keyframes enter {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .stagger > * {
    animation-name: fade;
    animation-delay: 0ms;
  }
  @keyframes fade {
    from { opacity: 0; }
  }
}
```

- `both`가 필요하다. `backwards`는 지연 동안 첫 키프레임을 적용해서 뒤쪽 항목이 애니메이션 전에 끝 상태를 번쩍 보여 주지 않게 한다. `forwards`는 끝 상태를 유지한다.
- `to`를 빼면 키프레임이 요소 자신의 스타일까지 애니메이션된다.
- 부모의 CSS 변수를 바꾸면 모든 자손의 스타일이 다시 계산된다. 단발성 등장에는 괜찮지만 프레임마다 바뀌는 값(드래그)을 큰 트리의 상속 변수로 몰지 않는다.

## 겹침: 균일하지 않은 스태거를 쓴 Motion variants

```tsx
import { motion, stagger } from "motion/react";

const list = {
  hidden: {},
  show: {
    transition: {
      // 그룹이 진행될수록 지연이 줄어 메트로놈이 아니라 물결로 읽힌다
      delayChildren: stagger(0.06, { ease: "easeOut" }),
    },
  },
};

const lead = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] } },
};

const support = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] } },
};

const decoration = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3 } },
};

<motion.section variants={list} initial="hidden" animate="show">
  <motion.span variants={decoration}>New</motion.span>
  <motion.h1 variants={lead}>Title</motion.h1>
  <motion.p variants={support}>Subtitle</motion.p>
  <motion.div variants={support}>CTAs</motion.div>
</motion.section>
```

- 역할마다 자기 variant(거리, 지속 시간)가 있다. 스태거는 각자 *언제* 시작할지만 정한다.
- `stagger(0.05, { from: "center" })`는 가운데에서 바깥으로 퍼진다. 사용자가 조작한 항목에서 퍼지게 하려면 숫자 인덱스를 쓴다.
- 오래된 Motion 버전은 `delayChildren: stagger(...)` 대신 `staggerChildren: 0.06`을 쓴다.
- 긴 목록은 처음 약 6개 뒤의 항목에 6번째와 같은 지연을 줘서 그룹이 약 300ms를 넘지 않게 한다.

## 함께: 퇴장하는 요소를 흐름에서 빼기

제거된 항목이 페이드된 *뒤가* 아니라 페이드되는 *동안* 형제가 빈자리를 메운다.

```tsx
<ul>
  <AnimatePresence mode="popLayout" initial={false}>
    {chips.map((chip) => (
      <motion.li
        key={chip.id}
        layout
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      >
        {chip.label}
      </motion.li>
    ))}
  </AnimatePresence>
</ul>
```

라이브러리 없이 하려면 퇴장을 돌리기 전에 요소의 오프셋을 읽고, 그 `top`/`left`로 `position: absolute`를 준 뒤(부모에는 `position: relative`가 필요하다) 애니메이션으로 내보낸다. 형제는 FLIP으로 애니메이션하거나 리플로되게 둔다.

## 함께: 크기가 바뀌는 컨테이너에서 뷰 크로스페이드하기

컨테이너의 높이와 콘텐츠 전환은 한 객체다. 지속 시간이 같고 이징 계열도 같다.

```tsx
import useMeasure from "react-use-measure";

const [ref, bounds] = useMeasure();
const prevHeight = useRef<number>();

// 컨테이너가 움직이는 거리에 맞춰 페이드 지속 시간이 달라진다
const fadeDuration = useMemo(() => {
  const MIN = 0.15;
  const MAX = 0.27;
  if (!prevHeight.current) {
    prevHeight.current = bounds.height;
    return MIN;
  }
  const delta = Math.abs(bounds.height - prevHeight.current);
  prevHeight.current = bounds.height;
  return Math.min(Math.max(delta / 500, MIN), MAX);
}, [bounds.height]);

<motion.div
  animate={{ height: bounds.height }}
  transition={{ duration: 0.27, ease: [0.25, 1, 0.5, 1] }}
  style={{ overflow: "hidden" }}
>
  <div ref={ref}>
    <AnimatePresence initial={false} mode="popLayout">
      <motion.div
        key={view}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: fadeDuration, ease: [0.26, 0.08, 0.25, 1] }}
      >
        {content}
      </motion.div>
    </AnimatePresence>
  </div>
</motion.div>
```

- 높이에는 강한 `ease-out`을, 콘텐츠에는 같은 계열의 더 가벼운 곡선을 써서 전환이 어긋나지 않으면서 눈에 보이게 한다.
- 자식의 `key`가 `AnimatePresence`에 뷰가 떠났다고 알려 준다. 퇴장이 재생되지 않으면 key 누락부터 확인한다.
- 컨테이너가 더 큰 컴포넌트(드로어)의 일부라면 그 컴포넌트의 열기 지속 시간도 이 값에 맞춰 전체가 한 덩어리로 느껴지게 한다.

## 방향을 아는 단계 전환

```tsx
const [[step, direction], setStep] = useState([0, 0]);
const go = (d: 1 | -1) => setStep(([s]) => [s + d, d]);

const variants = {
  initial: (d: number) => ({ x: `${110 * d}%`, opacity: 0 }),
  active: { x: "0%", opacity: 1 },
  exit: (d: number) => ({ x: `${-110 * d}%`, opacity: 0 }),
};

<MotionConfig transition={{ type: "spring", duration: 0.5, bounce: 0 }}>
  <AnimatePresence mode="popLayout" initial={false} custom={direction}>
    <motion.div
      key={step}
      custom={direction}
      variants={variants}
      initial="initial"
      animate="active"
      exit="exit"
    >
      {content}
    </motion.div>
  </AnimatePresence>
  <motion.div layout>{/* Back / Continue가 높이 변화를 따라간다 */}</motion.div>
</MotionConfig>
```

`custom`은 `AnimatePresence`와 자식 **양쪽에** 넣는다. 퇴장하는 자식은 `AnimatePresence`에서 최신 방향을 읽는다. 그러지 않으면 마운트될 때의 방향을 쓴다.

작은 컨테이너나 비슷한 뷰에서는 110% 슬라이드를 8px 이동과 약한 블러가 있는 크로스페이드로 바꾼다. 시선은 거의 움직이지 않는데 변화는 읽힌다.

## 시퀀스: 하나씩 차례로 그리기

```css
.square {
  animation: draw 0.6s cubic-bezier(0.645, 0.045, 0.355, 1) forwards;
}

.checkmark {
  animation: draw 0.4s cubic-bezier(0.645, 0.045, 0.355, 1) forwards;
  animation-delay: 0.6s; /* = 사각형의 지속 시간 */
}

@keyframes draw {
  to { stroke-dashoffset: 0; }
}
```

두 경로에 `pathLength="100"`을 주면 `stroke-dasharray: 100; stroke-dashoffset: 100`이 둥근 숫자로 각각을 숨긴다. 넘겨주는 지점이 하나의 몸짓으로 읽히게 하려면 체크 표시를 사각형이 끝나기 조금 전에 시작한다(예: 0.5초).

## 시퀀스: 크로스페이드로 복잡한 두 상태 사이를 모핑하기

컨테이너가 밀도 높은 뷰 사이에서 너비 *와* 높이를 바꿀 때는 `mode="wait"`가 안전한 기본값이다. 그래도 크로스페이드를 유지하려면 다음처럼 한다.

1. 활성 뷰를 두 번 렌더링한다. 사본 A는 **등장**만 애니메이션한다. 사본 B는 `position: absolute`이고 `opacity: 0`에 머물다가 **퇴장**할 때만 보인다. 퇴장은 `opacity: 1`에서 시작해 페이드 아웃되는 키프레임이다.
2. 퇴장 사본에는 컨테이너가 향하는 곳에 따라 자기 transform을 따로 준다. 다음 상태가 더 크면 키우고 더 작으면 줄이며, 컨테이너가 좁아질 때는 `scaleX`로 가운데로 당겨 가장자리 밖으로 번지지 않게 한다.
3. 상태가 몇 개뿐이면 이 값들(과 스프링 바운스)을 상태 쌍마다 하드코딩하고 `custom`으로 넘긴다. 작은 상태일수록 바운스를 더 준다.

## 실어 나르기: 공유 레이아웃 애니메이션을 부모로 조종하기

`layoutId` 애니메이션의 경로는 바꿀 수 없지만 그것이 내려앉는 컨테이너는 움직일 수 있다.

```tsx
<motion.div
  animate={{ y: 73 }}
  transition={{ delay: 0.13, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
>
  {selected.map((img) => (
    <motion.img key={img.id} layoutId={img.id} src={img.src} />
  ))}
</motion.div>
```

이미지가 휴지통으로 모핑되면서 *동시에* 함께 떨어진다. 휴지통의 앞면은 이미지가 거의 내려앉을 시점에 맞춘 지연을 두고 보여 줘서 이미지가 앞면을 통과하는 모습이 보이지 않게 한다.

## 명령형 오케스트레이션(`useAnimate`)

여러 요소가 여러 이벤트에 걸쳐 조율되고 완료를 기다려야 할 때만 쓴다.

```tsx
const [scope, animate] = useAnimate();
const running = useRef<ReturnType<typeof animate>[]>([]);
const ready = useRef(false); // 렌더링되지 않는 플래그라 useState를 쓰지 않는다

function play(steps: ReturnType<typeof animate>[]) {
  running.current.forEach((a) => a.stop()); // 시퀀스를 절대 쌓지 않는다
  running.current = steps;
  return Promise.all(steps);
}

const onEnter = async () => {
  ready.current = false;
  await play([
    animate("[data-animate='icon']", { y: -4 }, { duration: 0.3 }),
    ...[...scope.current.querySelectorAll("[data-animate='line']")].map((el, i) =>
      animate(
        el,
        { strokeDashoffset: [1.05, 0] },
        { duration: 0.5, times: [0.7, 0.9], delay: i === 1 ? 0 : 0.04 },
      ),
    ),
  ]);
  ready.current = true;
};

const onClick = () => {
  if (!ready.current) return;
  // 반복 동작은 준비 단계를 건너뛴다. 비율은 같고 타임라인에서 더 일찍 시작한다
  play([animate("[data-animate='bg']", { scale: [1, 0.96, 1.02, 1] }, { duration: 0.4 })]);
};

const onLeave = async () => {
  await play([/* 모든 요소를 리셋한다 */]);
  startIdle(); // 리셋이 끝난 뒤에만 시작한다
};

function startIdle() {
  // `running`에서 추적하니 다음 onEnter가 루프를 멈춘다
  running.current = [
    animate("[data-animate='icon']", { y: [0, -3, 0] }, {
      delay: 2.5,
      repeat: Infinity,
      repeatDelay: 6,
    }),
  ];
}
```

- 요소마다 ref를 두지 말고 `scope` 안의 `data-animate` 선택자로 대상을 잡는다.
- 지속 시간이 다르면 `Promise.all`을 await한다. 애니메이션 하나만 await해도 안전한 것은 모두 같은 지속 시간일 때뿐이다.
