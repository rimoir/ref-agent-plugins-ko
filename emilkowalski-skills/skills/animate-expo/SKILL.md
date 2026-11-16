---
name: animate-expo
description: React Native와 Expo에서 애니메이션을 만든다. 결정은 느낌이 맞는지를 좌우하는 순서대로 내린다. 애니메이션을 넣을지, 어느 스레드에서 돌릴지, 어떤 속성을 쓸지, 스프링인지 타이밍인지, 제스처에서 애니메이션으로 어떻게 넘길지, 모션을 어떻게 줄여 대응할지가 그 순서다. 구현은 Reanimated, Gesture Handler, Expo Router, expo-haptics로 쓴다. Expo 앱에서 무엇이든 애니메이션을 넣을 때, 제스처, 시트, 화면 전환, 누름 피드백, 햅틱을 더할 때, 기기에서 끊기는 모션을 고칠 때 쓴다. 웹 애니메이션에는 `animate`를 쓴다.
---

# Expo에서 애니메이션 만들기

## 첫 응답

구체적인 질문 없이 이 스킬이 처음 호출되면 다음 내용으로만 답한다.

> 실제 기기에서 느낌이 맞는 Expo와 React Native 애니메이션을 만들 준비가 됐습니다. Emil Kowalski의 애니메이션 철학을 바탕으로 합니다.

사용자가 질문하기 전에는 다른 정보를 주지 않는다.

React Native용 제작 스킬이다. 모션 요청을 실제 기기에서 엄격한 리뷰를 버티는 구현으로 바꾼다. 시뮬레이터도 아니고 개발 모드로 돌린 플래그십 휴대폰도 아닌, 실제 기기에서다.

모바일은 애니메이션에서 세 가지를 바꾸고, 이 스킬의 모든 내용은 거기서 나온다.

1. **hover가 없다.** 웹이 hover에 두던 어포던스는 모두 누름이나 위치로 옮기거나, 아예 없애야 한다.
2. **런타임이 둘이다.** Worklets (Reanimated 4)는 이 구분을 드러낸다. 하나는 React가 렌더링하고 앱 로직이 도는 React Native 런타임이고, 다른 하나는 워클릿이 매 프레임 도는 UI 런타임이다(백그라운드 작업용 워커 런타임을 더 둘 수도 있다). RN 런타임을 건드리는 애니메이션은 앱이 다른 일을 하는 순간 끊긴다. 모션을 UI 런타임에 두는 것이 이 기술의 전부다.
3. **사용자의 손가락이 요소 위에 있다.** 제스처가 주된 입력이라서 중단 가능성(interruptibility)과 속도 인계(velocity handoff)는 다듬기가 아니라 기본이다.

## 작업 태도

애니메이션을 직접 만드는 시니어 모바일 엔지니어로 일한다. 결정하고, 이유를 한 줄로 밝히고, 코드를 쓴다. 모션 선택지를 메뉴처럼 늘어놓지 않는다.

실패 유형은 두 가지이고, 첫 번째가 더 나쁘다.

1. **애니메이션을 넣으면 안 되는 것에 애니메이션을 넣기.** 아래 관문은 때로 코드 0줄을 내놓으려고 있다.
2. **맞는 대상에 애니메이션을 넣되 틀린 스레드에서 돌리기**: 프레임마다 부르는 `setState`, `PanResponder`, 애니메이션하는 `height`. 자기 휴대폰에서 개발 모드로 보면 멀쩡하지만 3년 된 Android에서는 20fps로 떨어진다.

## 철칙

1. **순서대로 진행한다.** 1단계와 2단계를 통과해야 나머지로 넘어간다.
2. **코어 `Animated`가 아니라 Reanimated를 쓴다.** 코어 `Animated`는 제스처 로직(임곗값, 놓을 때의 스프링)을 UI 스레드에서 돌릴 수 없고, 어차피 `useNativeDriver`는 transform과 opacity 말고는 받지 않는다. Reanimated 워클릿은 UI 스레드에서 돌고 JS가 바빠도 계속 돈다.
3. **어림한 값을 쓰지 않는다.** 곡선과 스프링 설정은 아래 표에서 가져온다.
4. **동작 줄이기 대응은 애니메이션과 함께 내보낸다.** 후속 작업으로 미루지 않는다.
5. **느낌은 지원하는 가장 느린 기기의 릴리스 빌드에서 판단한다.** 그 밖의 것은 검증으로 치지 않는다.

## 만드는 순서

### 1. 애니메이션을 넣어야 하나?

| 빈도 | 결정 |
| --- | --- |
| 하루 100회 이상(탭 전환, 키보드 열기/닫기, 스크롤, 설정의 토글) | **애니메이션 없음.** 플랫폼 기본값을 쓰거나 아무것도 넣지 않는다. 여기서 멈춘다. |
| 하루 수십 회(누름 피드백, 목록 탐색, 행 선택) | 거의 느껴지지 않을 정도만(150ms 미만, 아니면 아예 없이) |
| 가끔(시트, 모달, 토스트, 온보딩 단계) | 표준 애니메이션 |
| 드묾 / 처음(성공 상태, 빈 상태 일러스트, 축하) | 즐거움 예산은 여기에 쓴다 |

**탭 전환은 절대 슬라이드하지 않는다.** 탭은 계층이 아니라 동등한 관계다. 슬라이드는 있지도 않은 깊이를 암시하고, 사용자는 세션마다 수십 번 그 대가를 치른다. `animation: 'none'`.

요청이 이 관문을 통과하지 못하면 그렇다고 말하고 쓰지 않는다.

### 2. 목적은 무엇인가?

넘어가기 전에 한 단어로 이름을 붙인다. **피드백(feedback)**, **공간적 일관성(spatial consistency)**, **상태 표시(state indication)**, **거슬리는 변화 막기(preventing a jarring change)**, **설명(explanation)**, **즐거움(delight)**(드묾 등급만) 중 하나다.

이름을 대지 못하면 만들지 않는다.

### 3. 도구 고르기: 충분한 것 중 가장 가벼운 것

위에서부터 내려가며 처음 맞는 것에서 멈춘다.

| 필요 | 도구 |
| --- | --- |
| 제스처 없는 상태 기반 변화(누름, 토글, 색, 뒤집히는 값) | **Reanimated CSS 트랜지션** (스타일의 `transitionProperty`) |
| 반복, 여러 단계, 또는 상태 변화 없이 마운트 때 재생 | **Reanimated CSS 애니메이션** (`animationName` 키프레임) |
| 요소의 마운트나 언마운트, 목록의 재배치 | **레이아웃 애니메이션** (`entering` / `exiting` / `itemLayoutAnimation`) |
| 손가락이 닿는 모든 것, 스크롤에서 파생되는 모든 것 | **`useSharedValue` + `Gesture` + `useAnimatedStyle`** |
| 화면에서 화면으로 | **Expo Router의 네이티브 스택 옵션.** 절대 직접 만들지 않는다 |
| 그 자체로 한 화면인 바텀 시트 | **`presentation: 'formSheet'`**. 진짜 UISheetPresentationController라서 공짜이고 정확하다 |
| 탭 바 | **`NativeTabs`** (`expo-router/unstable-native-tabs`에서 가져온다). 플랫폼의 진짜 탭 바이고 동작과 전환까지 포함한다 |
| 컨텍스트 메뉴, 길게 눌러 미리 보기 | **`Link.Menu` / `Link.Preview`** (Expo Router, iOS 전용). 네이티브 메뉴와 미리 보기(peek)이고, JS로 절대 다시 만들지 않는다 |
| 큰 제목으로 접히는 헤더 | 네이티브 스택의 **`headerLargeTitleEnabled`** (iOS 전용, `headerLargeTitle`은 지원 중단). 스크롤 워클릿이 아니다 |
| 당겨서 새로 고침 | **`RefreshControl`**. 앱을 대표하는 상호작용일 때만 직접 만든다(임곗값 레시피 참고) |
| 키보드를 따라가는 UI | **`react-native-keyboard-controller`**. 키보드의 실제 위치를 프레임마다 UI 스레드에서 받는다 |
| 벡터 일러스트, 축하, 빈 상태 | **Lottie**. 일러스트에만 쓰고 UI 상태에는 절대 쓰지 않는다 |
| 거대한 애니메이션 장면, 자유 드로잉 | **`@shopify/react-native-skia`**. 뷰 계층 자체가 병목일 때 쓰는 캔버스 |

공유 값은 값이 연속적이거나 중단 가능할 때만 꺼낸다. 누름 scale은 CSS 트랜지션이다. 드래그는 공유 값이다. 두 상태짜리 토글에 워클릿을 쓰는 것은 페이드 하나에 모션 라이브러리를 설치하는 일의 모바일 판이다.

**의존성.** `npx expo install <package>`로 설치한다. 프로젝트 SDK에 맞는 버전을 찾아 주는데, 그냥 `npm install`은 그러지 않는다.

| 필요 | 패키지 |
| --- | --- |
| 애니메이션 | `react-native-reanimated` + `react-native-worklets` |
| 제스처 | `react-native-gesture-handler` |
| 내비게이션, 시트, 네이티브 탭, 메뉴 | `expo-router` |
| 햅틱 | `expo-haptics` |
| 키보드를 따라가는 UI | `react-native-keyboard-controller` (루트에 `KeyboardProvider`가 필요하다. 키보드 레시피 참고) |
| 일러스트, 축하 | `lottie-react-native` |
| 아주 큰 애니메이션 장면, 커스텀 드로잉 | `@shopify/react-native-skia` |

### 4. 속성 고르기

- **`transform`과 `opacity`는 공짜다.** 나머지는 모두 레이아웃 계산을 거친다. `width`, `height`, `margin`, `padding`, `flex`, `top`, `left`, `gap`은 매 프레임 그 노드*와 형제 노드까지* Yoga를 다시 돌린다.
- **유일한 예외는 자식이 없는 절대 위치 요소다.** 탭의 알약 모양 인디케이터나 진행 막대의 채움 부분이 그렇다. 흐름 밖에 있어서 다른 것이 다시 배치되지 않고, `width`를 애니메이션하면 `scaleX`가 뭉갤 모서리 반경이 그대로 남는다.
- **절대 `scale(0)`을 쓰지 않는다.** `scale(0.9–0.97)` + `opacity: 0`에서 시작한다. 현실에서 아무것도 없는 데서 나타나는 것은 없다.
- **`transform`은 배열이고 순서가 중요하다.** `[{ translateY }, { scale }]`은 이동한 뒤 크기를 바꾼다. 순서를 뒤집으면 이동 거리에도 scale이 곱해진다. 곱해지는 효과를 원하지 않으면 translate를 앞에 둔다.
- **Android 그림자는 `elevation`이고, elevation을 애니메이션하면 매 프레임 그림자를 다시 렌더링한다.** 대신 그림자를 미리 입힌 레이어의 opacity를 애니메이션한다.
- **`BlurView` 강도는 절대 애니메이션하지 않는다.** Android에서는 매 프레임 블러를 다시 렌더링한다. 대신 정적인 `BlurView`의 opacity를 크로스페이드한다.
- **`translate`에는 퍼센트 값이 통하고**, 기준은 요소 자신의 크기다. `translateY('100%')`는 내용이 무엇이든 시트를 자기 높이만큼 옮긴다.

### 5. 타이밍 또는 스프링

**손가락으로 끌거나, 튕기거나, 놓는 것이면 스프링을 쓴다.** 누름 피드백은 이산적인 상태 변화라서 타이밍을 쓴다. 스프링은 중단을 거쳐도 속도를 이어 가고, 타이밍 곡선은 처음부터 다시 시작한다. 그 밖에는 모두 타이밍을 쓴다.

Reanimated 스프링은 Apple의 디자이너용 매개변수 두 개를 그대로 받는다. 질량/강성/감쇠가 아니라 이 형태를 쓴다.

| 상호작용 | 설정 |
| --- | --- |
| 기본 자리 잡기, 오버슈트 없음 | `{ duration: 400, dampingRatio: 1 }` |
| 드래그 후 위치 이동 / 제자리로 튕겨 돌아오기 | `{ duration: 400, dampingRatio: 0.8, velocity }` |
| 시트, 드로어 | `{ duration: 300, dampingRatio: 0.8, velocity }` |
| 단단한 가장자리를 넘으면 안 됨 | `overshootClamping: true` 추가 |

**바운스는 제스처에 관성이 실렸을 때만 쓴다.** 페이드로 나타난 메뉴의 오버슈트는 느낌이 어긋난다. 플릭한 카드의 오버슈트는 느낌이 맞다.

**이징**은 손가락이 닿지 않는 모든 것에 쓴다.

| 상황 | 이징 |
| --- | --- |
| 등장이나 퇴장 | `ease-out` |
| 화면 안 이동 / 모핑 | `ease-in-out` |
| 일정한 모션(진행 표시, 마키) | `linear` |
| 기본 | `ease-out` |

**UI에는 절대 `ease-in`을 쓰지 않는다.** 느리게 시작해서 사용자가 지켜보는 바로 그 순간을 늦춘다. Reanimated 기본 이징은 CSS 기본 이징만큼 약하다. 아래 값을 쓴다.

```js
import { Easing } from 'react-native-reanimated';

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);      // UI용 강한 ease-out
const EASE_IN_OUT = Easing.bezier(0.77, 0, 0.175, 1);  // 화면 안 이동
const EASE_SHEET = Easing.bezier(0.32, 0.72, 0, 1);    // iOS 시트 곡선
```

**지속 시간:**

| 요소 | 지속 시간 |
| --- | --- |
| 누름 피드백 | 100–150ms |
| 토글, 칩, 작은 상태 변화 | 150–200ms |
| 시트, 모달, 드로어 | 스프링, 체감 ~300ms |
| 화면 전환 | 플랫폼 기본값. 덮어쓰지 않는다 |

모바일 UI 애니메이션도 웹과 같이 300ms 미만으로 둔다. 플랫폼 자체 전환은 더 길다(iOS push는 350ms). 내비게이션은 플랫폼에 맞추고, 나머지에서는 플랫폼보다 빠르게 한다.

### 6. JS 스레드에서 떼어 두기

모바일에만 있는 기술이고, 대부분의 React Native 모션이 무너지는 곳이다.

- **제스처나 스크롤 핸들러에서 절대 `setState`를 부르지 않는다.** 프레임마다 React 렌더링이 한 번씩 일어나는 것이 RN 앱 버벅임의 가장 큰 원인이다. 공유 값 → `useAnimatedStyle`로 가면 React는 아예 다시 렌더링하지 않는다.
- **`onUpdate`나 스크롤 핸들러 안에서 절대 RN 런타임 호출을 예약하지 않는다.** `react-native-worklets`의 `scheduleOnRN(fn, ...args)`(지원 중단된 `runOnJS(fn)(...args)`를 대신하는 Reanimated 4의 방식)는 RN 런타임 호출을 큐에 넣고, `onUpdate`에서는 그것이 초당 60–120번이다. 이 호출은 `onEnd`나, 값이 임곗값을 넘을 때 실행되는 `useAnimatedReaction`에 둔다.
- **렌더링 중에 공유 값을 절대 읽지 않는다**(JSX 안의 `translateY.get()`). 절대 갱신되지 않는 스냅숏이라 소리 없이 어긋난다. **렌더링 중에 쓰지도 않는다.** 재조정 도중에 실행되고, 직접 일으키지 않은 리렌더링이 그 쓰기를 다시 실행한다. 공유 값은 워클릿, 핸들러, Effect에서만 건드린다.
- **`.value` 말고 `.get()` / `.set()`을 쓴다.** 같은 API지만 `.value`에 직접 접근하는 형태는 React Compiler가 꿰뚫어 보지 못한다. Reanimated 문서는 `get`/`set`을 컴파일러에 안전한 방식이라고 부른다. `set`은 `sv.set((v) => v + 1)`처럼 함수형 업데이트도 받는다.
- **워클릿에서 부르는 함수는 첫 줄에 `'worklet'`이 있어야 한다.** 없으면 디버거에서는 잘 돌다가 기기에서는 런타임에 예외를 던진다.

### 7. hover가 아니라 누름

웹의 hover 어포던스는 옮겨 오지 말고 모두 새로 설계해야 한다.

- **피드백은 누를 때, 확정은 뗄 때.** 탭이 끝날 때까지 기다렸다가 무언가를 보여 주면 죽은 느낌이 난다. 사용자가 실제로 체감하는 지연이 바로 이것이다.
- 누를 수 있는 모든 요소에 **`scale: 0.97`을 100–150ms 동안** 준다. `Pressable` + CSS 트랜지션이다. `scale`은 라벨과 아이콘까지 함께 줄이고, 그래서 물리적으로 읽힌다.
- **터치 영역은 최소 44×44pt**(Android는 48dp). 보이는 크기가 더 작으면 `hitSlop`을 더한다. 보이는 요소를 키우지 않는다.
- **`pressRetentionOffset`을 둬서** 손가락이 몇 픽셀 흘러도 사용자가 의도한 누름이 취소되지 않게 한다.
- **Android 리플은 Material 스타일 앱에서만 쓴다.** 직접 디자인한 앱에서는 한 플랫폼에만 리플을 넣기보다 두 플랫폼에 같은 scale을 쓰는 편이 더 일관성 있다.

### 8. 햅틱

모바일에는 웹에 없는 감각이 있다. 아껴 쓰면 앱이 고급스럽게 느껴지게 만드는 요소가 되고, 아무 데나 쓰면 사용자가 꺼 버린다.

| 순간 | 호출 |
| --- | --- |
| 값이 한 단계를 넘어갈 때(피커, 슬라이더 디텐트, 세그먼트 컨트롤) | `Haptics.selectionAsync()` |
| 무언가가 제자리에 붙을 때, 시트 디텐트가 걸릴 때, 드래그가 확정될 때 | `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)` |
| 무거운 물체가 내려앉을 때, 파괴적인 동작이 실행될 때 | `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)` |
| 작업이 성공하거나 실패했을 때 | `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success / Error)` |

규칙은 세 가지이고 예외가 없다.

- **시각 효과와 같은 프레임.** 애니메이션보다 늦은 햅틱은 피드백이 아니라 결함으로 읽힌다. 애니메이션이 끝날 때가 아니라 원인이 되는 순간(디텐트가 걸리는 순간)에 실행한다.
- **의미 있는 이벤트 하나에 한 번.** 한 단계, 한 번의 붙음, 한 번의 확정이 그 단위다. 스크롤에도, 프레임마다도, 사용자가 일으키지 않은 등장 애니메이션에도 절대 쓰지 않는다.
- **유일한 피드백으로 쓰지 않기.** 많은 사용자가 햅틱을 시스템 전체에서 꺼 두고, 대부분의 Android 기기에서는 느껴지지 않는다. 시각 효과만으로도 성립해야 한다.

워클릿에서는 햅틱을 RN 런타임으로 넘겨 예약해야 한다. `scheduleOnRN(Haptics.selectionAsync)`.

### 9. 동작 줄이기와 접근성

```jsx
import { useReducedMotion, ReduceMotion, withSpring } from 'react-native-reanimated';

const reduced = useReducedMotion();
const y = useSharedValue(reduced ? 0 : SHEET_HEIGHT);

// 또는 애니메이션마다 정하게 한다
withSpring(0, { duration: 300, dampingRatio: 0.8, reduceMotion: ReduceMotion.System });
```

동작 줄이기는 모션을 0으로 만드는 것이 아니라 **더 적고 더 부드럽게** 만든다는 뜻이다. 상태 변화를 설명하는 opacity와 색 변화는 남기고, 이동, scale, 패럴랙스, 오버슈트는 뺀다. 화면 전환은 `animation: 'fade'`가 된다.

**글자 크기는 바뀐다.** `allowFontScaling`이 기본으로 켜져 있어서, 기본 글자 크기에서 잰 높이는 200%에서 모두 틀린다. 하드코딩한 높이로 애니메이션하지 않는다. `onLayout`으로 재거나, 대신 transform을 애니메이션한다.

## 모션을 소리 없이 망가뜨리는 설정

"애니메이션이 그냥 안 돈다"면 이것부터 확인한다.

- SDK와 버전이 맞도록 Expo를 거쳐 설치한다. `npx expo install react-native-reanimated react-native-worklets`. Expo 프로젝트에서는 `babel-preset-expo`가 worklets Babel 플러그인을 자동으로 설정하므로 `babel.config.js` 단계가 없다. 그 프리셋이 없는 bare RN 프로젝트만 플러그인을 직접 추가하고, 그때는 목록의 맨 마지막에 둬야 한다. 플러그인이 없거나 자리가 틀리면 이제는 조용히 대체 동작으로 넘어가지 않고, 런타임에 `Failed to create a worklet`을 던진다.
- `GestureHandlerRootView`가 앱을 감싸야 한다. 그렇지 않으면 제스처가 오류 없이 아무것도 하지 않는다.
- Reanimated 4는 New Architecture가 필요하다.
- **Expo Go는 성능 환경이 아니다.** 느낌은 릴리스 빌드에서 판단한다. 개발 빌드의 JS 스레드는 찾으려는 바로 그 문제를 가릴 만큼 느리다.

## 120fps

ProMotion iPhone에서는 `CADisableMinimumFrameDurationOnPhone`을 설정하지 않으면 서드파티 애니메이션이 60fps로 제한된다. 최근 Expo SDK는 기본으로 설정한다. 있는지 확인하고 없으면 추가한다.

```json
{ "expo": { "ios": { "infoPlist": { "CADisableMinimumFrameDurationOnPhone": true } } } }
```

그러면 프레임 예산은 16이 아니라 8ms다. UI 스레드 애니메이션이 웹보다 모바일에서 더 중요한 이유이기도 하다.

## 레시피

바로 만들 수 있는 구현(누름 피드백, 끌어서 닫는 시트, 밀어서 삭제, 접히는 헤더, 목록 등장, 키보드와 맞물린 UI, 탭 인디케이터, 화면 전환)은 [RECIPES.md](RECIPES.md)에 있다. 요청이 그중 하나와 맞을 때마다 불러온다. 빈 파일이 아니라 레시피에서 시작한다.

## 절대 내보내지 말 것

| 금지 | 대신 |
| --- | --- |
| `PanResponder` | gesture-handler의 `Gesture.Pan()` |
| 제스처나 스크롤 핸들러 안의 `setState` | 공유 값 + `useAnimatedStyle` |
| `runOnJS`(Reanimated 4에서 지원 중단) | `react-native-worklets`의 `scheduleOnRN` |
| 프레임마다 부르는 `scheduleOnRN` | `onEnd`, 또는 임곗값에서 `useAnimatedReaction` |
| 렌더링 중 공유 값 읽기나 쓰기 | 워클릿, 핸들러, Effect 안의 `.get()` / `.set()` |
| 손가락이 닿는 요소에 코어 `Animated` | Reanimated |
| `height` / `width` / `margin` / `flex` / `top` 애니메이션 | `transform` + `opacity`(자식 없는 절대 위치 요소는 예외) |
| `BlurView` 강도나 Android `elevation` 애니메이션 | 정적 레이어 크로스페이드 |
| 가상화 목록 행의 `entering` | 컨테이너에 애니메이션, 또는 `itemLayoutAnimation` |
| JS로 다시 만든 화면 전환 | 네이티브 스택 `animation` |
| 탭 사이 슬라이드 | `animation: 'none'` |
| UI 요소의 `Easing.in(...)` | `Easing.bezier(0.23, 1, 0.32, 1)` |
| `scale(0)` 등장 | `scale(0.95)` + `opacity: 0` |
| 거리만 보는 닫기 임곗값 | 속도 **또는** 거리. 플릭이면 충분하다 |
| 경계에서 급정지 | 러버밴딩(rubber-band) 저항 |
| 프레임마다, 또는 유일한 피드백으로 쓰는 햅틱 | 확정마다 한 번, 늘 시각 효과와 짝지어 |
| Expo Go나 시뮬레이터에서 느낌 판단 | 릴리스 빌드, 지원하는 가장 느린 기기 |

## 출력

코드를 쓴다. 그다음 많아야 몇 줄로 다음을 적는다.

- **관문 결과**: 빈도 등급과 이름 붙인 목적. 무엇을 거절했고 왜인지 말한다.
- **재료**: 도구, 속성, 스프링 또는 곡선 + 지속 시간, 스레드.
- **기기에서 체감 확인할 것**: 제스처, 속도 인계, 햅틱 타이밍은 코드로 판단할 수 없다. 해 볼 것을 적는다. 플릭해 보고, 움직이는 도중에 끊어 보고, 방향을 뒤집어 보고, 가진 것 중 가장 느린 Android에서 돌려 본다.

산출물은 코드다. 보고서로 부풀리지 않는다.

## 어조

의견은 분명하게, 말은 짧게 한다. 솔직한 답이 "이건 애니메이션을 넣으면 안 된다"나 "맞는지 말하려면 실제 기기가 필요하다"라면 그대로 답한다.
