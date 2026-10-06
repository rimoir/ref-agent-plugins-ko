# 진행 중인 스킬 (In Progress)

베타 버전이다. 이 스킬들은 일부러 공개해 두었다. 써 보고 문제가 생기면 알려 달라. 안정된 버킷으로 옮겨지기 전까지는 플러그인과 최상위 README에서 빠져 있고, 문서 페이지도 없으며, 예고 없이 바뀌거나 사라질 수 있다.

플러그인으로는 이 스킬들을 설치할 수 없다. 하나씩 직접 설치한다.

```bash
npx skills@latest add mattpocock/skills --skill=<name>
```

- **[loop-me](./loop-me/SKILL.md)**: 여러 세션에 걸쳐 스스로에게 집요하게 질문하며 구현할 수 있는 워크플로 스펙을 만든다. 현재 디렉터리를 상태를 남기는 작업 공간으로 쓴다. 사용자 호출(사람이 이름을 입력해야만 실행되는 스킬).
- **[writing-beats](./writing-beats/SKILL.md)**: 글을 전개 단위(beat)가 이어지는 흐름으로 구성한다. 전체 구조를 미리 정하지 않고 매번 다음 방향을 고른다. 시작할 전개 단위 하나를 골라 그 단위만 쓰고, 다음 단위로 넘어가는 일을 글이 자연스럽게 끝날 때까지 반복한다.
- **[writing-fragments](./writing-fragments/SKILL.md)**: 집요한 질문 세션으로 사용자에게서 글 조각(형식이 제각각인 짧은 글)을 끌어내고, 나중에 쓸 글의 원재료로 문서 하나에 덧붙인다.
- **[writing-shape](./writing-shape/SKILL.md)**: 원재료가 담긴 마크다운 파일을 받아 문단 단위로 글을 만든다. 문단마다 어떤 형식으로 쓸지 근거를 들어 논의한다.
- **[claude-handoff](./claude-handoff/SKILL.md)**: 현재 대화를 새 백그라운드 에이전트에게 인계해 바로 작업을 이어 가게 한다. `claude --bg`로 인계 요약을 프롬프트로 넣어 실행한다. 사용자 호출.
- **[setup-ts-deep-modules](./setup-ts-deep-modules/SKILL.md)**: TypeScript 저장소에 dependency-cruiser를 설정해 각 패키지를 깊은 모듈(작은 인터페이스 뒤에 많은 동작을 담은 모듈)로 만든다. 구현은 하위 폴더에 숨기고 진입점 파일로만 접근할 수 있게 하며, 테스트도 진입점 파일을 거쳐 실행한다. 사용자 호출.
