# Expo 애니메이션 레시피

React Native 앱에서 가장 자주 나오는 경우를 바로 만들 수 있게 구현해 둔 것이다. 레시피에서 시작해 상황에 맞게 고친다.

---

## 레시피가 전제하는 설정

```bash
npx expo install react-native-reanimated react-native-worklets react-native-gesture-handler expo-haptics
```

(`react-native-keyboard-controller`는 키보드 레시피에만 필요하다.) `npm install`이 아니라 `expo install`을 쓴다. SDK에 맞는 버전을 찾아 준다. worklets Babel 플러그인은 `babel-preset-expo`가 자동으로 설정한다.

`GestureHandlerRootView`는 앱을 한 번 감싼다. Expo Router에서는 루트 `_layout`에 둔다.

```jsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack />
    </GestureHandlerRootView>
  );
}
```

아래 모든 레시피가 함께 쓰는 import와 상수다.

```js
import { useState, useEffect, useMemo } from 'react';
import Animated, {
  useSharedValue, useAnimatedStyle, useAnimatedScrollHandler, useAnimatedReaction,
  withSpring, withTiming, interpolate, Extrapolation, Easing,
  FadeInDown, FadeOutDown, LinearTransition,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';
import * as Haptics from 'expo-haptics';

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);      // UI용 강한 ease-out
const EASE_IN_OUT = Easing.bezier(0.77, 0, 0.175, 1);  // 화면 안 이동
const EASE_SHEET = Easing.bezier(0.32, 0.72, 0, 1);    // iOS 시트 곡선
```

레시피마다 설명하지 않고 여기서 한 번만 설명하는 규칙 세 가지다.

- **공유 값은 `.get()` / `.set()`으로 읽고 쓴다.** Reanimated 문서가 React Compiler 지원을 위해 권하는 형태다. `.value`도 여전히 동작하지만 컴파일러가 꿰뚫어 보지 못한다.
- 워클릿에서 React Native 런타임 쪽을 호출할 때는 **`scheduleOnRN(fn, ...args)`가 지원 중단된 `runOnJS(fn)(...args)`를 대신한다.**
- **제스처는 `useMemo`로 감싼다.** 렌더링마다 제스처를 다시 만들면 인식기가 다시 붙으면서 진행 중인 드래그를 놓칠 수 있다.

**Gesture Handler v3:** Expo는 v2를 설치하고, 레시피는 v2의 `Gesture.Pan()` 빌더를 쓴다. 프로젝트가 이미 v3라면 빌더는 레거시다. v3에서는 제스처마다 설정 객체 하나를 받는 훅이 되고, `onStart` → `onActivate`, `onEnd` → `onDeactivate`로 바뀌며, `success` 플래그는 `event.canceled`(값이 반대)로 대체된다. 훅이 자기 동일성을 스스로 관리하므로 `useMemo`는 뺀다.

```jsx
const pan = usePanGesture({
  activeOffsetY: [-10, 10],
  onActivate: () => { context.set(translateY.get()); },
  onUpdate: (e) => { translateY.set(context.get() + e.translationY); },
  onDeactivate: (e) => { /* 아래처럼 withSpring으로 자리를 잡는다 */ },
});
```

---

## 어디서나 필요한 워클릿 두 개

관성 예측(momentum projection)은 *플릭이 어디로 가던 중이었는지*를 판단한다. 그래서 짧고 빠른 스와이프는 확정되고 길고 느린 스와이프는 확정되지 않는다. 러버밴딩(rubber-banding)은 경계가 뚝 멈추는 대신 저항하게 만든다.

```js
// 손가락이 계속 감속한다면 멈추게 될 위치.
// Apple의 지수 감쇠 형태다. 물리 수업에서 배운 v²/2a가 아니다.
function project(velocity, decelerationRate = 0.998) {
  'worklet';
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

// 가장자리를 넘을수록 요소가 덜 따라온다.
function rubberband(overshoot, dimension, constant = 0.55) {
  'worklet';
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}
```

---

## 누름 피드백

앱 안의 누를 수 있는 모든 요소에 쓴다. 이 레시피가 빈도 관문을 통과하는 것은 오로지 거의 느껴지지 않기 때문이다. 이만큼 자주 닿는 요소에는 120ms와 3% scale이 상한이다. SKILL.md 1단계에 따라 그보다 길거나 큰 것은 더 드문 순간의 몫이다. 제스처도 공유 값도 없다. CSS 트랜지션 하나가 구현의 전부다.

```jsx
import Animated from 'react-native-reanimated';
import { Pressable, StyleSheet } from 'react-native';

function PressableScale({ onPress, children }) {
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      hitSlop={12}
      pressRetentionOffset={16}
    >
      <Animated.View style={[styles.box, pressed && styles.pressed]}>{children}</Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    transform: [{ scale: 1 }],
    transitionProperty: 'transform',
    transitionDuration: '120ms',
    transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
  },
  pressed: { transform: [{ scale: 0.97 }] },
});
```

여기서는 `setState`를 써도 된다. 프레임마다가 아니라 누름 한 번에 두 번 실행된다. `hitSlop`은 작은 아이콘을 키우지 않고도 터치 영역을 44pt까지 넓힌다. `pressRetentionOffset`은 손가락이 살짝 흘러도 누름이 취소되지 않게 한다.

---

## 끌어서 닫는 바텀 시트

쓰기 전에 확인한다. 시트가 그 자체로 목적지라면 `presentation: 'formSheet'`를 쓰고(**화면 전환** 참고) 플랫폼의 진짜 시트를 공짜로 얻는다. 시트가 기존 화면 안에 있어야 할 때만 이것을 만든다.

```jsx
const translateY = useSharedValue(0);
const context = useSharedValue(0);

const pan = useMemo(() => Gesture.Pan()
  .activeOffsetY([-10, 10])   // 가로 스와이프에 양보하고, 확정 전에 의도를 확인한다
  .onStart(() => {
    context.set(translateY.get());   // 0이 아니라 지금 화면에 보이는 값에서 시작한다
  })
  .onUpdate((e) => {
    const next = context.get() + e.translationY;
    // 아래로는 자유롭고, 맨 위를 넘어 위로 가면 저항한다
    translateY.set(next >= 0 ? next : rubberband(next, HEIGHT));
  })
  .onEnd((e) => {
    const projected = translateY.get() + project(e.velocityY);
    if (projected > HEIGHT * 0.4) {
      translateY.set(withSpring(HEIGHT, {
        duration: 300, dampingRatio: 1, velocity: e.velocityY, overshootClamping: true,
      }, (finished) => { if (finished) scheduleOnRN(onClose); }));
    } else {
      translateY.set(withSpring(0, { duration: 300, dampingRatio: 0.8, velocity: e.velocityY }));
      scheduleOnRN(Haptics.impactAsync, Haptics.ImpactFeedbackStyle.Light);   // 제자리에 붙었다
    }
  }), [onClose]);

const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.get() }] }));
```

이것을 나쁜 드래그와 가르는 디테일 네 가지다.

- **`onStart`가 현재 값을 잡아 둔다.** 이것이 없으면 애니메이션 도중에 시트를 잡을 때 시트가 순간이동한다. 애니메이션은 눈이 마지막으로 본 자리에서 이어져야 한다.
- **거리가 아니라 속도가 정한다.** `project()` 덕분에 몇 픽셀만 내려도 빠르게 플릭하면 닫힌다. 40%를 이동해야 닫히게 하면 시트가 무겁게 느껴진다.
- **속도를 스프링에 넘긴다.** 그래서 손가락을 떼는 순간과 애니메이션이 이어지는 순간 사이에 이음매가 없다. "유려한" 것과 "그럭저럭 괜찮은" 것을 가장 크게 가르는 디테일이 바로 이것이다.
- **닫을 때는 `overshootClamping`.** 그렇지 않으면 시트가 화면 아래를 지나쳐 튕기며 틈이 번쩍 보인다.

백드롭은 같은 값에서 파생되므로 늘 맞물리고 비용이 들지 않는다.

```jsx
const backdropStyle = useAnimatedStyle(() => ({
  opacity: interpolate(translateY.get(), [0, HEIGHT], [1, 0], Extrapolation.CLAMP),
}));
```

---

## 밀어서 행 삭제하기

쓰기 전에 확인한다. gesture-handler에는 [`ReanimatedSwipeable`](https://docs.swmansion.com/react-native-gesture-handler/docs/components/reanimated_swipeable/)이 들어 있고, 밀어서 동작 버튼 드러내기(임곗값, 오버슈트, 열기/닫기 메서드)를 이미 UI 스레드에서 해 준다. 행이 동작 버튼을 드러낼 때는 이것을 쓴다. 상호작용의 종류가 다를 때만 제스처를 직접 만든다. 이 레시피처럼 관성 예측으로 밀어서 확정하는 경우다.

```jsx
const x = useSharedValue(0);
const context = useSharedValue(0);

const pan = useMemo(() => Gesture.Pan()
  .activeOffsetX([-10, 10])   // 축을 선언해야 한다. 아니면 세로 스크롤과 다툰다
  .onStart(() => { context.set(x.get()); })   // 스프링 도중에 잡으면 0이 아니라 행이 있는 자리에서 이어진다
  .onUpdate((e) => { x.set(Math.min(0, context.get() + e.translationX)); })
  .onEnd((e) => {
    const projected = x.get() + project(e.velocityX);
    if (projected < -SWIPE_THRESHOLD) {
      x.set(withTiming(-WIDTH, { duration: 200, easing: EASE_OUT }, (f) => {
        if (f) scheduleOnRN(onDelete, id);
      }));
    } else {
      x.set(withSpring(0, { duration: 300, dampingRatio: 1, velocity: e.velocityX }));
    }
  }), [onDelete, id]);
```

지운 행이 남긴 틈을 메우는 것은 행이 아니라 목록이 할 일이다.

```jsx
const ROW_CLOSE = LinearTransition.duration(200);   // 모듈 범위. 렌더링 안에서 다시 만든 빌더는 리렌더링마다 비용이 든다

<Animated.FlatList data={items} itemLayoutAnimation={ROW_CLOSE} ... />
```

`activeOffsetX`가 모바일 고유의 부분이다. 축을 선언하지 않은 pan 핸들러가 스크롤 뷰 안에 있으면 세로 스크롤을 가로채고, 목록은 제스처 버그가 아니라 스크롤 버그처럼 보이는 식으로 고장 난 느낌을 준다.

---

## 스크롤하면 접히는 헤더

```jsx
const scrollY = useSharedValue(0);
const onScroll = useAnimatedScrollHandler((e) => { scrollY.set(e.contentOffset.y); });

const titleStyle = useAnimatedStyle(() => ({
  opacity: interpolate(scrollY.get(), [0, 60], [1, 0], Extrapolation.CLAMP),
  transform: [{ translateY: interpolate(scrollY.get(), [0, 60], [0, -12], Extrapolation.CLAMP) }],
}));

<Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16}>
```

**헤더를 접으려고 `height`를 절대 애니메이션하지 않는다.** 그러면 스크롤 프레임마다 헤더와 그 아래 모든 것에 레이아웃 계산이 돈다. 스크롤 자체와 경쟁하므로 끊길 수밖에 없는 애니메이션이다. 컨테이너에 고정 높이를 주고 안의 내용을 이동시키며 `overflow: 'hidden'`으로 잘라 낸다.

`Extrapolation.CLAMP`는 선택이 아니다. 이것이 없으면 60을 넘게 스크롤할 때 opacity가 계속 음수로 내려가고, 긴 목록의 아래쪽에서 헤더가 뒤집힌 채 다시 나타난다.

---

## 목록 등장

```jsx
// Reanimated 문서는 레이아웃 애니메이션을 컴포넌트 밖에서 만들거나
// useMemo 안에서 만들라고 권한다. JSX 안의 인라인 체인은 렌더링마다 빌더를 다시 만든다.
// 인덱스별 지연은 모듈 범위에 둘 수 없으므로 행이 자기 것을 메모이즈한다.
function Row({ item, index }) {
  const entering = useMemo(() => FadeInDown.duration(250).delay(index * 40), [index]);
  return <Animated.View entering={entering}>{/* ... */}</Animated.View>;
}

{items.map((item, i) => <Row key={item.id} item={item} index={i} />)}
```

스태거는 30–80ms로 둔다. 더 길면 느리게 느껴지고, 더 짧으면 동시에 나오는 것처럼 읽힌다.

**`FlatList`, `FlashList`, 그 밖의 모든 가상화 목록 안의 행에는 절대 `entering`을 붙이지 않는다.** 행이 재활용되므로 행이 스크롤로 다시 보일 때마다 애니메이션이 다시 실행된다. 사용자가 스크롤하는 동안 목록이 깜빡이는 것처럼 보인다. 목록 컨테이너를 마운트 때 한 번 애니메이션하거나, 재배치에만 `itemLayoutAnimation`을 쓴다.

등장 애니메이션은 사용자가 요청하고 기다리는 콘텐츠에 쓴다. 하루 종일 스크롤해 지나치는 목록은 이미 그 자리에 있어야 한다.

---

## 키보드와 맞물린 UI

별도 모듈과 한 번만 두는 프로바이더가 필요하다([Expo 키보드 가이드](https://docs.expo.dev/guides/keyboard-handling/)).

```bash
npx expo install react-native-keyboard-controller
```

```jsx
import { KeyboardProvider } from 'react-native-keyboard-controller';

// 루트 _layout에서 GestureHandlerRootView 옆에 둔다. 이것이 없으면 아래 훅은 아무것도 하지 않는다.
<KeyboardProvider>
  <Stack />
</KeyboardProvider>
```

```jsx
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';

const { height } = useReanimatedKeyboardAnimation();   // 0 → -keyboardHeight, UI 스레드에서
const footerStyle = useAnimatedStyle(() => ({ transform: [{ translateY: height.get() }] }));
```

이것을 `Keyboard.addListener`와 타이밍 애니메이션으로 절대 만들지 않는다. 키보드는 공개되지 않은 시스템 곡선을 따르고, 이벤트는 키보드가 이미 움직이기 시작한 뒤에 JS 스레드에 도착하며, 어떤 지속 시간을 고르든 키보드보다 눈에 띄게 늦거나 앞선다. UI는 키보드의 실제 위치로 프레임마다 구동해야 한다.

---

## 탭 / 세그먼트 인디케이터

한 번 재고, 그다음 transform을 애니메이션한다.

```jsx
const [layouts, setLayouts] = useState({});   // 프레임마다가 아니라 onLayout으로 잰다
const x = useSharedValue(0);
const w = useSharedValue(0);

useEffect(() => {
  const l = layouts[active];
  if (!l) return;
  x.set(withTiming(l.x, { duration: 250, easing: EASE_IN_OUT }));
  w.set(withTiming(l.width, { duration: 250, easing: EASE_IN_OUT }));
}, [active, layouts]);

const pillStyle = useAnimatedStyle(() => ({
  transform: [{ translateX: x.get() }],
  width: w.get(),
}));
```

허용되는 `width` 애니메이션이 이것이다. 알약 모양 인디케이터는 자식 없는 절대 위치 요소라서 다른 것이 다시 배치되지 않고, 모서리 반경도 그대로 남는다. `scaleX`라면 모서리를 타원으로 뭉갠다.

알약이 화면에 들어오거나 나가는 것이 아니라 화면을 가로질러 움직이므로 `ease-in-out`을 쓴다. `Haptics.selectionAsync()`는 알약이 도착할 때가 아니라 누를 때 실행한다.

---

## 화면 전환 (Expo Router)

네이티브 스택을 설정한다. 화면 전환을 JS로 절대 다시 만들지 않는다. 네이티브 전환은 플랫폼 쪽에서 돌고, 인터랙티브 뒤로 가기 제스처를 유지하며, 기기의 다른 모든 앱과 맞는다.

```jsx
<Stack screenOptions={{ animation: reduced ? 'fade' : 'default' }}>
  <Stack.Screen name="settings" options={{ animation: 'slide_from_right', animationMatchesGesture: true }} />
  <Stack.Screen name="compose" options={{ presentation: 'modal' }} />
  <Stack.Screen name="filter" options={{
    presentation: 'formSheet',
    sheetAllowedDetents: 'fitToContents',
    sheetGrabberVisible: true,
  }} />
</Stack>
```

| 내비게이션 | 옵션 |
| --- | --- |
| 계층 안쪽으로 들어가기 | `animation: 'default'`. 손대지 않은 플랫폼 push |
| 사용자가 그만둘 수 있는 그 자체로 완결된 작업 | `presentation: 'modal'` |
| 짧은 끼어들기(피커, 필터, 공유) | 디텐트를 단 `presentation: 'formSheet'` |
| 탭 사이 | `animation: 'none'` |
| 동작 줄이기 | `animation: 'fade'` |

`animationMatchesGesture: true`를 주면 iOS 뒤로 가기 스와이프가 기본 push 대신 지정한 전환을 손가락 아래에서 거꾸로 재생한다. 커스텀 `animation`을 정할 때는 늘 함께 설정한다. 그러지 않으면 뒤로 끄는 동작이 앞으로 밀어 넣는 동작과 다른 앱처럼 보인다.

`formSheet`는 두 플랫폼 모두에서 네이티브지만 두 플랫폼에서 같지는 않다. 전체 목록은 [Expo 모달 문서](https://docs.expo.dev/router/advanced/modals/#form-sheet-presentation)에 있다.

- **Android는 디텐트를 셋까지만 허용한다.** 더 긴 `sheetAllowedDetents` 배열은 iOS에서는 동작하지만 Android에서는 소리 없이 잘린다. 셋에 맞춰 설계한다.
- **`sheetGrabberVisible`은 iOS 전용이다.** Android는 그래버를 보여 주지 않는다. "끌 수 있다"를 알리는 유일한 어포던스로 그래버에 기대지 않는다.
- **Android 폼 시트에는 네이티브 헤더나 중첩 스택을 넣을 수 없다.** 시트 내용은 한 화면으로 둔다. 자체 내비게이션이 필요하면 대신 `presentation: 'modal'`을 쓴다.
- **`fitToContents`에는 크기를 명시한 내용이 필요하다.** `flex: 1` 루트에는 맞출 고유 높이가 없다. 내용에 크기를 주지 않으면 디텐트가 틀린다.

---

## 토스트

```jsx
// 모듈 범위. 레이아웃 애니메이션 빌더는 컴포넌트 밖에 둔다.
const TOAST_ENTER = FadeInDown.duration(300).easing(EASE_OUT);
const TOAST_EXIT = FadeOutDown.duration(250).easing(EASE_OUT);

<Animated.View
  entering={TOAST_ENTER}
  exiting={TOAST_EXIT}
  style={{ position: 'absolute', bottom: insets.bottom + 16, left: 16, right: 16 }}
/>
```

- **300ms 상한은 여기서도 지킨다.** 토스트는 예외가 아니다. 사용자가 부르지 않은 것이므로 오히려 사용자가 요청한 모션보다 더 빠르고 조용해야 한다.
- **들어온 길로 나간다.** 아래에서 들어와 옆으로 나가면 서로 관계없는 두 요소로 읽힌다.
- **퇴장은 등장보다 ~20% 빠르게.** 사용자는 이미 다 읽었다. 시간을 들일 가치가 있는 것은 도착이지 떠남이 아니다.
- **안전 영역 여백은 언제나 반영한다.** `bottom: 16`에 둔 토스트는 요즘 iPhone이라면 모두 홈 인디케이터 밑에 깔린다.

토스트가 쌓이고 목록이 재배치되면 `itemLayoutAnimation`을 더하고, 재배치에 맞춰 opacity를 눈으로 조정할 각오를 한다. 그 둘의 조합에는 공식이 없다. 다음 날 다시 본다.

---

## 임곗값에서 한 번만 실행하기

넘어가는 지점(디텐트, 스냅, 당겨서 새로 고침이 준비되는 순간)이 중요할 때는 JS에서 폴링하지 않고, 매 프레임 `scheduleOnRN`을 부르지도 않는다.

```jsx
const armed = useSharedValue(false);

useAnimatedReaction(
  () => pullDistance.get() > REFRESH_THRESHOLD,
  (isArmed, wasArmed) => {
    if (isArmed !== wasArmed) {
      armed.set(isArmed);
      scheduleOnRN(Haptics.impactAsync, Haptics.ImpactFeedbackStyle.Light);
    }
  }
);
```

비교는 매 프레임 UI 스레드에서 돌고, JS 호출은 당길 때마다 두 번 일어난다. "애니메이션이 X에 닿으면 무언가를 한다"는 모든 경우에 이 패턴을 쓴다.
