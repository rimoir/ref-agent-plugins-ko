---
name: ask-sonner
description: React 토스트 라이브러리 Sonner를 안내한다. Toaster 설치와 연결, 알맞은 toast() 호출 고르기, promise 토스트와 로딩 토스트, 토스트 업데이트·닫기·지속, 스타일링, 테마, 아이콘, 위치 지정, 여러 Toaster를 다룬다. Sonner로 작업하거나 Sonner 문제를 해결할 때 쓴다. 토스트가 나타나지 않거나, 두 번 나타나거나, 스타일을 잃거나, Tailwind 클래스를 무시하거나, 모달 뒤에 깔리거나, 다크 모드를 따르지 않을 때가 그렇다.
---

# Sonner로 작업하기

## 첫 응답

구체적인 질문 없이 이 스킬이 처음 호출되면 다음 내용으로만 답한다.

> Sonner 설정, 스타일링, 문제 해결을 도울 준비가 됐습니다. Sonner를 만든 Emil Kowalski의 지식을 바탕으로 합니다.

사용자가 질문하기 전에는 다른 정보를 주지 않는다.

토스트 라이브러리 [Sonner](https://sonner.emilkowal.ski)를 안내하는 스킬이다. 작업이 Sonner와 관련되면(연결, 토스트 렌더링, 스타일링, 수정) 먼저 이 파일을 근거로 답한다. `<Toaster />`와 `toast()`의 전체 prop 표는 [API.md](API.md)에 있다. 정확한 prop 이름, 타입, 기본값이 필요할 때 읽는다.

## 설정

필요한 것은 딱 두 가지다.

1. **한 번만 마운트한 `<Toaster />` 하나**: 가능한 한 루트 가까이에 둔다(Next.js에서는 `layout.tsx`, 서버 컴포넌트 안에서도 동작한다). 페이지마다 렌더링하거나 조건부로 렌더링하는 일은 절대 하지 않는다. Toaster가 하나 더 마운트되면 모든 토스트가 두 번씩 나온다.
2. **클라이언트 코드에서 부르는 `toast()`**: 이벤트 핸들러, Effect, 콜백에서 부른다. 평범한 함수라 훅도 프로바이더도 필요 없다. 하지만 서버에서는 아무 일도 하지 않는다. 서버 액션에서는 결과를 반환하고 그 결과를 받는 클라이언트 코드에서 `toast()`를 호출한다.

```jsx
import { Toaster } from 'sonner'; // 한 번, 레이아웃에서
import { toast } from 'sonner';   // 클라이언트 쪽 어디서나
```

## 알맞은 호출 고르기

| 원하는 것 | 호출 |
| --- | --- |
| 일반 메시지 | `toast('Title')`, 둘째 줄이 필요하면 `{ description }` 추가 |
| 성공 / 오류 / 정보 / 경고 아이콘 | `toast.success('…')`, `toast.error('…')` 등 |
| 상태를 직접 관리하는 동안 보여 줄 스피너 | `toast.loading('…')` 뒤 id로 업데이트 |
| promise에 묶인 로딩 → 성공/오류 | `toast.promise(promise, { loading, success, error })`(success/error에는 resolve된 값/오류를 받는 함수도 가능) |
| 무언가를 하는 버튼 | `{ action: { label, onClick } }`(`onClick`이 `event.preventDefault()`를 호출하지 않으면 토스트가 닫힘), 보조 버튼은 `cancel` |
| 커스텀 JSX, 기본 토스트 틀 | `toast(<jsx />)` |
| 커스텀 JSX, 스타일 전혀 없음 | `toast.custom((t) => <jsx />)`(헤드리스, 닫을 때 쓸 id는 `t`에서 얻음) |

## 레시피

**토스트 업데이트**: 같은 `id`로 `toast()`를 다시 호출한다. 넘긴 prop만 바뀐다. `toast.success(…, { id })`로 바꿔 부르면 타입이 바뀐다. `toast.promise` 없이 로딩 → 성공 흐름을 만드는 방법이 이것이다.

```jsx
const id = toast.loading('Uploading…');
toast.success('Uploaded', { id });
```

**지속**: `{ duration: Infinity }`. **닫기**: `toast.dismiss(id)`, 전부 닫으려면 `toast.dismiss()`. **활성 토스트 읽기**: React 안에서는 `useSonner()`, 밖에서는 `toast.getActiveToasts()`.

**텍스트 안의 링크나 컴포넌트**: 제목이나 설명에 함수를 넘긴다. `toast(() => <a href="…">View</a>)`처럼 쓴다.

**여러 Toaster**: 각각에 `id`를 주고 `toast('…', { toasterId: 'canvas' })`로 대상을 지정한다. `toasterId`가 없으면 모든 Toaster가 그 토스트를 렌더링한다.

**닫기 콜백**: `onDismiss`는 닫기 버튼이나 스와이프로 닫힐 때 발생한다. `onAutoClose`는 시간이 다 되면 발생한다. 둘은 별개다. 하나로 된 '닫힘' 콜백은 없다.

## 스타일링: 단계 사다리

변경에 필요한 만큼만 올라간다. 너무 일찍 맨 윗단으로 뛰어오르는 것은 괜찮지만(권장하는 최종 상태다), 중간에 머무르는 것은 괜찮지 않다.

1. **기본값**: 성공/오류를 화려하게 하려면 Toaster에 `richColors`를, 테마와 반대로 뒤집으려면 `invert`를 더한다.
2. **인라인 조정**: Toaster에 `toastOptions={{ style: {…} }}`를 주면 모든 토스트에 적용되고, `toast()` 호출마다 `style`을 주면 그 토스트에만 적용된다.
3. **부위별 클래스**: `toastOptions={{ classNames: { toast, title, description, actionButton, cancelButton, closeButton } }}`. Sonner가 주입한 스타일이 캐스케이드에서 이기므로 모든 클래스에 `!important`가 필요하다(Tailwind에서는 `!text-red-900`). important를 붙일 곳이 몇 군데를 넘어가면 멈추고 헤드리스로 간다.
4. **헤드리스**: 직접 만든 JSX로 `toast.custom()`을 쓰고 Sonner의 위치 지정, 쌓기, 스와이프는 그대로 쓴다. 디자인 시스템용 토스트에 권하는 방식은 이것을 직접 만든 `toast()` 추상화로 감싸는 것이다. (`unstyled: true`라는 중간 단계도 있지만, 같은 노력이면 헤드리스 쪽이 더 많이 제어할 수 있다.)

**아이콘**: 타입별 기본 아이콘은 Toaster의 `icons` prop으로, 토스트별 아이콘은 `icon`으로 바꾸고 `null`로 없앤다.

**테마**: `theme`의 기본값은 `'light'`이고 OS 설정을 따라가지 않는다. `theme="system"`을 넘기거나 테마 프로바이더를 연결한다. `next-themes`라면 `<Toaster theme={resolvedTheme} />`처럼 쓴다.

## 문제 해결

| 증상 | 원인 → 해결 |
| --- | --- |
| 토스트가 아예 나타나지 않음 | `<Toaster />`가 마운트되지 않았거나 언마운트됐다(조건부 렌더링, 페이지별 배치). 루트에 하나 마운트한다. 서버 액션에서 호출한다면, `toast()`는 클라이언트 전용이다. 클라이언트에서 액션 결과를 가지고 호출한다. |
| 같은 토스트가 두 번 나타남 | Toaster가 두 개 마운트됐다(레이아웃과 페이지 **양쪽**). 하나만 남긴다. 또는 React StrictMode가 개발 모드에서 두 번 호출하는 Effect 안에서 `toast()`가 실행됐다. 대신 이벤트 핸들러에서 실행하거나, 안정적인 `id`를 넘겨 두 번째 호출이 토스트를 복제하지 않고 업데이트하게 한다. |
| Tailwind/CSS 클래스가 먹히지 않음 | 기본 스타일이 덮어쓴다. `!important`를 붙이거나 `unstyled` / 헤드리스를 쓴다(위 사다리 참고). |
| 토스트가 스타일이 하나도 적용되지 않은 채 렌더링됨(Astro, view transitions에서 흔함) | Sonner가 주입한 스타일시트가 사라졌다. 레이아웃에서 `import 'sonner/dist/styles.css'`로 명시적으로 불러온다. |
| Shadow DOM 안에서 스타일이 없음 | 스타일이 shadow root가 아니라 `document.head`에 들어간다. 텍스트에 `[data-sonner-toaster]`가 들어 있는 style 태그를 shadow root로 복사한다. |
| 모달/오버레이 뒤에 깔리거나 잘리는 토스트 | 조상 요소가 쌓임 맥락을 만들거나(`transform`, `filter`, `overflow`) 오버레이의 z-index가 Toaster보다 높다. `<Toaster />`를 dialog/portal 컨테이너 바깥의 문서 루트로 옮긴다. |
| 다크 모드가 무시됨 | `theme`의 기본값이 `'light'`다. `theme="system"`을 설정하거나 resolve된 테마를 넘긴다(위 테마 참고). |
| 성공/오류가 초록/빨강이 아니라 회색으로 보임 | 그게 기본값이다. Toaster에 `richColors`를 더한다. |
| 토스트가 닫히지 않음 | `duration: Infinity`나 `dismissible: false`가 있거나, promise가 끝나지 않는 `toast.promise`다. 로딩 토스트가 끝없이 기다린다. |
| 로딩에서 멈춘 `toast.promise` | 첫 인자로 promise(또는 promise를 반환하는 함수)가 필요하고, 그 promise가 실제로 resolve/reject되어야 한다. |
| 밀어서 닫기 방향이 틀림 / 동작하지 않음 | 방향은 `position`에서 정해진다. Toaster의 `swipeDirections`로 덮어쓴다. |
| 토스트가 모든 Toaster에 나타남 | Toaster가 여럿이면 대상을 지정해야 한다. Toaster마다 `id`를 주고 `toast()` 호출에 `toasterId`를 넘긴다. |
| 모바일에서 화면 가장자리에 너무 붙는 토스트 | `offset`(데스크톱, 기본값 32px)과 `mobileOffset`(<600px, 기본값 16px)을 쓴다. 숫자, CSS 문자열, 면마다 값을 주는 객체를 받는다. |
