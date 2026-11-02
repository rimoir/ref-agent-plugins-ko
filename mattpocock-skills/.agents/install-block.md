# 표준 설치 안내 블록

설치 방법은 하나의 설명, 하나의 문구로만 안내한다. `README.md`, `.changeset/*`, `docs/` 아래 모든 페이지는 **이 내용**만 쓰고 다른 말을 하지 않는다. 바꿀 때는 여기부터 고친 다음 다른 곳에 반영한다.

## 관리형 설치를 먼저

스스로 업데이트되는 설치를 먼저 안내한다. 그런 설치가 없는 에이전트에만 skills.sh를 "수동 업데이트"라고 표시해 대안으로 안내한다. 사용자가 명령을 실행하지 않아도 업데이트될 때만 관리형 경로라고 부른다. 한 번만 켜면 되는 설정이 있으면 그 설치 명령 옆에 적는다. "즉시"라고 약속하지 않는다.

Claude Code는 공식 마켓플레이스 `claude-plugins-official`에서 설치한다. 다른 관리형 경로는 모두 이 저장소의 자체 마켓플레이스(`.claude-plugin/marketplace.json`과 `plugin.json`)에서 설치한다. 이 경로들은 `plugin.json`의 `version`이 바뀔 때만 다시 설치한다. Release 워크플로가 `npm run version`을 실행해 `package.json`의 버전을 이 필드에 복사하므로, 사용자는 "chore: version skills" PR이 병합될 때 릴리스를 받는다.

| 에이전트       | 경로                             | 스스로 업데이트되는가?                                            |
| -------------- | -------------------------------- | ----------------------------------------------------------------- |
| Claude Code    | `@claude-plugins-official`       | 예, 기본으로                                                      |
| Codex          | `@mattpocock` 마켓플레이스       | 예, 시작할 때, 기본으로                                           |
| Copilot CLI    | `@mattpocock` 마켓플레이스       | 예, `autoUpdate: true`를 한 번 설정한 뒤                          |
| VS Code        | Chat: Install Plugin From Source | 예, 매일, 기본으로                                                |
| Gemini CLI     | `gemini skills install` (복사)   | 아니요. Gemini 확장을 만들려면 평평한 `skills/<name>/` 구조가 필요하다 |
| 그 밖의 에이전트 | skills.sh                      | 아니요. `npx skills update`를 실행하고, 새 스킬은 `add`를 다시 실행한다 |

출처(2026-10-08): Codex `core-plugins/src/manager.rs`, Copilot [cli-config-dir-reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-config-dir-reference), VS Code `pluginAutoUpdate.ts`, Gemini `skillLoader.ts`.

Auggie, Droid, Qwen, Goose는 아직 아무도 이 저장소로 돌려 보지 않았다. 누군가 돌려 볼 때까지 skills.sh로 안내한다.

## Claude Code

<canonical-block name="claude-code">

```bash
claude plugin install mattpocock-skills@claude-plugins-official
```

Updates itself by default.

</canonical-block>

## Codex

<canonical-block name="codex">

```bash
codex plugin marketplace add mattpocock/skills
codex plugin add mattpocock-skills@mattpocock
```

Updates itself at startup.

</canonical-block>

## GitHub Copilot (CLI와 VS Code)

`copilot plugin install mattpocock/skills`가 아니라 마켓플레이스를 쓴다. Copilot은 저장소 직접 설치를 지원 중단했고, 그렇게 설치하면 자동 업데이트도 되지 않는다. `extraKnownMarketplaces` 항목은 문서에 적힌 스키마를 따르지만 아직 아무도 돌려 보지 않았다.

<canonical-block name="copilot">

```bash
copilot plugin marketplace add mattpocock/skills
copilot plugin install mattpocock-skills@mattpocock
```

Then, once, add to `~/.copilot/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "mattpocock": { "source": { "source": "github", "repo": "mattpocock/skills" }, "autoUpdate": true }
  }
}
```

In VS Code, run **Chat: Install Plugin From Source** and enter `https://github.com/mattpocock/skills`. It updates daily.

</canonical-block>

## Gemini CLI

Gemini는 `.claude-plugin`을 읽지 않고, `--path`는 버킷 하나만 받는다. 승격된 버킷마다 한 번씩 설치하면 승격된 스킬 묶음이 정확히 들어온다(스킬 27개, 2026-10-07 확인).

<canonical-block name="gemini">

```bash
gemini skills install https://github.com/mattpocock/skills.git --path skills/engineering
gemini skills install https://github.com/mattpocock/skills.git --path skills/productivity
```

Re-run both commands to update.

</canonical-block>

## 그 밖의 에이전트, 또는 수정할 수 있는 파일 (skills.sh)

`-a`는 에이전트를 미리 고른다. 주석에 적힌 에이전트는 모두 2026-10-07에 돌려 보았다. `amp skill add`나 `pi install git:…` 같은 에이전트 자체 저장소 설치 도구보다 skills.sh를 쓴다. 그런 도구는 `misc/`와 `in-progress/`까지 가져오기 때문이다. `npx skills update`는 `add` 이후 upstream에 추가된 스킬을 건너뛰므로, 블록에서 `add`를 다시 실행하라고 안내한다.

<canonical-block name="other-agents">

```bash
npx skills@latest add mattpocock/skills -a <agent>  # cursor, opencode, devin, windsurf, amp, pi; omit -a to choose
```

When the installer asks which skills to take, include `setup-matt-pocock-skills`. To update, run `npx skills@latest update`, and re-run `add` to pick up new skills.

</canonical-block>

스킬 하나만 따로 언급하는 곳에는 단일 스킬 형태를 쓴다. `docs/` 페이지는 이 블록을 쓰지 않는다. ai-hero가 본문 위에 설치 위젯을 표시하기 때문이다. [writing-docs.md](./writing-docs.md)를 본다.

<canonical-block name="skills-sh-one-skill">

```bash
npx skills@latest add mattpocock/skills --skill=<name>
```

```bash
npx skills@latest update <name>
```

</canonical-block>

모든 곳에서 `skills@latest`로 고정해 쓴다.

## 설치 방법은 하나만 고른다

플러그인은 구독해서 받는 관리형 읽기 전용 묶음이다. skills.sh는 사용자가 소유하고 수정하는 파일을 쓴다. 둘 다 설치하면 모든 스킬이 두 개씩 생긴다. 그러니 항상 "하나만 고른다"고 안내한다.
