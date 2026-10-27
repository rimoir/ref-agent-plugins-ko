# 차트 렌더하기

보여 주는 `.mmd` 파일은 모두 npm 패키지 `pele@1.9.0`으로 렌더하고 사용자에게 SVG를 준다. Pele는 저장소 밖에 한 번만 설치한다. SVG는 각 `.mmd` 파일 옆에 같은 이름으로 쓴다. API는 https://pele.run/api 에 있다. `render`의 옵션으로 `{ limit: 1_000_000, outputLimit: 8_000_000, maxEdges: 10_000 }`을 넘긴다. Pele의 기본값은 상태 500개짜리 차트보다 작을 수 있다. Pele가 `PeleError`를 던지면 사용자에게 Mermaid 텍스트와 오류를 보여 준다.

## 색

Pele는 Mermaid의 `theme`과 `themeVariables`를 무시한다. 대신 `.pele`에 `--pele-*` CSS 변수를 설정한다. 변수 목록은 https://pele.run/theming 에 있다. 명령은 상태마다 그룹의 색 클래스를 붙인다. `class sN teal` 같은 식이다. 나쁜 상태에는 `class sN breaks`나 `class sN mayBreak`, 버그로 가는 가장 짧은 경로 위의 상태에는 `class sN bugPath`, PROPERTY 반례가 끝없이 되풀이하는 상태에는 `class sN repeats`를 붙인다. Pele는 이 클래스를 상태의 노드에 붙인다. 클래스의 색은 CSS로 칠한다.

`.mmd` 파일에는 `breaks`와 `mayBreak`의 `classDef` 줄이 있어서 어떤 Mermaid 뷰어로 봐도 버그 표시가 보인다. 그룹 색, `bugPath`, `repeats`의 `classDef`는 없다. Pele는 `classDef` 색을 노드의 `style` 속성으로 쓰고, `style` 속성은 일반 CSS 규칙보다 우선한다. 그래서 아래 표시 규칙은 `!important`를 쓴다. 이것이 없으면 어두운 테마에서도 밝은 표시 색이 남는다. 버그 표시는 채우기와 글자 색을 정하고, `bugPath`와 `repeats`는 테두리를 정한다. 표시 규칙은 그룹 색 뒤에 두어 표시가 그룹 색 위에 보이게 한다.

아래 색은 제안이다. 예전 스킬이 쓰던 색이다. 각 SVG 맨 앞의 `<style>` 요소에 넣는다. 그러면 SVG마다 뷰어의 밝은 모드나 어두운 모드 설정을 따른다.

```css
.pele {
  --pele-bg: #ffffff;
  --pele-fg: #1c1c1c;
  --pele-muted: #656565;
  --pele-line: #808080;
  --pele-surface: #fcfcfc;
  --pele-surface-alt: #f1f1f1;
  --pele-border: #c9c9c9;
}
.pele .blue rect { fill: #c3e0ff; }
.pele .orange rect { fill: #f0d3bf; }
.pele .purple rect { fill: #e3d5ff; }
.pele .yellow rect { fill: #f0dcbf; }
.pele .teal rect { fill: #bfe3df; }
.pele .tan rect { fill: #e5d9ce; }
.pele .pink rect { fill: #ffcbe6; }
.pele .breaks rect {
  fill: #ffecee !important;
  stroke: #e72e3b !important;
  stroke-width: 2.5px !important;
}
.pele .breaks text {
  fill: #cd2834 !important;
}
.pele .mayBreak rect {
  fill: #fff3e6 !important;
  stroke: #e8730c !important;
  stroke-width: 2.5px !important;
}
.pele .mayBreak text {
  fill: #b85a06 !important;
}
.pele .bugPath rect {
  stroke: #1680f3 !important;
  stroke-width: 2.5px !important;
}
.pele .repeats rect {
  stroke: #9b35d6 !important;
  stroke-width: 2.5px !important;
  stroke-dasharray: 6 3;
}
@media (prefers-color-scheme: dark) {
  .pele {
    --pele-bg: #1f1f1f;
    --pele-fg: #f5f5f5;
    --pele-muted: #acacac;
    --pele-line: #939393;
    --pele-surface: #121212;
    --pele-surface-alt: #2c2c2c;
    --pele-border: #4e4e4e;
  }
  .pele .blue rect { fill: #1b3857; }
  .pele .orange rect { fill: #573117; }
  .pele .purple rect { fill: #3c2e57; }
  .pele .yellow rect { fill: #573d17; }
  .pele .teal rect { fill: #174641; }
  .pele .tan rect { fill: #3d3127; }
  .pele .pink rect { fill: #57233e; }
  .pele .breaks rect {
    fill: #2e2021 !important;
    stroke: #cf2b35 !important;
  }
  .pele .breaks text {
    fill: #ff6463 !important;
  }
  .pele .mayBreak rect {
    fill: #2e2619 !important;
    stroke: #d0700f !important;
  }
  .pele .mayBreak text {
    fill: #ffa257 !important;
  }
  .pele .bugPath rect {
    stroke: #116dd2 !important;
  }
  .pele .repeats rect {
    stroke: #9a3fcf !important;
  }
}
```
