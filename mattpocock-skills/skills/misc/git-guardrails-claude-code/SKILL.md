---
name: git-guardrails-claude-code
description: "위험한 git 명령(push, reset --hard, clean, branch -D 등)을 실행 전에 막는 Claude Code 훅을 설정한다. 사용자가 파괴적인 git 작업을 막고 싶을 때, git 안전 훅을 추가하고 싶을 때, Claude Code에서 git push나 reset을 막고 싶을 때 쓴다."
---

# Git 자동 검사 장치 설정

위험한 git 명령을 Claude가 실행하기 전에 가로채서 막는 PreToolUse 훅을 설정한다.

## 막는 명령

- `git push` (`--force`를 포함한 모든 형태)
- `git reset --hard`
- `git clean -f` / `git clean -fd`
- `git branch -D`
- `git checkout .` / `git restore .`

명령이 막히면 Claude는 이 명령을 쓸 권한이 없다는 메시지를 받는다.

## 단계

### 1. 적용 범위 묻기

사용자에게 **이 프로젝트에만**(`.claude/settings.json`) 설치할지 **모든 프로젝트에**(`~/.claude/settings.json`) 설치할지 묻는다.

### 2. 훅 스크립트 복사

함께 제공되는 스크립트는 [scripts/block-dangerous-git.sh](scripts/block-dangerous-git.sh)에 있다.

적용 범위에 맞는 위치에 복사한다.

- **프로젝트**: `.claude/hooks/block-dangerous-git.sh`
- **전역**: `~/.claude/hooks/block-dangerous-git.sh`

`chmod +x`로 실행 권한을 준다.

### 3. 설정에 훅 추가

알맞은 설정 파일에 추가한다.

**프로젝트** (`.claude/settings.json`):

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/block-dangerous-git.sh"
          }
        ]
      }
    ]
  }
}
```

**전역** (`~/.claude/settings.json`):

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/block-dangerous-git.sh"
          }
        ]
      }
    ]
  }
}
```

설정 파일이 이미 있으면 기존 `hooks.PreToolUse` 배열에 훅을 합친다. 다른 설정을 덮어쓰지 마라.

### 4. 차단 목록 조정 여부 묻기

차단 목록에 패턴을 더하거나 빼고 싶은지 사용자에게 묻는다. 답에 맞게 복사한 스크립트를 고친다.

### 5. 확인

간단히 테스트한다.

```bash
echo '{"tool_input":{"command":"git push origin main"}}' | <path-to-script>
```

종료 코드 2로 끝나고 stderr에 BLOCKED 메시지를 출력해야 한다.
