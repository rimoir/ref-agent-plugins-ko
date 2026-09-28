# 표준 설치 안내 블록

설치 방법은 하나의 설명, 하나의 문구로만 안내한다. `README.md`, `.changeset/*`, `docs/` 아래 모든 페이지는 **이 내용**만 쓰고 다른 말을 하지 않는다. 바꿀 때는 여기부터 고친 다음 다른 곳에 반영한다.

`mattpocock-skills`는 **Claude Code 공식 마켓플레이스**(설정 이름 `claude-plugins-official`, 원본 저장소 `anthropics/claude-plugins-official`)에 올라 있고, 이 마켓플레이스는 모든 Claude Code 설치에 처음부터 들어 있다. 먼저 추가할 마켓플레이스가 없다. Anthropic 공식 마켓플레이스는 기본으로 자동 업데이트가 켜져 있으므로([discover-plugins](https://code.claude.com/docs/en/discover-plugins)), "업데이트가 자동으로 적용된다"는 말은 기대가 아니라 사실이다.

## Claude Code: 플러그인

<canonical-block name="claude-code">

```bash
claude plugins install mattpocock-skills
```

Or, from inside a session:

```
/plugin install mattpocock-skills
```

It's in Claude Code's official marketplace, so there's nothing to add first, and updates arrive automatically.

</canonical-block>

## Codex와 다른 에이전트: skills.sh

플러그인은 Claude Code 전용이다. 그 밖의 환경에서는 [skills.sh](https://skills.sh/mattpocock/skills)가 수정할 수 있는 스킬 파일을 프로젝트에 복사한다. `README.md`에는 전체 설치 형태를 쓴다.

<canonical-block name="skills-sh-whole-set">

```bash
npx skills@latest add mattpocock/skills
```

Pick the skills you want, and which coding agents to install them on. **The installer lets you choose which skills to take: make sure `setup-matt-pocock-skills` is one of them.**

</canonical-block>

…그리고 스킬 하나만 따로 언급하는 곳에는 단일 스킬 형태를 쓴다. **`docs/` 페이지는 이 블록을 쓰지 않는다**는 점에 주의한다. ai-hero가 본문 위에 설치 위젯을 표시하므로, 페이지에 명령을 따로 적으면 같은 내용이 두 번 나온다. [writing-docs.md](./writing-docs.md)를 본다.

<canonical-block name="skills-sh-one-skill">

```bash
npx skills@latest add mattpocock/skills --skill=<name>
```

```bash
npx skills@latest update <name>
```

</canonical-block>

모든 블록에서 `skills@latest`로 고정해 쓴다. 예전에는 `docs/` 아래 페이지마다 이 명령을 따로 적어 두었지만, 사이트가 설치 명령을 직접 표시하므로 그 블록은 고치지 않고 지웠다.

## 설치 방법은 하나만 고른다

플러그인은 구독해서 받는 관리형 읽기 전용 묶음이다. skills.sh는 사용자가 소유하고 수정하는 파일을 쓴다. 둘 다 설치하면 모든 스킬이 두 개씩 생긴다. 그러니 항상 "하나만 고른다"고 안내한다.

## 설치 안내에 넣지 않는 것

`.claude-plugin/marketplace.json`은 이 저장소를 플러그인 하나짜리 자체 마켓플레이스로 만든다(`/plugin marketplace add mattpocock/skills` 다음에 `/plugin install mattpocock-skills@mattpocock`). 공식 마켓플레이스 등록이 이 방식을 대신한다. 이 파일은 저장소를 직접 설치해야 할 때(아직 릴리스하지 않은 커밋이나 포크)를 위한 대체 수단으로 남겨 두며, 사용자에게는 **안내하지 않는다**.
