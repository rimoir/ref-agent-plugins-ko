# HTML 보고서 형식

아키텍처 리뷰는 OS 임시 디렉터리에 독립 실행되는 HTML 파일 하나로 만든다. Tailwind와 Mermaid는 모두 CDN에서 불러온다. 그래프 형태의 다이어그램은 Mermaid가 안정적으로 그린다. 편집 디자인 성격이 강한 시각 자료(크기 비교 다이어그램, 단면도)는 직접 만든 div와 인라인 SVG로 그린다. 둘을 섞어 쓴다. 모든 것을 Mermaid로 그리면 보고서가 밋밋하고 획일적으로 보이기 시작한다.

## 기본 구조

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Architecture review for {{repo name}}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script type="module">
      import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
      mermaid.initialize({ startOnLoad: true, theme: "neutral", securityLevel: "loose" });
    </script>
    <style>
      /* Tailwind로 깔끔하게 처리하기 어려운 것만 담는 작은 사용자 정의 스타일:
         점선 교체 지점 선, 손으로 그린 느낌의 화살촉 등 */
      .seam { stroke-dasharray: 4 4; }
      .leak { stroke: #dc2626; }
      .deep { background: linear-gradient(135deg, #0f172a, #1e293b); }
    </style>
  </head>
  <body class="bg-stone-50 text-slate-900 font-sans">
    <main class="max-w-5xl mx-auto px-6 py-12 space-y-12">
      <header>...</header>
      <section id="candidates" class="space-y-10">...</section>
      <section id="top-recommendation">...</section>
    </main>
  </body>
</html>
```

## 머리글

저장소 이름, 날짜, 짧은 범례를 넣는다. 범례: 실선 상자 = 모듈, 점선 = 교체 지점(seam), 빨간 화살표 = 누수(세부 구현이 교체 지점 밖으로 새어 나가는 것), 두껍고 어두운 상자 = 깊은 모듈. 소개 문단은 넣지 않는다. 바로 후보로 들어간다.

## 후보 카드

내용은 주로 다이어그램으로 전달한다. 글은 적고 쉽게 쓰며, `/codebase-design` 스킬의 용어집 용어를 격식 없이 바로 쓴다.

후보 하나는 `<article>` 하나다.

- **제목**: 짧게, 무엇을 깊게 만드는지 이름을 붙인다(예: "Order 접수 파이프라인을 하나로 합치기").
- **배지 줄**: 추천 강도(`Strong` = 에메랄드, `Worth exploring` = 앰버, `Speculative` = 슬레이트)와 의존성 유형 태그(`in-process`, `local-substitutable`, `ports & adapters`, `mock`)를 넣는다.
- **파일**: 고정폭 글꼴 목록으로 쓴다(`font-mono text-sm`).
- **변경 전·후 다이어그램**: 카드의 중심 요소다. 두 열을 나란히 놓는다. 아래 패턴을 본다.
- **문제**: 무엇이 불편한지 한 문장으로 쓴다.
- **해결책**: 무엇이 바뀌는지 한 문장으로 쓴다.
- **효과**: 글머리표로 쓰고 각 항목은 6단어 이하로 한다. 예: "테스트가 인터페이스 하나만 거친다", "가격 로직 누수가 사라진다", "얕은 래퍼 4개를 지운다".
- **ADR 안내**(해당할 때만): 앰버 색조 상자 안에 한 줄로 쓴다.

설명 문단을 쓰지 않는다. 다이어그램을 이해하는 데 문단이 필요하다면 다이어그램을 다시 그린다.

## 다이어그램 패턴

후보에 맞는 패턴을 고른다. 여러 패턴을 섞는다. 모든 다이어그램을 똑같은 모양으로 만들지 않는다. 다양하게 만드는 것도 목적의 일부다.

### Mermaid 그래프(의존성과 호출 흐름을 그릴 때 기본으로 쓰는 방식)

"X가 Y를 호출하고 Y가 Z를 호출하는데, 이렇게 엉켜 있다"를 보여 주려면 Mermaid `flowchart`나 `graph`를 쓴다. 보고서의 다른 부분과 어울리도록 Tailwind로 꾸민 카드 안에 넣는다. classDef로 누수 간선은 빨간색, 깊은 모듈은 어두운 색으로 칠한다. "변경 전: 왕복 6번, 변경 후: 1번"을 보여 줄 때는 시퀀스 다이어그램이 잘 맞는다.

```html
<div class="rounded-lg border border-slate-200 bg-white p-4">
  <pre class="mermaid">
    flowchart LR
      A[OrderHandler] --> B[OrderValidator]
      B --> C[OrderRepo]
      C -.leak.-> D[PricingClient]
      classDef leak stroke:#dc2626,stroke-width:2px;
      class C,D leak
  </pre>
</div>
```

### 직접 만든 상자와 화살표(Mermaid 레이아웃이 원하는 대로 나오지 않을 때)

모듈은 테두리와 라벨이 있는 `<div>`로 만든다. 화살표는 `relative` 컨테이너 위에 `absolute`로 배치한 인라인 SVG `<line>`이나 `<path>` 요소로 만든다. "변경 후" 다이어그램을 내부가 흐리게 처리된, 테두리가 두꺼운 깊은 모듈 하나로 보여 주고 싶을 때 이 방식을 쓴다. Mermaid로는 그런 무게감을 제대로 표현할 수 없다.

### 단면도(계층이 겹겹이 얕을 때 적합)

가로 띠(`h-12 border-l-4`)를 쌓아 호출이 거쳐 가는 계층을 보여 준다. 변경 전에는 각각 아무 일도 하지 않는 얇은 계층 6개를 그린다. 변경 후에는 합쳐진 책임을 라벨로 단 두꺼운 띠 1개를 그린다.

### 크기 비교 다이어그램("인터페이스가 구현만큼 넓다"를 보여 줄 때 적합)

모듈마다 사각형 두 개를 그린다. 하나는 인터페이스 면적, 하나는 구현이다. 변경 전: 인터페이스 사각형이 구현 사각형과 거의 같은 높이다(얕음). 변경 후: 인터페이스 사각형은 짧고 구현 사각형은 길다(깊음).

### 호출 그래프 합치기

변경 전: 함수 호출 트리를 중첩된 상자로 그린다. 변경 후: 같은 트리를 상자 하나로 합치고, 이제 내부 호출이 된 것들을 그 안에 흐리게 표시한다.

## 스타일 지침

- 기업용 대시보드가 아니라 잡지 기사 같은 편집 디자인에 가깝게 만든다. 여백을 넉넉히 둔다. 제목에는 세리프 글꼴을 써도 된다(`font-serif`는 stone/slate 색과 잘 어울린다).
- 색은 아껴 쓴다. 강조색 하나(에메랄드나 인디고)에 누수는 빨간색, 경고는 앰버를 더한다.
- 변경 전·후 다이어그램이 스크롤 없이 나란히 편하게 들어가도록 다이어그램 높이를 약 320px로 맞춘다.
- 다이어그램 안의 모듈 라벨에는 `text-xs uppercase tracking-wider`를 써서 UI가 아니라 설계도처럼 보이게 한다.
- 스크립트는 Tailwind CDN과 Mermaid ESM import만 쓴다. 그 밖에 보고서는 정적이다. 앱 코드를 넣지 않고, Mermaid 자체 렌더링 외에는 상호작용을 넣지 않는다.

## 최우선 추천 섹션

더 큰 카드 하나를 만든다. 후보 이름, 그 후보를 고른 이유 한 문장, 해당 카드로 가는 앵커 링크를 넣는다. 그 밖에는 넣지 않는다.

## 문체

쉬운 말로 간결하게 쓰되, 아키텍처를 가리키는 명사와 동사는 `/codebase-design` 스킬의 용어를 그대로 쓴다. 간결하게 쓴다고 해서 용어를 벗어나도 되는 것은 아니다.

**정확히 이 용어를 쓴다:** 모듈(module), 인터페이스(interface), 구현(implementation), 깊이(depth), 깊은(deep), 얕은(shallow), 교체 지점(seam), 어댑터(adapter), 활용도(leverage), 지역성(locality).

**절대 바꿔 쓰지 않는다:** 컴포넌트, 서비스, 유닛(모듈 대신) · API, 시그니처(인터페이스 대신) · 경계(교체 지점 대신) · 계층, 래퍼(모듈을 뜻할 때 모듈 대신).

**이 문체에 맞는 표현:**

- "Order 접수 모듈은 얕다: 인터페이스가 구현과 거의 같다."
- "가격 계산이 교체 지점 밖으로 새어 나간다."
- "깊게 만든다: 인터페이스 하나, 테스트할 곳 하나."
- "어댑터가 두 개이므로 교체 지점을 둘 이유가 있다: 운영 환경에서는 HTTP, 테스트에서는 인메모리."

**효과 글머리표**는 얻는 이득을 용어집 용어로 적는다. 예: *"지역성: 버그가 모듈 하나에 모인다"*, *"활용도: 인터페이스 하나, 호출 지점 N곳"*, *"인터페이스가 줄고 구현이 래퍼를 흡수한다"*. *"유지보수가 쉬워진다"*나 *"코드가 깔끔해진다"*처럼 쓰지 않는다. 용어집에 없는 말이고 넣을 이유가 없다.

얼버무리지 않는다. 본론 앞에 서두를 붙이지 않고, "참고로 말하자면…" 같은 표현을 쓰지 않는다. 글머리표로 쓸 수 있는 문장은 글머리표로 쓴다. 뺄 수 있는 글머리표는 뺀다. 쓰려는 용어가 `/codebase-design` 용어집에 없으면 새 용어를 만들기 전에 용어집에 있는 말을 먼저 찾는다.
