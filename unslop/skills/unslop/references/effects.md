# 효과

이미지를 이 페이지를 위해 만든 것으로 바꾸는 코드 처리다. 선택 사항이다. 방향의 성격에 맞을 때만, 메인 비주얼에만 쓰고, 다른 요소의 장식으로는 절대 쓰지 않는다.

## 글리프

이미지를 문자 격자로 그리고 밝기로 문자를 고른다. 문자를 제품 자체의 재료에서 가져올 때 가장 잘 된다. 이미지가 말 그대로 제품이 다루는 것으로 만들어지기 때문이다.

- 돈, 송장, 금융: `. : 1 7 4 0 8 $ %`
- 코드, 개발자 도구: `. : / { } < > = #`
- 음악: `c d e g a` 같은 음이름과 `♭ ♯`
- 글쓰기, 읽기: 제품에서 나온 단어의 소문자
- 데이터, 모니터링: `. · : | + ▪`

셀은 6에서 10px로 두고, 타입 선택의 모노를 쓰고, 글리프 색은 이미지나 램프에서 가져온다. 몇몇 셀을 시간에 따라 천천히 바꿔 그림이 살아 있게 느껴지게 한다.

### 구현

```js
function glyphs(canvas, image, { cell = 8, chars = ". :1740$%", font = "Geist Mono", fps = 8 } = {}) {
  const ctx = canvas.getContext("2d");
  const columns = Math.floor(canvas.width / cell);
  const rows = Math.floor(canvas.height / cell);

  const sample = document.createElement("canvas");
  sample.width = columns;
  sample.height = rows;
  const sampler = sample.getContext("2d", { willReadFrequently: true });
  sampler.drawImage(image, 0, 0, columns, rows);
  const pixels = sampler.getImageData(0, 0, columns, rows).data;

  const atlas = document.createElement("canvas");
  atlas.width = cell * chars.length;
  atlas.height = cell;
  const pen = atlas.getContext("2d");
  pen.font = `500 ${cell + 1}px ${font}`;
  pen.textAlign = "center";
  pen.textBaseline = "middle";
  pen.fillStyle = "#fff";
  [...chars].forEach((char, index) => pen.fillText(char, index * cell + cell / 2, cell / 2));

  const cells = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      const i = (y * columns + x) * 4;
      const light = (0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2]) / 255;
      cells.push({ x, y, light, color: `rgb(${pixels[i]},${pixels[i + 1]},${pixels[i + 2]})`, seed: Math.random() });
    }
  }

  const tinted = document.createElement("canvas");
  tinted.width = cell;
  tinted.height = cell;
  const tint = tinted.getContext("2d");

  const draw = (step) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const c of cells) {
      if (c.light < 0.06) continue;
      const jitter = Math.sin(c.seed * 999 + step) > 0.92 ? 1 : 0;
      const pick = Math.min(chars.length - 1, Math.floor(c.light * chars.length) + jitter);
      tint.globalCompositeOperation = "copy";
      tint.drawImage(atlas, pick * cell, 0, cell, cell, 0, 0, cell, cell);
      tint.globalCompositeOperation = "source-in";
      tint.fillStyle = c.color;
      tint.fillRect(0, 0, cell, cell);
      ctx.drawImage(tinted, c.x * cell, c.y * cell);
    }
  };

  let frame = 0;
  let last = 0;
  let step = 0;
  let visible = true;
  new IntersectionObserver(([entry]) => (visible = entry.isIntersecting)).observe(canvas);
  const loop = (now) => {
    frame = requestAnimationFrame(loop);
    if (!visible || now - last < 1000 / fps) return;
    last = now;
    draw(step++);
  };
  frame = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(frame);
}
```

캔버스가 크면 셀별로 색을 입힌 글리프를 오프스크린 캔버스에 한 번 구워 두고, 한 스텝에서 바뀌는 셀만 다시 그린다.

## 하프톤 점

밝기에 따라 크기가 달라지는 격자 위의 점이다. 에디토리얼, 인쇄, 공들인 성격에 어울린다. 샘플링은 글리프와 같고, 페이지 색 위에 잉크 색 하나로 반지름 `light * cell / 2`의 `arc` 원을 그린다.

## 디더링

램프의 두세 색으로 순서 디더나 오차 확산 디더를 건다. 레트로, 기술적, 장난기 있는 성격에 어울린다. 프레임마다가 아니라 이미지를 불러올 때 한 번만 한다.

## 듀오톤

이미지의 밝기를 두 색, 곧 램프의 가장 어두운 표면과 강조색이나 주 텍스트 색에 대응시킨다. 어떤 생성 이미지든 팔레트에 속하게 만드는 가장 단순한 방법이다. CSS에서는 강조색의 `mix-blend-mode: color` 층 아래에 흑백 이미지를 두거나 SVG `feColorMatrix` 필터를 쓴다.

## 성능

이 효과는 전에 약한 노트북에서 깨진 적이 있으니 다음 규칙을 지킨다.

- 픽셀은 이미지를 불러올 때 한 번만 읽는다. 애니메이션 루프 안에서 `getImageData`를 절대 부르지 않는다. GPU를 멈춰 세우고 프레임을 한 자릿수로 떨어뜨린다.
- 글리프 아틀라스와 색을 입힌 셀을 미리 준비하고 `drawImage`로 그린다.
- 초당 60이 아니라 8에서 12 스텝으로 애니메이션하고, 스텝마다 셀의 작은 일부만 바꾼다.
- 캔버스가 화면 밖에 있으면 멈춘다.
- 캔버스 크기는 기기 픽셀 비율에 맞추되 2로 제한한다.

---

Damir Sokolovsky([@heydamir](https://x.com/heydamir))의 unslop 일부를 한국어로 옮겼다. CC BY 4.0. 사본과 파생물에 이 크레딧을 남긴다.
