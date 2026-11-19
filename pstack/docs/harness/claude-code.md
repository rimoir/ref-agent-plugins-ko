# Claude Code에서 쓰는 pstack

pstack 스킬은 Cursor 이름을 쓴다. Claude Code에서는 세션마다 이 파일을 한 번 읽고, 스킬에 나오는 Cursor 이름을 아래 표로 대응시킨다. `<pstack>`은 `skills/`와 `docs/`를 담은 폴더를 뜻한다. 표에 행이 없는 Cursor 필드는 빼고 뺐다고 말한다. 도구 스키마가 거부하는 필드나 값은 절대 넘기지 않는다.

## 도구

| Cursor | Claude Code |
| --- | --- |
| `Task` | `Agent` |
| `AskQuestion` | `AskUserQuestion`. `-p` 모드에는 없으므로 평범한 글로 묻는다. |
| 할 일 목록 열기, 또는 단계를 할 일 목록 도구에 복사하기 | 세션에 `TodoWrite`가 있으면 쓴다. 없으면 목록을 답변 안에 두고 phase마다 갱신한다. |
| 다른 pstack 스킬 실행(`/name` 또는 "**name** 스킬") | `<pstack>/skills/<name>/SKILL.md`를 `Read`로 읽고 따른다. `Skill` 도구는 pstack 스킬 대부분을 거부한다. 사용자에게 입력하라고 안내할 때는 `/pstack:<name>`으로 쓴다. |
| `Grep`, `Glob` | 세션에 `Grep`이나 `Glob`이 없으면 `Bash`로 `rg`를 쓴다. |

## Subagent 필드

| Cursor | Claude Code |
| --- | --- |
| `subagent_type: generalPurpose` | `subagent_type: "general-purpose"` |
| `poteto-agent`, `comment-sicko` | `pstack:poteto-agent`, `pstack:comment-sicko` |
| `poteto-agent` 파일의 `model:` 줄 | Cursor slug가 들어 있다. `pstack:poteto-agent`를 띄우는 `Agent` 호출마다 모델 표로 대응시킨 `model`과 `effort`를 넘겨서 그 slug가 API에 닿지 않게 한다. |
| `readonly: true` | `subagent_type: "Explore"`. 이 에이전트도 `Bash`를 쓸 수 있으므로 지시에 "파일을 고치지 않는다"를 함께 적고, 끝난 뒤 `git status`를 확인한다. |
| `readonly: false` | `general-purpose`. 세션의 MCP 서버를 그대로 쓴다. |
| `environment: "cloud"` | `isolation: "worktree"`. 작업자가 체크아웃할 브랜치나 커밋을 지정한다. |
| `environment: "local"` | 뺀다. |
| `cloud_base_branch: <b>` | 작업자에게 먼저 `<b>`를 체크아웃하라고 지시한다. |
| `run_in_background: true` | 뺀다. subagent는 기본으로 백그라운드에서 돌고 끝나면 알려 준다. |
| `resume` | 새 에이전트를 띄우고 앞선 결과를 지시에 붙여 넣는다. |
| `file_attachments` | 지시에 경로를 나열한다. |

## 모델

| Cursor | Claude Code |
| --- | --- |
| `claude-<family>-<version>-<effort>[-fast]`, 예: `claude-opus-5-5-xhigh` | `model: "opus"`와 `effort: "xhigh"`. `model`은 `opus`, `sonnet`, `haiku`, `fable`만 받는다. `-fast`는 버린다. |
| `gemini-*` 같은 Claude가 아닌 slug | `model`을 빼서 에이전트가 세션 모델로 돌게 하고, 그렇다고 말한다. |
| `auto` 또는 `inherit-parent` | `model`을 뺀다. |
| `pstack-models.mdc` 규칙, `~/.cursor/rules/pstack-models.mdc` | `~/.claude/rules/pstack-models.md`. Claude Code는 새 세션마다 이 파일을 불러오므로 역할 줄이 이미 컨텍스트에 있다. 없으면 파일을 읽는다. 파일이나 그 역할의 줄이 없으면 스킬의 기본 slug를 쓴다. |
| 역할 값 `<model> <effort>`, 예: `opus high` | `model: "opus"`와 `effort: "high"`. |

## setup-pstack

Claude Code는 새 세션마다 `~/.claude/rules/`의 모든 `.md` 파일을 불러오므로 `setup-pstack`은 규칙을 거기에 쓴다. 단계는 다음만 바꿔서 따른다.

- 감지. 감지한 모델은 `Agent` 도구 스키마가 나열하는 `model` 값이고, 각각 `effort` 값 중 하나를 effort로 갖는다. 실제 모델은 `opus xhigh`처럼 `<model> <effort>`로 쓴다. effort가 마지막 토큰이므로 예산 단계가 쓰인 그대로 동작한다.
- 기본값. 기본 slug마다 위의 행으로 대응시킨다. `claude-opus-5-5-xhigh-fast`는 `opus xhigh`, `claude-opus-5-5-high-fast`는 `opus high`, `claude-fable-5-2-high`는 `fable high`, `gemini-4-neon-high`는 `inherit-parent`다.
- 쓰기. frontmatter 없이 `~/.claude/rules/pstack-models.md`를 쓰고, 그다음 주석 줄, `# budget` 줄, 5단계의 역할마다 한 줄을 쓴다. 파일 전체를 덮어쓴다. 역할 줄을 `CLAUDE.md`나 `AGENTS.md`에 절대 넣지 않는다.

## 경로

| Cursor | Claude Code |
| --- | --- |
| `.cursor/skills/`, `~/.cursor/skills/` | `.claude/skills/`, `~/.claude/skills/` |
| `~/.cursor/plugins/`, `.cursor-plugin/plugin.json` | `~/.claude/plugins/`, `.claude-plugin/plugin.json` |
| `.cursor/rules/*.mdc`, 항상 적용되는 규칙 | `CLAUDE.md`, `CLAUDE.md`가 없으면 `AGENTS.md`. Claude Code는 `.mdc` 파일을 읽지 않는다. 모델 규칙은 예외다. 모델 절을 본다. |
| `https://github.com/cursor/plugins/blob/main/pstack/<path>` | 그 파일이 있으면 `<pstack>/<path>`. 플러그인은 스킬, `docs/guide/`, `README.md`를 함께 배포한다. 로컬 사본을 읽고 원격에서 가져오지 않는다. 사용자에게 링크가 필요하면 URL을 준다. |
| `~/.cursor/projects/<slug>/agent-transcripts/`의 대화 기록 | `~/.claude/projects/<slug>/<session>.jsonl`. slug는 워크스페이스 경로의 `/`와 `.`를 모두 `-`로 바꾼 것이다. 그래서 `/Users/you/proj`는 `-Users-you-proj`가 된다. 그 폴더 바로 아래에서 가장 최근 `.jsonl`이 현재 세션이다. 그 세션의 `<session>/subagents/` 폴더에 subagent 대화 기록이 있다. 이 워크스페이스의 폴더만 읽는다. |

## Cursor 전용 기능

Claude Code에는 Cursor Automations, Bugbot, Cursor 클라우드 에이전트, 내장 PR 도구가 없다. 어떤 단계에 그중 하나가 필요하면 답변에 `Skipped in Claude Code: <step>. <reason>.` 한 줄을 넣고 다음 단계로 간다. 멈추거나, 묻거나, 다시 시도하지 않는다. 건너뛴 단계가 만들었어야 할 URL이나 키 같은 것이 뒤 단계에 필요하면 placeholder를 남기고 그 줄에 이름을 밝힌다.

| Cursor | Claude Code |
| --- | --- |
| Cursor Automations: routine, `update_state` routine 호출, `api2.cursor.sh/automations` webhook, routine 깨우기, `SendToUser` 비밀 값 요청 | 그 한 줄을 남기고 건너뛴다. |
| Bugbot | GitHub PR의 Bugbot 댓글은 평범한 리뷰 스레드이므로 단계가 주는 forge 명령으로 분류한다. PR에 Bugbot 검사나 댓글이 없으면 Bugbot을 시작하거나, 기다리거나, 설정하는 단계는 건너뛴다. |
| Cursor 클라우드 에이전트 | `environment: "cloud"`는 Subagent 필드 표대로 worktree에 대응한다. 대시보드 상태나 그 에이전트 전용 머신처럼 클라우드 에이전트 자체가 필요한 단계는 건너뛴다. |
| 내장 PR 도구 | `gh pr create`처럼 단계가 주는 forge 명령을 쓴다. 건너뛰는 것이 아니므로 그 줄을 쓰지 않는다. |
