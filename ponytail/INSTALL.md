# 설치

아래에서 쓰는 에이전트를 고른다. 목록에 없다면? 대부분의 에이전트는 [`AGENTS.md`](AGENTS.md)를 읽는다. 이 파일을 프로젝트에 복사하거나, 에이전트에게 [`skills/ponytail/SKILL.md`](skills/ponytail/SKILL.md)를 스킬로 설치해 달라고 하면 된다. 어떤 파일이 어떤 에이전트에 대응하는지는 [에이전트 이식성](docs/agent-portability.md)에 있다.

Claude Code와 Codex 플러그인(그리고 Cursor 훅)은 아주 작은 Node.js 라이프사이클 훅 두 개를 돌리므로 `node`가 PATH에 있어야 한다 (Nix/nvm 사용자 참고: 비대화형 셸의 PATH에 있어야 한다). 없어도 스킬은 동작하지만 훅이 불릴 때마다 무해한 `node: command not found` 오류가 뜬다. Node를 설치하거나 그 PATH에 넣으면 사라진다.

## Claude Code

```
/plugin marketplace add DietrichGebert/ponytail
```
```
/plugin install ponytail@ponytail
```
(설치하려면 두 프롬프트를 따로 보내야 한다)

Claude Code 데스크톱 앱의 Code 탭에서도 단계는 같다. 위의 `/plugin` 명령 두 개를 프롬프트 입력창에 입력하거나, 옆의 **+** 버튼을 눌러 **Plugins** → **Add plugin**을 고르면 설정된 마켓플레이스를 둘러볼 수 있다. 마켓플레이스는 사이드바의 **Customize**에서 관리한다.

CodeBuddy도 같은 `/plugin` 명령 두 개로 같은 플러그인을 설치하고, `/ponytail ultra` 같은 명령으로 레벨을 바꾼다. 서브에이전트 주입은 없다.

## Codex

```bash
codex plugin marketplace add DietrichGebert/ponytail
codex plugin add ponytail@ponytail
```

`codex`를 실행하고 `/hooks`를 열어 라이프사이클 훅 두 개를 검토하고 신뢰한 뒤, 새 스레드를 시작한다.

이 설치는 Codex 데스크톱 앱에도 그대로 적용된다. 설치 후 앱을 재시작하면 플러그인을 불러온다.

## GitHub Copilot CLI

```bash
copilot plugin marketplace add DietrichGebert/ponytail
copilot plugin install ponytail@ponytail
```

대화형 Copilot CLI 세션에서는 같은 일을 하는 슬래시 명령을 쓴다.

```
/plugin marketplace add DietrichGebert/ponytail
/plugin install ponytail@ponytail
```

Copilot CLI는 플러그인 명령 앞에 플러그인 이름을 네임스페이스로 붙인다. 예를 들면 다음과 같다.

```text
/ponytail:ponytail ultra
/ponytail:ponytail-review
```

## Pi agent harness

```
pi install git:github.com/DietrichGebert/ponytail
```

## Kimi Code

Kimi Code에서 `/plugins install https://github.com/DietrichGebert/ponytail`을 실행한 뒤 `/reload`하거나 새 세션을 시작한다. 플러그인은 매 턴 [`AGENTS.md`](AGENTS.md)를 시스템 프롬프트에 넣고 스킬 여섯 개를 추가한다. Kimi는 이 스킬을 `/ponytail`, `/ponytail-review`, `/ponytail-audit`, `/ponytail-debt`, `/ponytail-gain`, `/ponytail-help`로도 제공한다. 레벨 전환(`/ponytail lite`)은 그 턴에만 스킬을 불러온다. Kimi에는 지속되는 모드 플래그가 없다.

## Oh My Pi (omp)

```bash
omp plugin marketplace add DietrichGebert/ponytail
omp plugin install ponytail@ponytail
```

omp는 ponytail의 Pi 확장을 그대로 돌리므로 Pi처럼 매 턴 규칙 세트가 주입된다 (omp 18.6.1에서 확인). 설치 후 새 세션을 시작한다.

## OpenCode

```bash
opencode plugin add @dietrichgebert/ponytail
```

또는 프로젝트의 `opencode.json`에 추가한다.

```json
{ "plugins": ["@dietrichgebert/ponytail"] }
```

체크아웃에서 바로 돌릴 수도 있다 (플러그인은 `hooks/`와 `skills/`를 재사용한다).

```json
{ "plugins": ["./.opencode/plugins"] }
```

매 턴 현재 레벨의 규칙 세트를 주입하고 `/ponytail` 명령을 추가한다 ([명령어](README.md#commands) 참고). OpenCode는 이 저장소의 `AGENTS.md`도 자동으로 불러오므로 플러그인이 없어도 규칙은 유지된다. 플러그인은 `lite/full/ultra/off` 레벨을 더한다.

`./` 경로는 프로젝트의 `opencode.json` 기준으로 해석된다. 체크아웃 하나를 여러 프로젝트에서 같이 쓰려면 체크아웃의 `.opencode/plugins` 디렉터리 절대 경로를 지정한다. `plugins` 항목은 파일이 아니라 **디렉터리**를 가리켜야 한다. OpenCode 2는 `ponytail.mjs` 파일 경로를 `configured plugin path must be a directory`로 거부한다. OpenCode 2에서 이 저장소를 열면 항목이 전혀 필요 없다. `.opencode/plugins/index.js`를 알아서 불러온다.

Kilo Code는 OpenCode 위에 만들어졌고 `plugin` 키로 같은 플러그인을 돌린다. `kilo.jsonc`(모든 프로젝트에 쓰려면 `~/.config/kilo/kilo.jsonc`)에 `{ "plugin": ["@dietrichgebert/ponytail"] }`를 추가한다.

OpenCode 1에는 `plugin add`가 없고 예전 `plugin` 키를 쓴다. `{ "plugin": ["@dietrichgebert/ponytail"] }`로 쓰고, 체크아웃에서 돌릴 때는 파일 경로 `{ "plugin": ["./.opencode/plugins/ponytail.mjs"] }`를 쓴다.

## Gemini CLI

```bash
gemini extensions install https://github.com/DietrichGebert/ponytail
```

매 세션 규칙 세트를 항상 켜진 컨텍스트로 불러오고 `/ponytail` 명령을 등록한다. `skills/`도 함께 들어가며, 작업에 필요할 때 활성화된다.
Gemini 어댑터는 일부러 루트 `hooks/hooks.json`을 넣지 않는다. Gemini는 그 경로를 자동으로 불러오는데, Ponytail의 라이프사이클 훅은 Claude/Codex 이벤트 이름을 쓰기 때문이다.

Qwen Code도 같은 확장을 설치한다. `qwen extensions install DietrichGebert/ponytail:ponytail`을 실행하면 `AGENTS.md`를 항상 켜진 컨텍스트로 불러오고 `/ponytail` 명령과 스킬을 등록한다. 라이프사이클 훅을 쓰지 않으므로 레벨은 세션이 바뀌면 유지되지 않는다.

## Qoder

Qoder는 저장소 루트의 `AGENTS.md`를 항상 켜진 컨텍스트로 자동으로 불러오므로, 체크아웃에서 ponytail을 돌리면 설정할 것이 없다. 프로젝트별 규칙을 쓰려면 [`.qoder/rules/ponytail.md`](.qoder/rules/ponytail.md)를 프로젝트의 `.qoder/rules/`에 복사한다. ponytail 스킬 여섯 개(`/ponytail`, `/ponytail-review`, `/ponytail-audit`, `/ponytail-debt`, `/ponytail-gain`, `/ponytail-help`)는 Qoder의 스킬 시스템으로 쓸 수 있다. [`.qoder-plugin/plugin.json`](.qoder-plugin/plugin.json)의 플러그인 매니페스트가 `skills/` 디렉터리를 가리킨다.

플러그인 수준의 전체 지원(모드 자동 활성화와 매 프롬프트 규칙 세트 주입)을 원하면 ponytail을 Qoder 플러그인으로 설치한다 (`qodercli plugins install <path-to-ponytail>`). 매니페스트가 [`hooks/qoder-hooks.json`](hooks/qoder-hooks.json)을 불러오고 Qoder가 `${QODER_PLUGIN_ROOT}`를 채운다. 플러그인 없이 쓰려면 그 훅을 `.qoder/settings.json`에 복사하고 `${QODER_PLUGIN_ROOT}`를 ponytail 체크아웃 경로로 바꾼다. Qoder의 `UserPromptSubmit` 훅은 첫 프롬프트에서 기본 모드를 켜고 매 턴 규칙 세트를 주입한다. `task|Task` 매처를 쓰는 `PreToolUse`는 서브에이전트에 규칙 세트를 주입한다. 레벨 전환(`/ponytail lite|full|ultra|off`)은 자동으로 동작한다.

## Antigravity CLI

Google은 Gemini CLI의 이름을 Antigravity CLI(`agy` 바이너리)로 바꾸는 중이다. 같은 확장이 그대로 설치된다.

```bash
agy plugin install https://github.com/DietrichGebert/ponytail
```

이 저장소의 `gemini-extension.json`을 그대로 쓴다. 다른 점이 하나 있다. Antigravity는 `/ponytail` 명령을 스킬로 바꾸므로 슬래시 메뉴에서 고르지 않고 채팅에 직접 입력한다 (예: `/ponytail-review`를 메시지로 보낸다). 이전이 끝날 때까지(2026년 6월 18일 무렵) `gemini extensions install`도 동작한다. 항상 켜진 규칙으로 쓰려면 규칙 세트를 `.agents/rules/`에 넣는다.

## Hermes Agent

```bash
hermes plugins install DietrichGebert/ponytail --enable
```

설치 후 Hermes를 재시작한다. 플러그인은 LLM 턴마다 그 전에 현재 Ponytail 모드를 주입하고, 함께 든 스킬을 `ponytail:<skill>`로 등록하며, `/ponytail`, `/ponytail-review`, `/ponytail-audit`, `/ponytail-debt`, `/ponytail-gain`, `/ponytail-help`를 추가한다. 공유 게이트웨이에서는 Hermes의 슬래시 명령 접근 제어로 `/ponytail`을 신뢰하는 사용자만 쓰도록 제한한다. 실행 중 모드는 프로세스 안에서만 유지된다.

## CodeWhale

프로젝트 루트의 `AGENTS.md`를 읽으므로 설정할 것이 없다. [`AGENTS.md`](AGENTS.md)를 프로젝트에 복사하거나, 이 저장소의 체크아웃에서 `codewhale`을 실행하면 끝이다.

## Devin CLI

```bash
devin plugins install DietrichGebert/ponytail
```

ponytail을 Devin 플러그인으로 설치한다. 스킬은 `/ponytail:ponytail`, `/ponytail:ponytail-review` 같은 이름으로 쓸 수 있다.

## OpenClaw

```bash
clawhub install ponytail
```

ClawHub에서 ponytail을 OpenClaw 스킬로 설치한다. review, audit, debt, gain, help 스킬도 같은 방식으로 설치한다 (`clawhub install ponytail-review` 등). OpenClaw는 코딩 작업에 이 스킬을 적용하고 `/ponytail` 명령으로도 제공한다. ClawHub 없이 쓰려면 [`.openclaw/skills/ponytail`](.openclaw/skills/)을 `~/.openclaw/skills/`에 복사한다.

## Grok Build

```bash
grok plugin install DietrichGebert/ponytail --trust
```

플러그인을 켠다 (기본값은 꺼짐). `/plugins` → Plugins → `ponytail`에서 Space를 누르거나, `~/.grok/config.toml`에 다음을 넣는다.

```toml
[plugins]
enabled = ["ponytail"]
```

새 세션을 시작한다 (또는 플러그인을 다시 불러온다). 스킬은 `/ponytail`, `/ponytail-review`, `/ponytail-audit`, `/ponytail-debt`, `/ponytail-gain`, `/ponytail-help`로 보인다. `grok inspect`로 확인한다. Grok은 스킬 설명을 보고 코딩 작업에 ponytail을 자동으로 불러올 수 있다. 명시적으로 켜야 할 때는 `/ponytail`(또는 `/ponytail lite`, `/ponytail full`, `/ponytail ultra`)을 쓴다. Grok의 SessionStart 출력은 지시를 주입할 수 없어서 Grok 라이프사이클 훅은 쓰지 않는다.

플러그인 없이도 체크아웃에서 `AGENTS.md`로 지시문만 쓰는 방식은 여전히 동작한다.

## Goose

```bash
goose plugin install https://github.com/DietrichGebert/ponytail.git
```

스킬 여섯 개를 `ponytail:ponytail`, `ponytail:ponytail-review` 같은 이름으로 가져온다. 항상 켜진 규칙을 쓰려면 [`AGENTS.md`](AGENTS.md)를 `~/.agents/AGENTS.md`(또는 프로젝트 안)에 복사한다. `~/.config/goose/.goosehints`도 된다. Goose에는 라이프사이클 훅이 없어서 레벨이 유지되지 않는다.

## Cursor

```bash
git clone https://github.com/DietrichGebert/ponytail
node ponytail/scripts/cursor-hooks.js install
```

네이티브 훅 두 개를 `~/.cursor/hooks.json`에 합치고(`--project`를 붙이면 `<project>/.cursor/hooks.json`에 쓴다) 이미 있던 훅은 그대로 둔다. 항목은 그 체크아웃의 `node`를 실행하므로 체크아웃을 그 자리에 두거나, 옮긴 뒤에는 설치를 다시 돌린다. Cursor는 저장할 때 파일을 다시 불러온다. 새 채팅을 열면 기본 레벨의 규칙 세트가 `sessionStart`로 들어온다. `/ponytail lite`, `/ponytail full`, `/ponytail ultra`, `/ponytail off`를 일반 메시지로 보내면 남은 대화의 레벨이 바뀐다. `/ponytail`은 현재 레벨을 알려 준다. Cursor의 `subagentStart`는 컨텍스트를 주입할 수 없어서 서브에이전트는 규칙 세트 없이 돌고, 클라우드 에이전트에서는 `sessionStart`가 아예 발생하지 않는다. 항상 켜진 규칙(`.cursor/rules/ponytail.mdc`)과 훅은 둘 중 하나만 쓴다. 워크스페이스에 규칙이 있는 동안 훅은 아무것도 주입하지 않고 모드 명령은 안내문으로 답하므로, 훅이 레벨을 관리하게 하려면 규칙을 지운다. 계약, 검증 기록, 한계는 [docs/cursor-hooks.md](docs/cursor-hooks.md)에 있다. 제거: `node ponytail/scripts/cursor-hooks.js uninstall`.

## 설정

모든 새 세션의 레벨은 `PONYTAIL_DEFAULT_MODE` 환경 변수(`lite`/`full`/`ultra`/`off`)나 `~/.config/ponytail/config.json`(Windows에서는 `%APPDATA%\ponytail\config.json`)의 `defaultMode` 필드로 정한다. 기본값은 `full`이다.

켜져 있는 동안 규칙 세트는 Agent 도구로 띄운 모든 서브에이전트에도 주입된다. 특정 에이전트 종류로 범위를 좁히려면(예: 읽기 전용 검색 에이전트에는 주입하지 않기) `PONYTAIL_SUBAGENT_MATCHER` 환경 변수에 서브에이전트의 `agent_type`과 비교할 정규식을 넣는다. 앵커가 없고 대소문자를 구분하지 않는다. `explore|general`은 둘 중 하나에 맞고, `^general$`는 정확히 일치해야 하며, 플러그인 에이전트 종류는 `plugin:name` 꼴이다. 설정하지 않으면 모든 서브에이전트에 주입한다(기본값). 정규식이 잘못되었거나 플랫폼이 서브에이전트 종류를 알려 주지 않을 때도 주입하는 쪽으로 돌아간다.

## Skills CLI

[skills CLI](https://skills.sh)는 ponytail 스킬 여섯 개를 여러 에이전트의 스킬 폴더에 복사한다.

```bash
npx skills add DietrichGebert/ponytail
```

`--agent`로 에이전트를 고르고(IBM Bob이면 `--agent bob`), `--skill '*'`로 묻지 않고 여섯 개를 모두 받으며, 프로젝트 대신 사용자 범위로 설치하려면 `--global`을 붙인다. 이 방법은 스킬만 설치한다. 항상 켜진 규칙 세트도 쓰려면 [`AGENTS.md`](AGENTS.md)를 함께 넣거나 위의 플러그인 중 하나를 쓴다.

## 그 밖의 에이전트 (규칙 파일만)

Cursor([훅 설치](#cursor) 대신 규칙만 쓰는 방법), Windsurf, Cline, GitHub Copilot Chat(독립 실행형 [Copilot CLI](#github-copilot-cli)가 아닌 VS Code, JetBrains, Visual Studio 에디터 확장), Aider, Kiro, Zed, CodeWhale, Qoder: 이 저장소에서 맞는 규칙 파일을 복사한다 ([`.cursor/rules/`](.cursor/rules/), [`.windsurf/rules/`](.windsurf/rules/), [`.clinerules/`](.clinerules/), [`.github/copilot-instructions.md`](.github/copilot-instructions.md), [`AGENTS.md`](AGENTS.md), [`.kiro/steering/`](.kiro/steering/), [`.qoder/rules/`](.qoder/rules/)).

Kiro: `.kiro/steering/ponytail.md`를 `~/.kiro/steering/`(전역)이나 프로젝트의 `.kiro/steering/`에 복사한다.

GitHub Copilot CLI 대체 경로(지시문 전용 모드): 프로젝트의 `AGENTS.md`와 `.github/copilot-instructions.md`를 읽는다. 모든 프로젝트에서 ponytail을 쓰려면 규칙을 `~/.copilot/copilot-instructions.md`에 복사한다. 이 경로는 항상 켜진 지침은 유지하지만 플러그인 모드 전환이나 훅은 더하지 않는다.

Codex 확장을 쓰는 VS Code는 이 저장소에 든 `AGENTS.md`를 읽으므로 저장소 루트에서 설정 없이 동작한다 (`~/.codex/AGENTS.md`를 쓰면 Codex 전역에 적용된다).

JetBrains Junie는 Settings → Tools → Junie → Project Settings → Guidelines Path에서 `AGENTS.md`를 지정하면 읽을 수 있다 (아직 자동이 아니다). 이 저장소에는 `AGENTS.md`가 들어 있다. `.junie/guidelines.md`는 Junie의 예전 경로다.

Amp(Sourcegraph)는 작업 디렉터리부터 `$HOME`까지 상위 디렉터리의 `AGENTS.md`를 읽는다. 이 저장소에 들어 있으므로 설정 없이 동작한다 (`~/.config/amp/AGENTS.md`는 전역으로 동작한다).

Jules(Google)는 저장소 루트의 `AGENTS.md`를 읽는다. 이 저장소에 들어 있으므로 설정 없이 규칙 세트를 불러온다.

## 제거

| 호스트 | 명령 |
|------|---------|
| Claude Code | `/plugin remove ponytail` |
| Codex | `codex plugin remove ponytail` |
| Devin CLI | `devin plugins remove ponytail` |
| Grok Build | `grok plugin uninstall ponytail` |
| Pi agent | `pi uninstall ponytail` |
| Kimi Code | Kimi Code에서 `/plugins`를 연 뒤 ponytail 제거 |
| Skills CLI | `npx skills remove ponytail ponytail-audit ponytail-debt ponytail-gain ponytail-help ponytail-review` (설치할 때와 같은 `--agent` / `--global` 플래그) |
| Oh My Pi (omp) | `omp plugin uninstall ponytail@ponytail`, 그다음 `omp plugin marketplace remove ponytail` |
| OpenCode | `opencode plugin remove @dietrichgebert/ponytail` |
| Cursor 훅 | `node scripts/cursor-hooks.js uninstall` (프로젝트 수준 설치면 `--project` 추가). `hooks.json`에서 ponytail 항목만 지운다 |
| Cursor 규칙 / Windsurf / Cline / Qoder 등 | 복사한 규칙 파일을 지운다 |

이 명령들은 플러그인 자체 파일을 지운다. ponytail이 플러그인 폴더 밖에 쓴 약간의 상태는 남는다. 모드 플래그(`~/.claude/.ponytail-active`, Cursor는 `~/.cursor/.ponytail-active`), `~/.config/ponytail/config.json`, 상태줄 스크립트 사본(`~/.claude/ponytail-statusline.sh` 또는 `.ps1`), `~/.cursor/hooks.json`의 ponytail 항목, 그리고 (설정 안내를 수락했다면) `~/.claude/settings.json`의 `statusLine` 항목이다. 이것들을 지우기 전까지 상태줄 배지는 마지막 모드를 계속 보여 준다. 이것까지 정리하려면 `node scripts/uninstall.js`를 실행한다. **위의 호스트 제거 명령보다 먼저 실행해야 한다.** 이 스크립트도 플러그인 파일이라 플러그인을 먼저 지우면 함께 사라진다 (아니면 이 저장소를 따로 클론해서 실행한다). statusLine 항목은 ponytail 자체 스크립트를 가리킬 때만 지우므로, 직접 설정한 상태줄은 건드리지 않는다.
