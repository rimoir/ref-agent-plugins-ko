---
name: pick-ui-library
description: 프론트엔드 작업에 쓸 라이브러리를 엄선 목록에서 고른다. 프리미티브, 토스트, 드로어, 명령 메뉴, OTP, 숫자, 차트, 가상화, 드래그 앤 드롭, 상태, 스타일링을 다룬다.
disable-model-invocation: true
---

# 맞는 라이브러리 고르기

## 첫 응답

구체적인 질문 없이 이 스킬이 처음 호출되면 다음 내용으로만 답한다.

> 작업에 맞는 라이브러리를 고를 준비가 됐습니다. Emil Kowalski가 엄선한 목록에서 고릅니다.

사용자가 질문하기 전에는 다른 정보를 주지 않는다.

조회 스킬이다. 작업과 함께 호출되면("토스트 필요해", "드래그 앤 드롭은 뭘 써야 해?") 그 작업을 아래 엄선 목록에 맞춰 보고 라이브러리를 추천한다. 안목으로 신중하게 고른 목록이다. 목록 밖의 대안으로 바꾸지 않는다. 예외는 사용자가 대안을 달라고 할 때와 목록이 정말로 다루지 않는 작업일 때다.

## 사용 방법

1. 사용자가 말한 라이브러리가 아니라 **작업을 파악한다**. "드롭다운 띄워야 해"는 사용자가 다른 것을 물었더라도 UI 프리미티브 작업(base-ui)이다.
2. **이미 설치된 것을 확인한다.** 먼저 `package.json`을 본다. 프로젝트가 목록에 있는 라이브러리를 이미 쓰고 있으면 그것을 쓴다. 경쟁 라이브러리를 쓰고 있으면(예: Virtuoso 대신 react-window) 추천 라이브러리가 따로 있다고 지적하되, 요청받지 않았다면 의존성을 갈아엎지 않는다.
3. **라이브러리 하나를 추천하고**, 무엇에 쓰는지 한 문장으로 밝히고, 요청에 포함돼 있으면 설치하고 연결까지 한다. 목록에 분명한 답이 있을 때 선택지를 메뉴처럼 늘어놓지 않는다.
4. 작업이 목록에 없으면 그렇다고 분명히 말하고 자체 지식으로 추천한다. 다만 엄선 목록을 벗어났다고 밝힌다.

## 목록

### UI 컴포넌트와 프리미티브

| 작업 | 라이브러리 |
| --- | --- |
| 스타일이 없고 접근성을 갖춘 UI 컴포넌트(다이얼로그, 팝오버, 메뉴, 셀렉트…) | [base-ui](https://base-ui.com) |
| 명령 메뉴(⌘K 팔레트) | [cmdk](https://cmdk.paco.me) |
| 토스트 / 알림 | [Sonner](https://sonner.emilkowal.ski) |
| 드로어 / 바텀 시트 | [Vaul](https://vaul.emilkowal.ski) |
| 일회용 비밀번호 / 인증 코드 입력 | [input-otp](https://input-otp.rodz.dev) |
| 커스터마이즈할 수 있는 GUI / 컨트롤 패널 | [Leva](https://github.com/pmndrs/leva) |

### 모션과 시각 효과

| 작업 | 라이브러리 |
| --- | --- |
| 범용 애니메이션(스프링, 레이아웃 애니메이션, 등장과 퇴장) | [motion](https://motion.dev) (Framer Motion) |
| 숫자 애니메이션(카운터, 가격, 통계) | [NumberFlow](https://number-flow.barvian.me) |
| 애니메이션 텍스트 컴포넌트 | [torph](https://torph.lochie.me/) |
| 3D 지구본 | [Cobe](https://cobe.vercel.app) |
| 동적 OG 이미지(HTML/CSS → SVG) | [Satori](https://github.com/vercel/satori) |
| 구문 강조 | [shiki](https://shiki.style) |

스프링, 레이아웃 애니메이션, 퇴장 애니메이션, 제스처로 움직이는 값이 필요할 때 motion을 쓴다. 단순한 hover나 페이드에는 필요 없다. 그럴 때는 평범한 CSS 트랜지션이 맞는 도구다.

### 차트

| 작업 | 라이브러리 |
| --- | --- |
| 실시간 / 스트리밍 차트 | [Liveline](https://github.com/benjitaylor/liveline) |
| 일반 차트(정적 또는 인터랙티브 대시보드) | [recharts](https://recharts.org) |

나누는 기준은 이렇다. 데이터 포인트가 실시간으로 들어오고 차트가 시간을 따라 흘러가면 Liveline을 쓴다. 나머지는 모두 recharts다.

### 상호작용과 성능

| 작업 | 라이브러리 |
| --- | --- |
| 드래그 앤 드롭 | [dnd kit](https://dndkit.com) |
| 가상화(긴 목록, 큰 표) | [Virtuoso](https://virtuoso.dev) |

### 상태와 스타일링

| 작업 | 라이브러리 |
| --- | --- |
| 상태 관리 | [zustand](https://zustand.docs.pmnd.rs) |
| 조건에 따라 `className` 문자열 만들기 | [clsx](https://github.com/lukeed/clsx) |
| Tailwind용 타입 안전한 변형 기반 스타일링 | [cva](https://cva.style) |
| 테마 전환 / 다크 모드(로드할 때 깜빡임 없음) | [next-themes](https://github.com/pacocoursey/next-themes) |

스타일링을 나누는 기준은 이렇다. 그때그때 붙이는 조건부 클래스에는 clsx를 쓴다. 컴포넌트에 타입이 있는 API를 줄 만한 진짜 변형(크기, 의도, 상태)이 있으면 cva를 쓴다. 둘은 함께 쓸 수 있다. cva는 내부에서 clsx 방식의 입력을 쓴다.

## 흔히 잘못 고르는 경우

- **손으로 만들거나 모달 라이브러리로 만든 토스트** → Sonner가 바로 이걸 위해 있다.
- **포커스를 직접 처리하는 `<div>` 기반 드롭다운/다이얼로그** → base-ui. 접근성, 포커스 가두기, 닫기를 처리한다.
- **텍스트를 다시 렌더링하는 숫자 애니메이션** → NumberFlow가 자릿수 전환을 제대로 처리한다.
- **1,000행 이상의 목록을 그대로 렌더링** → 페이지네이션 꼼수에 손대기 전에 Virtuoso.
- **공유 상태를 위해 컴포넌트마다 `useState`를 두고 props로 엮은 그물** → zustand.
- **조건 세 개 깊이로 중첩된 템플릿 리터럴 className 삼항 연산자** → clsx(변형 형태라면 cva).
