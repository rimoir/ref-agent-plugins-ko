# Sonner API 참조

정확한 prop, 타입, 기본값을 정리한다. `toast()`에 넘긴 옵션은 Toaster의 `toastOptions`로 설정한 같은 옵션보다 우선한다.

## `<Toaster />`

| prop | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `theme` | `string` | `'light'` | `'light'`, `'dark'`, `'system'` 중 하나다. |
| `richColors` | `boolean` | `false` | 오류와 성공 상태를 더 화려하게 만든다. |
| `expand` | `boolean` | `false` | 토스트를 기본으로 펼친다(아니면 hover할 때 펼쳐진다). |
| `visibleToasts` | `number` | `3` | 보이는 토스트의 개수다. |
| `id` | `string` | – | Toaster id다. `toast()`의 `toasterId` 옵션이 이 값을 대상으로 삼는다. |
| `position` | `string` | `'bottom-right'` | `top-left`, `top-center`, `top-right`, `bottom-left`, `bottom-center`, `bottom-right` 중 하나다. |
| `closeButton` | `boolean` | `false` | 모든 토스트에 닫기 버튼을 단다. |
| `offset` | `string \| number \| object` | `'24px'` | 화면 가장자리로부터의 간격이다. 객체로 주면 면마다 지정한다(`{ bottom: '24px', right: '16px' }`). |
| `mobileOffset` | `string \| number \| object` | `'16px'` | 화면 너비가 600px 미만일 때의 간격이다. |
| `swipeDirections` | `array` | position에 따라 다름 | 밀어서 닫기를 허용하는 방향이다. |
| `dir` | `'ltr' \| 'rtl' \| 'auto'` | 문서 방향 | 텍스트 방향이다. |
| `hotkey` | `string[]` | `['altKey', 'KeyT']` | Toaster 영역에 포커스를 주는 키보드 단축키다. |
| `invert` | `boolean` | `false` | 라이트 모드에서는 어두운 토스트를, 다크 모드에서는 밝은 토스트를 보여 준다. |
| `toastOptions` | `object` | – | 모든 토스트에 적용할 기본 옵션이다(아래 `toast()` 옵션 무엇이든 된다). |
| `gap` | `number` | `14` | 펼쳤을 때 토스트 사이의 간격이다. |
| `icons` | `object` | – | 기본 아이콘을 바꾼다(`{ success, info, warning, error, loading }`). `null`을 주면 해당 아이콘을 없앤다. |
| `containerAriaLabel` | `string` | `'Notifications'` | 토스트 컨테이너의 ARIA 라벨이다. |

## `toast()` 옵션

`toast(message, options)`: message는 문자열, JSX, 또는 JSX를 반환하는 함수다. 토스트의 id를 반환한다.

| 옵션 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `description` | `ReactNode` | – | 제목 아래에 렌더링된다. JSX를 반환하는 함수도 받는다. |
| `closeButton` | `boolean` | `false` | 닫기 버튼을 단다. |
| `invert` | `boolean` | `false` | 라이트 모드에서는 어두운 토스트를, 다크 모드에서는 밝은 토스트를 보여 준다. |
| `duration` | `number` | `4000` | 자동으로 닫히기까지의 밀리초다. `Infinity`면 토스트가 계속 남는다. |
| `position` | `string` | `'bottom-right'` | 이 토스트의 위치다. |
| `dismissible` | `boolean` | `true` | `false`면 사용자가 토스트를 닫을 수 없다. |
| `icon` | `ReactNode` | – | 텍스트 앞의 아이콘이다. `null`이면 기본 아이콘을 없앤다. |
| `action` | `ReactNode \| { label, onClick }` | – | 주 버튼이다. `onClick`이 `event.preventDefault()`를 호출하지 않으면 클릭할 때 토스트가 닫힌다. |
| `cancel` | `ReactNode \| { label, onClick }` | – | 보조 버튼이다. 클릭하면 토스트가 닫힌다. |
| `actionButtonStyle` | `object` | `{}` | 액션 버튼의 스타일이다. |
| `cancelButtonStyle` | `object` | `{}` | 취소 버튼의 스타일이다. |
| `id` | `string \| number` | – | 직접 정하는 id다. 같은 id로 `toast()`를 다시 호출하면 기존 토스트가 업데이트된다. |
| `testId` | `string` | – | e2e 테스트용 `data-testid`로 렌더링된다. |
| `toasterId` | `string` | – | 이 토스트를 렌더링할 Toaster의 id다. |
| `style` | `object` | – | 토스트의 인라인 스타일이다. |
| `classNames` | `object` | – | 부위별 클래스다(`{ toast, title, description, actionButton, cancelButton, closeButton }`). `unstyled`가 아니면 `!important`가 필요하다. |
| `unstyled` | `boolean` | `false` | 기본 스타일을 모두 없앤다. |
| `onDismiss` | `(toast) => void` | – | 닫기 버튼을 클릭하거나, 토스트를 밀어서 없애거나, `toast.dismiss()`로 닫을 때 발생한다. |
| `onAutoClose` | `(toast) => void` | – | `duration`이 지나 토스트가 자동으로 닫힐 때 발생한다. |

## 함수

| 함수 | 용도 |
| --- | --- |
| `toast(message, opts?)` | 토스트를 렌더링한다. 토스트의 id를 반환한다. |
| `toast.success / .error / .info / .warning(message, opts?)` | 타입에 맞는 아이콘이 붙은 토스트다. |
| `toast.loading(message, opts?)` | 스피너가 있는 토스트다. id로 업데이트한다. |
| `toast.promise(promise, { loading, success, error })` | promise의 결과에 따라 바뀌는 로딩 토스트다. `success`/`error`에는 문자열, JSX, 결과를 받는 함수, 토스트 옵션 객체를 넣을 수 있다. |
| `toast.custom((t) => jsx, opts?)` | 헤드리스 토스트다. JSX는 직접 쓰고 동작은 Sonner가 맡는다. |
| `toast.dismiss(id?)` | 토스트 하나를 닫는다. id 없이 호출하면 전부 닫는다. |
| `toast.getToasts()` | 모든 활성 토스트를 돌려준다. React 밖에서도 쓸 수 있다. `toast.getHistory()`는 닫힌 토스트까지 포함한다. |
| `useSonner()` | `{ toasts }`를 반환하는 React 훅이다. |
