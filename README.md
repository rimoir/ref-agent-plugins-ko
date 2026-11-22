# ref-agent-plugins-ko

참고할 만한 외부 에이전트 플러그인의 한국어 번역본이다. 번역 방식과 갱신 절차는 [AGENTS.md](AGENTS.md)에 있다. 아래 표는 `sources.json`에서 `tools/render.py`가 만든다. 직접 고치지 않는다.

<!-- plugins:begin -->
| 플러그인 | upstream | 번역 기준 | 설명 |
| --- | --- | --- | --- |
| [`pstack/`](pstack/) | [cursor/plugins](https://github.com/cursor/plugins/tree/main/pstack) | v0.15.46 | poteto의 Cursor용 에이전트 스타일 플러그인. 직접 설치하지 않고 이식본의 입력으로 쓴다 |
| [`ponytail/`](ponytail/) | [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) | v5.3.3 | 가장 단순하게 동작하는 해법을 강제하는 게으른 시니어 개발자 모드 |
| [`mattpocock-skills/`](mattpocock-skills/) | [mattpocock/skills](https://github.com/mattpocock/skills) | v1.3.2 | Matt Pocock의 엔지니어링 스킬 모음 |
| [`unlazy/`](unlazy/) | [Leonxlnx/unlazy](https://github.com/Leonxlnx/unlazy) | v2.1.0 | 긴 자율 작업에서 완료 기준을 먼저 세우고 검증하게 하는 스킬 |
| [`code-migration-kit/`](code-migration-kit/) | [anthropics/code-migration-kit-with-claude-code](https://github.com/anthropics/code-migration-kit-with-claude-code) | main `cf91c9d` | Claude Code로 코드를 옮기는 프롬프트와 템플릿 묶음 |
| [`emilkowalski-skills/`](emilkowalski-skills/) | [emilkowalski/skills](https://github.com/emilkowalski/skills) | main `64eb3de` | Emil Kowalski의 UI 모션·디테일 스킬 모음 |
| [`unslop/`](unslop/) | [heydamir/unslop](https://github.com/heydamir/unslop) | main `620163e` | 바이브 코딩으로 만든 AI 티 나는 UI를 디자인된 인터페이스로 바꾸는 스킬 |
| [`dsh-superagent/`](dsh-superagent/) | [deepseek-ai/dsh-superagent-prototype](https://github.com/deepseek-ai/dsh-superagent-prototype) | main `8c32a9d` | DeepSeek Harness 번들 |
<!-- plugins:end -->

## 설치

비공개 저장소라 GitHub 인증이 필요하다.

Claude Code:

```text
/plugin marketplace add rimoir/ref-agent-plugins-ko
/plugin install ponytail@ref-agent-plugins-ko
```

Codex:

```shell
codex plugin marketplace add rimoir/ref-agent-plugins-ko
codex plugin add ponytail@ref-agent-plugins-ko
```

마켓플레이스에 없는 플러그인은 이렇게 쓴다.

- mattpocock-skills, unlazy, emilkowalski-skills, unslop은 Codex용 매니페스트가 없다. 스킬 디렉터리를 `~/.codex/skills/`에 복사한다. mattpocock-skills와 emilkowalski-skills에는 둘 다 `prototype` 스킬이 있으니 하나만 복사한다.
- `pstack/`은 Cursor용 원본의 번역이다. Claude Code·Codex 이식본은 별도 저장소에서 이 폴더를 입력으로 만든다.
- code-migration-kit은 프롬프트와 템플릿 묶음이다. `code-migration-kit/README.md`의 빠른 시작을 따른다.
- dsh-superagent는 DeepSeek Harness 번들이다. `dsh-superagent/SETUP.md`를 따른다.
