---
name: scaffold-exercises
description: "lint를 통과하는 연습 문제 디렉터리 구조(섹션, 문제, 해답, 설명 자료)를 만든다. 사용자가 연습 문제의 기본 구조를 만들고 싶을 때, 연습 문제 초안 파일을 만들고 싶을 때, 새 강의 섹션을 준비하고 싶을 때 쓴다."
---

# 연습 문제 기본 구조 만들기

`pnpm ai-hero-cli internal lint`를 통과하는 연습 문제 디렉터리 구조를 만든 다음 `git commit`으로 커밋한다.

## 디렉터리 이름 규칙

- **섹션**: `exercises/` 안의 `XX-section-name/` (예: `01-retrieval-skill-building`)
- **연습 문제**: 섹션 안의 `XX.YY-exercise-name/` (예: `01.03-retrieval-with-bm25`)
- 섹션 번호는 `XX`, 연습 문제 번호는 `XX.YY`
- 이름은 dash-case(소문자와 하이픈)

## 연습 문제 형태

각 연습 문제에는 아래 하위 폴더 중 하나 이상이 있어야 한다.

- `problem/`: TODO가 있는 학생 작업 공간
- `solution/`: 참고용 구현
- `explainer/`: 개념 설명 자료, TODO 없음

초안을 만들 때 계획에 따로 적혀 있지 않으면 `explainer/`를 기본으로 쓴다.

## 필수 파일

각 하위 폴더(`problem/`, `solution/`, `explainer/`)에는 다음 조건을 갖춘 `readme.md`가 있어야 한다.

- **비어 있지 않다**(실제 내용이 있어야 한다. 제목 한 줄만 있어도 된다).
- 깨진 링크가 없다.

초안을 만들 때는 제목과 설명만 담은 최소한의 readme를 만든다.

```md
# 연습 문제 제목

설명
```

하위 폴더에 코드가 있으면 `main.ts`(1줄 초과)도 있어야 한다. 하지만 초안이라면 readme만 있는 연습 문제도 괜찮다.

## 작업 순서

1. **계획 해석**: 섹션 이름, 연습 문제 이름, 형태를 뽑아낸다.
2. **디렉터리 만들기**: 경로마다 `mkdir -p`를 실행한다.
3. **readme 초안 만들기**: 형태별 폴더마다 제목을 담은 `readme.md`를 하나씩 만든다.
4. **lint 실행**: `pnpm ai-hero-cli internal lint`로 검증한다.
5. **오류 고치기**: lint를 통과할 때까지 반복한다.

## lint 규칙 요약

린터(`pnpm ai-hero-cli internal lint`)가 검사하는 항목은 다음과 같다.

- 각 연습 문제에 하위 폴더(`problem/`, `solution/`, `explainer/`)가 있다.
- `problem/`, `explainer/`, `explainer.1/` 중 하나 이상이 있다.
- 주 하위 폴더에 `readme.md`가 있고 비어 있지 않다.
- `.gitkeep` 파일이 없다.
- `speaker-notes.md` 파일이 없다.
- readme에 깨진 링크가 없다.
- readme에 `pnpm run exercise` 명령이 없다.
- readme만 있는 폴더가 아니면 하위 폴더마다 `main.ts`가 있다.

## 연습 문제 옮기기와 이름 바꾸기

연습 문제 번호를 다시 매기거나 옮길 때는 다음과 같이 한다.

1. 디렉터리 이름을 바꿀 때는 `mv`가 아니라 `git mv`를 쓴다. git 기록이 유지된다.
2. 순서가 맞도록 숫자 접두어를 고친다.
3. 옮긴 뒤 lint를 다시 실행한다.

예시:

```bash
git mv exercises/01-retrieval/01.03-embeddings exercises/01-retrieval/01.04-embeddings
```

## 예시: 계획에서 초안 만들기

다음과 같은 계획이 주어지면:

```
Section 05: Memory Skill Building
- 05.01 Introduction to Memory
- 05.02 Short-term Memory (explainer + problem + solution)
- 05.03 Long-term Memory
```

아래처럼 만든다.

```bash
mkdir -p exercises/05-memory-skill-building/05.01-introduction-to-memory/explainer
mkdir -p exercises/05-memory-skill-building/05.02-short-term-memory/{explainer,problem,solution}
mkdir -p exercises/05-memory-skill-building/05.03-long-term-memory/explainer
```

그다음 readme 초안을 만든다.

```
exercises/05-memory-skill-building/05.01-introduction-to-memory/explainer/readme.md -> "# Introduction to Memory"
exercises/05-memory-skill-building/05.02-short-term-memory/explainer/readme.md -> "# Short-term Memory"
exercises/05-memory-skill-building/05.02-short-term-memory/problem/readme.md -> "# Short-term Memory"
exercises/05-memory-skill-building/05.02-short-term-memory/solution/readme.md -> "# Short-term Memory"
exercises/05-memory-skill-building/05.03-long-term-memory/explainer/readme.md -> "# Long-term Memory"
```
