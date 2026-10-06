# 에이전트 이식성

Ponytail은 여러 에이전트에 옮겨 쓸 수 있는 스킬 배포판이다. 핵심 동작은 `skills/`의 스킬에 들어 있고, 호스트별 파일은 그 동작을 특정 에이전트에서 쉽게 불러오게 해 주는 어댑터다.

## 지원하는 어댑터

| 호스트 | 파일 | 메모 |
|------|-------|-------|
| Claude Code | `.claude-plugin/plugin.json`, `commands/`, `hooks/claude-codex-hooks.json`, `hooks/` | 전체 플러그인으로 설치하며 세션 활성화, 모드 추적, 명령, 상태 표시줄을 지원한다. |
| Codex | `.codex-plugin/plugin.json`, `hooks/claude-codex-hooks.json`, `hooks/`, `skills/` | 같은 스킬에 활성화와 모드 추적용 수명 주기 훅을 더해 플러그인으로 설치한다. |
| CodeBuddy | `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `hooks/claude-codex-hooks.json`, `hooks/`, `skills/` | CodeBuddy Code는 `.codebuddy-plugin/`이 없으면 Claude 형식 매니페스트를 읽고 훅 명령의 `${CLAUDE_PLUGIN_ROOT}`를 펼친다. 그래서 `/plugin marketplace add DietrichGebert/ponytail`와 `/plugin install ponytail@ponytail`로 Claude 플러그인을 그대로 설치한다. 훅은 `CODEBUDDY_PLUGIN_ROOT`로 CodeBuddy를 알아보고, 모드 플래그를 `$CODEBUDDY_CONFIG_DIR`이나 `~/.codebuddy`에 두며, `hookSpecificOutput` JSON으로 응답한다. CodeBuddy는 `SubagentStart` 훅 출력을 버리므로 서브에이전트 주입은 없다. CodeBuddy CLI 2.161.2에서 확인했다. |
| Grok Build | 루트 `plugin.json`, `.grok-plugin/marketplace.json`, `skills/`, `commands/` | `grok plugin install DietrichGebert/ponytail --trust`로 설치한 뒤 활성화한다. Grok은 코딩 작업용 스킬 설명을 보고 ponytail을 자동으로 호출할 수 있고, `/ponytail`을 쓰면 명시적으로 활성화한다. Grok 수명 주기 훅은 출력을 보여 주기만 하고 지시문을 주입하지는 못해서 쓰지 않는다. |
| Goose | `plugin.json`, `skills/`, `AGENTS.md` | `goose plugin install https://github.com/DietrichGebert/ponytail.git`은 저장소를 `~/.agents/plugins/ponytail/`에 클론하고 스킬 6개를 `ponytail:<skill>`로 가져온다. 항상 켜져 있는 규칙은 `AGENTS.md`에서 온다. goose는 프로젝트(git 루트부터 작업 디렉터리까지)와 `~/.agents/AGENTS.md`에서 이 파일을 읽고, `~/.config/goose/`의 `.goosehints`도 읽는다. 수명 주기 훅이 없어서 `/ponytail` 레벨이 유지되지 않는다. Goose 1.53.0에서 확인했다. |
| Muse Code (Meta) | `AGENTS.md`, `skills/` | Muse는 작업 공간을 신뢰하면 프로젝트의 `AGENTS.md`(또는 `CLAUDE.md`)를 읽고, 모든 프로젝트에 `~/.config/muse/AGENTS.md`를 읽는다. 스킬은 `skills/`의 폴더를 `~/.agents/skills/`로 복사하거나 스킬마다 `muse skills install ./skills/<name> --scope user`를 실행한다. 지시문 수준으로 지원하며 `/ponytail` 레벨과 훅은 없다. Muse Code 1.4.2에서 확인했다. |
| OpenCode | `.opencode/plugins/ponytail.mjs`, `.opencode/command/`, `hooks/`, `skills/` | 서버 플러그인이 `experimental.chat.system.transform`으로 매 턴 규칙을 주입하고 `/ponytail` 전환을 저장한다. 공용 지시문 생성기를 재사용한다. `opencode plugin add @dietrichgebert/ponytail`로 전역 설치하거나(OpenCode가 `plugins` 항목을 직접 쓴다), `opencode.json`의 `plugins` 배열로 프로젝트마다 설치한다. |
| Kilo Code | `.opencode/plugins/ponytail.mjs` (npm), `AGENTS.md` | Kilo는 OpenCode 기반이라 ponytail의 OpenCode 플러그인을 그대로 실행한다. `kilo.jsonc`(프로젝트)나 `~/.config/kilo/kilo.jsonc`(전역)에 `{ "plugin": ["@dietrichgebert/ponytail"] }`를 넣는다. 그러면 매 턴 규칙을 주입하고, `/ponytail` 레벨 전환을 유지하고, `/ponytail-review` 같은 명령을 등록한다. 플러그인이 없어도 Kilo는 프로젝트 루트나 `~/.config/kilo/AGENTS.md`의 `AGENTS.md`를 읽는다(지시문 수준). VS Code 확장과 코어를 공유하는 Kilo CLI 7.8.3에서 확인했다. |
| pi | `pi-extension/`, `skills/`, `hooks/` | 패키지 확장이다. 공용 지시문 생성기로 매 턴 규칙을 주입하고 `/ponytail` 명령을 등록한다. |
| Oh My Pi (omp) | `.claude-plugin/marketplace.json`, `pi-extension/`, `skills/` | 마켓플레이스로 설치하고 pi 확장을 그대로 실행한다(omp는 `package.json`의 `pi` 키를 읽는다). omp 18.6.1에서 매 턴 규칙이 들어오고 스킬 목록이 나오는 것을 확인했다. |
| Kimi Code | `.kimi-plugin/plugin.json`, `AGENTS.md`, `skills/` | Kimi 전용 플러그인이다. `systemPromptPath`가 매 턴 `AGENTS.md`를 시스템 프롬프트에 넣고, 스킬 6개는 슬래시 명령으로도 쓸 수 있다. 훅은 없다. ACP로 Kimi Code 2.1.1에서 확인했다. 규칙이 시스템 프롬프트에 들어 있고, `/ponytail-review staged`가 대상을 받아 스킬을 활성화한다. |
| Hermes Agent | `plugin.yaml`, `__init__.py`, `skills/` | Hermes 전용 플러그인이다. `pre_llm_call`로 활성 모드를 주입하고, 게이트웨이의 `/ponytail-*` 스킬 명령을 에이전트 프롬프트로 바꿔 쓰고, `/ponytail` 모드 전환을 등록하고, 함께 들어 있는 스킬을 `ponytail:<skill>`로 노출한다. |
| Gemini CLI | `gemini-extension.json`, `AGENTS.md`, `commands/`, `skills/` | 확장 매니페스트의 `contextFileName`이 항상 켜져 있는 규칙용 `AGENTS.md`를 가리키고, Gemini CLI가 자동으로 찾는 기존 `commands/*.toml`과 `skills/`를 재사용한다. Claude/Codex 훅 맵은 Gemini가 자동으로 찾는 `hooks/hooks.json` 경로에 두지 않는다. |
| Qwen Code | `gemini-extension.json`, `AGENTS.md`, `commands/`, `skills/` | `qwen extensions install DietrichGebert/ponytail:ponytail`은 Qwen의 Gemini CLI 호환 기능으로 설치한다. `AGENTS.md`가 항상 켜져 있는 컨텍스트가 되고, `/ponytail` 명령 6개가 옮겨지고, 스킬 6개가 등록된다. Claude/Codex 수명 주기 훅은 쓰지 않으므로 레벨이 유지되지 않는다. Qwen Code 0.24.7과 ponytail 4.11.0에서 확인했다(4.11.0 이상이 필요하다, #1021 참고). |
| Cursor | `hooks/cursor-hooks.json`, `scripts/cursor-hooks.js`, `hooks/`, `.cursor/rules/ponytail.mdc` | Cursor 자체 훅을 쓴다. `node scripts/cursor-hooks.js install`은 `sessionStart`(`additional_context`로 기본 레벨 규칙 주입)와 `beforeSubmitPrompt`(`/ponytail` 레벨 추적, `additional_context`로 새 레벨 규칙 주입)를 `~/.cursor/hooks.json`에, `--project`를 붙이면 `.cursor/hooks.json`에 병합하고, 관련 없는 훅은 그대로 둔다. 서브에이전트 주입은 없고(Cursor의 `subagentStart`는 `permission`/`user_message`만 받는다) 클라우드 에이전트에서는 `sessionStart`가 없다. `.cursor/rules/ponytail.mdc`는 지시문만 쓰는 대안으로 남아 있고, 이 규칙이 작업 공간에 있으면 훅은 안내문만 주입한다. 동작 규약과 검증 기록은 [cursor-hooks.md](cursor-hooks.md)에 있다. |
| Windsurf | `.windsurf/rules/ponytail.md` | 프로젝트 규칙 |
| Cline (extension and CLI) | `.clinerules/ponytail.md`, `skills/`, `AGENTS.md` | `.clinerules/ponytail.md`를 프로젝트의 `.clinerules/`에 복사하거나, 모든 프로젝트에 쓰려면 `~/.cline/rules/`(또는 `~/Documents/Cline/Rules/`)에 복사한다. Cline은 프로젝트 루트의 `AGENTS.md`도 읽는다. `cline skill add DietrichGebert/ponytail`은 스킬 6개를 `.agents/skills/`에 설치한다. 지시문 수준으로 지원하며 `/ponytail` 레벨과 훅은 없다. 규칙과 스킬은 Cline CLI 3.0.68에서 확인했다. |
| GitHub Copilot | `.github/copilot-instructions.md` | 저장소 지시문 파일 |
| GitHub Copilot CLI | `.github/plugin/`, `AGENTS.md`, `.github/copilot-instructions.md`, `~/.copilot/copilot-instructions.md` | 플러그인을 지원한다(`copilot plugin marketplace add DietrichGebert/ponytail` + `copilot plugin install ponytail@ponytail`). 대체 수단인 지시문 모드도 남아 있다. 프로젝트별로는 `AGENTS.md`나 `.github/copilot-instructions.md`에서, 전역으로는 `~/.copilot/copilot-instructions.md`에서 읽는다(지시문 수준 지원, `/ponytail` 레벨과 훅 없음). |
| Antigravity | `AGENTS.md` | 저장소 루트의 `AGENTS.md`를 항상 켜져 있는 규칙으로 읽는다(`.cursorrules`/`CLAUDE.md`와 같은 방식). 작업 공간 규칙에는 `.agents/rules/`도 쓸 수 있다. 지시문 수준으로 지원한다. |
| CodeWhale | `AGENTS.md` | 저장소 루트의 `AGENTS.md`를 프로젝트 지시문으로 읽는다. 대체 파일로 `CLAUDE.md`와 `.claude/instructions.md`도 읽는다. 지시문 수준으로 지원한다. |
| Swival | `.swival/skills/`, `AGENTS.md` | `swival skills add https://github.com/DietrichGebert/ponytail`은 ponytail 스킬 전부를 `.swival/skills/`에 바로 설치한다. `--global`을 붙이면 먼저 라이브러리(`~/.config/swival/library`)에 준비해 두고, 그다음 `swival skills add ponytail`(또는 `--global ponytail`)로 프로젝트별로 또는 모든 곳에서 활성화한다. 지시문 수준의 대체 수단으로 저장소 루트의 `AGENTS.md`와 전역 `~/.config/swival/AGENTS.md`도 읽는다. |
| VS Code + Codex extension | `AGENTS.md` | Codex 확장은 `AGENTS.md`(저장소 루트, 또는 전역으로 `~/.codex/AGENTS.md`)를 읽는다. 지시문 수준으로 지원한다. 위의 Codex 전체 플러그인 행은 여기에 `/ponytail` 레벨과 훅을 더한다. |
| JetBrains Junie | `AGENTS.md` | Settings → Tools → Junie → Project Settings → Guidelines Path에서 `AGENTS.md`를 지정하면 Junie가 읽는다(아직 자동이 아니다). 이 저장소에는 `AGENTS.md`가 들어 있고, `.junie/guidelines.md`는 Junie의 예전 경로다. 지시문 수준으로 지원한다. |
| Amp (Sourcegraph) | `AGENTS.md` | Amp는 작업 디렉터리와 `$HOME`까지의 상위 디렉터리에서 `AGENTS.md`를 읽고(`~/.config/amp/AGENTS.md` 같은 전역 설정도 읽는다), 없으면 `AGENT.md`/`CLAUDE.md`를 읽는다. 지시문 수준으로 지원한다. |
| Factory Droid | `AGENTS.md`, `skills/` | Droid는 작업 디렉터리부터 git 루트까지(그 안의 `.factory/`와 `.agents/` 포함) `AGENTS.md`를 읽고, 전역으로 `~/.factory/AGENTS.md`를 읽는다. `SKILL.md` 스킬은 `.factory/skills/`나 `~/.factory/skills/`에서 읽으므로, review, audit 등의 스킬을 쓰려면 `skills/`의 폴더를 그곳에 복사한다. 지시문 수준으로 지원하며 `/ponytail` 레벨과 훅은 없다. |
| Command Code | `skills/`, `AGENTS.md` | `cmd skills add https://github.com/DietrichGebert/ponytail`은 스킬 6개를 `.commandcode/skills/`에 설치한다(`--global`을 붙이면 `~/.commandcode/skills/`). `.agents/skills/`도 자동으로 찾는다. 매 세션 `AGENTS.md`를 프로젝트 메모리로 읽는다. 지시문 수준으로 지원하며 `/ponytail` 레벨과 훅은 없다. |
| Freebuff CLI | `AGENTS.md`, `skills/` | Freebuff는 프로젝트 루트의 `AGENTS.md`(없으면 `CLAUDE.md`)를 매 세션 프로젝트 지시문으로 넣고, 전역으로 `~/.agents.md`를 읽는다. `SKILL.md` 스킬은 프로젝트의 `.agents/skills/`나 `.claude/skills/`, 전역의 `~/.agents/skills/`나 `~/.claude/skills/`에서 읽으므로, review, audit 등의 스킬을 쓰려면 `skills/`의 폴더를 그곳에 복사한다. 지시문 수준으로 지원하며 `/ponytail` 레벨과 훅은 없다. |
| DeepSeek Harness (dsh) | `AGENTS.md`, `skills/` | DSH는 프로젝트 루트부터 작업 디렉터리까지의 `AGENTS.md`(또는 `CLAUDE.md`)와 모든 프로젝트용 `~/.dsh/AGENTS.md`(`$DSH_HOME`)를 각 세션의 첫 요청에 넣는다. `SKILL.md` 스킬은 `~/.agents/skills/`에서 읽으므로, review, audit 등의 스킬을 쓰려면 `skills/`의 폴더를 그곳에 복사한다. 지시문 수준으로 지원하며 `/ponytail` 레벨과 훅은 없다. dsh 0.2.0-rc.2에서 확인했다. |
| Jules (Google) | `AGENTS.md` | Jules는 저장소 루트의 `AGENTS.md`를 자동으로 읽는다. 지시문 수준으로 지원한다. |
| Kiro | `.kiro/steering/ponytail.md` | 스티어링 규칙이다. 전역이나 프로젝트 안에 복사한다. |
| Qoder | `.qoder/rules/ponytail.md`, `.qoder-plugin/plugin.json`, `hooks/qoder-hooks.json`, `skills/`, `AGENTS.md` | Qoder는 `AGENTS.md`를 항상 켜져 있는 컨텍스트로 자동으로 불러온다. `.qoder/rules/ponytail.md`는 프로젝트별 규칙을 제공하고, 플러그인 매니페스트는 ponytail 스킬이 들어 있는 `skills/`를 가리킨다(Skill 시스템에서 `/ponytail`, `/ponytail-review` 등으로 호출한다). 전체 플러그인 수준으로 지원한다. `hooks/qoder-hooks.json` 템플릿이 `UserPromptSubmit`(모드 활성화 + 규칙 주입)와 `task|Task` 매처를 쓴 `PreToolUse`(서브에이전트 주입)를 등록한다. 지시문 수준 지원은 `AGENTS.md`로 저장소 루트에서 설정 없이 바로 동작한다. |
| Zed | `AGENTS.md` | Agent Panel의 기본 규칙 파일 가운데 하나로 워크트리 루트의 `AGENTS.md`를 자동으로 포함한다. 지시문 수준으로 지원한다. |
| 범용 에이전트 | `AGENTS.md` 또는 `skills/*/SKILL.md` | 간결한 규칙 파일을 복사하거나 스킬 파일을 직접 불러온다. |

## 어댑터 규칙

어댑터에는 꼭 필요한 연결 코드만 둔다. 호스트가 스킬이나 훅을 지원하면 기존 `skills/`와 `hooks/` 파일을 가리키게 한다. 호스트가 프로젝트 지시문만 지원하면 복사한 규칙 문구를 `AGENTS.md`와 맞춰 둔다.

## 이식 가능한 동작

- `skills/ponytail/SKILL.md`: 게으른 시니어 개발자 모드
- `skills/ponytail-review/SKILL.md`: 과잉 설계 리뷰
- `skills/ponytail-audit/SKILL.md`: 저장소 전체 과잉 설계 감사
- `skills/ponytail-debt/SKILL.md`: `ponytail:` 표식을 단 의도적 단순화를 모아 관리하는 부채 목록
- `skills/ponytail-gain/SKILL.md`: 벤치마크로 측정한 효과를 보여 주는 점수표
- `skills/ponytail-help/SKILL.md`: 빠른 참조
- `AGENTS.md`: 스킬을 지원하지 않는 에이전트용으로 항상 켜져 있는 간결한 지시문 모음
