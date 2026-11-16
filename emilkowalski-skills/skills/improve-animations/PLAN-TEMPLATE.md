# 계획 템플릿

`improve-animations`가 쓰는 모든 계획은 이 구조를 따른다. 실행자는 맥락도 안목도 전혀 없는, 능력이 더 낮은 모델일 수 있다. 그래서 계획에는 모든 것을 정확하게 담는다. '위의 점검 결과'나 '앞서 논의한 이징' 같은 참조는 쓰지 않는다.

```markdown
# NNN — <Short imperative title>

- **Status**: TODO
- **Commit**: <output of `git rev-parse --short HEAD` when this plan was written>
- **Severity**: HIGH | MEDIUM | LOW
- **Category**: <audit category>
- **Estimated scope**: <n files, rough size>

## Problem

What is wrong, where, and why it matters to how the product feels. Cite every
location as `path/to/file.tsx:123` and include the current code verbatim:

​```css
/* src/components/dropdown.css:14 — current */
.dropdown { transition: all 400ms ease-in; }
​```

## Target

The exact end state. Every value spelled out — curves, durations, spring
configs, media queries. Never "use a nicer easing":

​```css
/* target */
.dropdown {
  transition: transform 200ms var(--ease-out), opacity 200ms var(--ease-out);
  transform-origin: var(--transform-origin);
}
​```

## Repo conventions to follow

How this codebase already does it, with one exemplar the executor should
imitate (token names, file placement, prop patterns):

- Easing tokens live in `src/styles/tokens.css`; add new curves there, e.g. `--ease-out: cubic-bezier(0.23, 1, 0.32, 1);`
- <exemplar file:line that already does this correctly>

## Steps

1. <One concrete edit per step: file, what changes, resulting code.>
2. …

## Boundaries

- Do NOT touch <files/components out of scope>.
- Do NOT change markup/structure — motion properties only (unless a step says otherwise).
- Do NOT add new dependencies.
- If a step doesn't match the code you find (drift since the commit stamp), STOP and report instead of improvising.

## Verification

- **Mechanical**: <exact commands — typecheck, lint, build — with expected outcome>.
- **Feel check**: run the UI, trigger <interaction>, and confirm:
  - <observable check, e.g. "the dropdown scales from its trigger, not from center">
  - <e.g. "spamming the toggle never restarts the animation from zero">
  - In DevTools, set playback to 10% (Animations panel) and confirm <detail>.
  - Toggle `prefers-reduced-motion` (Rendering panel) and confirm movement is dropped but opacity feedback remains.
- **Done when**: <machine- or eye-checkable completion criteria>.
```

## 계획 작성자를 위한 메모

- 발견 항목 하나에 계획 하나다. 두 발견 항목이 모든 파일과 같은 수정 패턴을 공유하면(예: 여러 컴포넌트에 걸친 같은 이징 토큰 교체) 계획 하나로 합쳐도 된다.
- 모든 값은 [AUDIT.md](AUDIT.md)에서 가져온다. 절대 기억에 기대어 어림하지 않는다.
- 체감 확인은 선택 사항이 아니다. 모션은 기계적으로 맞아도 느낌이 틀릴 수 있다. 실행자(또는 실행자의 diff를 리뷰하는 사람)가 슬로 모션으로 지켜볼 구체적인 항목을 준다.
