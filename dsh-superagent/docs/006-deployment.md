# 006 배포

이 안내서는 dsh-superagent를 설치하고 설정하고 운영하는 방법을 다룬다. 계정, 시작 점검, 업그레이드, 문제 해결을 설명하며 [001 Domain model](001-domain.md)부터 [005 Panel](005-panel.md)까지의 내용을 바탕으로 한다.

## 실행되는 것

- **전용 DeepSeek Harness 프로필.** 이 안내서에서는 `superagent`라고 부른다. Web 프로필 템플릿으로 만든다. 이 프로필이 번들을 불러오고 `127.0.0.1`에서 패널을 띄운다. 평소 작업하는 프로필과 분리한다. 플러그인이 프로세스 전체의 `PATH`와 git 설정을 바꾸고, 이 프로세스는 따로 재시작하고 업그레이드해야 하기 때문이다.
- **에이전트용 GitHub 계정.** 에이전트는 이 계정으로만 로그인한 GitHub CLI를 써서 이 계정 이름으로 댓글을 달고, 브랜치를 푸시하고, pull request를 연다.
- **선택:** 채팅 요청을 받을 Feishu 봇

플러그인 설정에는 상태 디렉터리와 머신 한도만 둔다. 나머지는 모두 패널에서 정한다. Sources에서 저장소와 계정을, Policy에서 허용 목록을, Execution에서 워커 디렉터리와 명령을 설정한다.

### 권한과 격리

번들은 Executor용 `dsh-superagent-worker`와 메인 Session용 `dsh-superagent-router`를 정의한다. 둘 다 DeepSeek Harness 프리셋 목록에 나타나지만 dsh-superagent 전용이다. 개인 Session에서 고르지 말고 설정 행을 끄지도 않는다. 애플리케이션이 자기 Session을 만들고 재개하려면 이 프리셋이 필요하다.

Web UI에서 빈 관리 Session을 열면 프로필의 기본 프리셋이 선택될 수 있다. dsh-superagent는 첫 턴 전에 역할에 맞는 프리셋으로 되돌린다.

두 프리셋 모두 운영자의 OS 사용자 권한에서 `danger-full-access`로 돌고, 구독한 Thread의 메시지를 읽는다. 계정 래퍼는 기본으로 쓸 에이전트 자격 증명을 고를 뿐 프로세스를 격리하지 않는다. 워커는 경로를 지정해 프로그램을 실행할 수 있고 운영자의 홈 디렉터리를 읽을 수 있다. 격리가 필요하면 에이전트 자격 증명만 둔 전용 OS 계정을 쓴다.

## 사전 요구 사항

- Node.js 22.19 이상 또는 24 이상, pnpm, git 2.32 이상, Python 3.8 이상, tmux
- GitHub CLI(`gh`) 2.48 이상. Source의 CLI 필드는 `gh`나 `lark-cli` 래퍼를 가리켜야 한다. 호스트가 이 도구들의 하위 명령과 출력 형식에 기대기 때문이다.
- github.com의 저장소. GitHub Enterprise Server는 지원하지 않는다. Ticket마다 체크아웃을 만들려면 prepare 명령이 worktree를 추가할 로컬 클론을 둔다. 그 저장소가 Git LFS를 쓰면 `git-lfs`를 설치한다.
- DeepSeek Harness에 설정한 모델 제공자. Eval이나 Execution 설정에서 다른 모델을 지정하지 않으면 dsh-superagent는 프로필의 기본 모델을 쓴다.
- Feishu를 쓴다면 `lark-cli`(1.0.90에서 테스트함)와 봇이 있는 Feishu 또는 Lark 앱

## 계정

### 에이전트 GitHub 계정

1. 에이전트용 GitHub 사용자 계정을 만들고 저장소 쓰기 권한을 준다. dsh-superagent가 계정의 알림을 읽으므로 GitHub App은 에이전트가 될 수 없다.
2. 그 계정의 자격 증명만 쓰는 GitHub CLI를 만든다.

   ```sh
   mkdir -p ~/.local/bin
   cat > ~/.local/bin/gh-agent <<'EOF'
   #!/bin/sh
   GH_CONFIG_DIR="$HOME/.config/gh-agent" exec gh "$@"
   EOF
   chmod +x ~/.local/bin/gh-agent
   gh-agent auth login
   gh-agent api user --jq .login
   ```

   에이전트 계정으로 로그인한다. 마지막 명령이 그 계정의 login을 출력한다. dsh-superagent도 같은 방법으로 login을 읽는다.

### Feishu 봇 (선택)

1. 봇 기능이 있는 자체 개발 앱을 만든다. 메시지 이벤트 수신, 채팅 메시지 읽기와 보내기, 채팅 멤버 읽기 권한을 주고 앱 버전을 게시한다.
2. 봇 신원으로만 제한한 전용 `lark-cli` 설정과 래퍼를 봇에 준다.

   ```sh
   LARKSUITE_CLI_CONFIG_DIR="$HOME/.lark-cli-dsh-superagent" lark-cli config init --app-id <cli_…> --app-secret-stdin
   LARKSUITE_CLI_CONFIG_DIR="$HOME/.lark-cli-dsh-superagent" lark-cli config strict-mode bot --global
   cat > ~/.local/bin/lark-bot <<'EOF'
   #!/bin/sh
   export LARKSUITE_CLI_CONFIG_DIR="$HOME/.lark-cli-dsh-superagent"
   exec lark-cli "$@"
   EOF
   chmod +x ~/.local/bin/lark-bot
   ```

   첫 명령은 표준 입력에서 앱 시크릿을 읽는다. 설정 디렉터리는 따로 둔다. `lark-cli`는 앱 id 하나에 프로필 하나만 허용하고, 개인 설정에 이미 그 앱의 사용자 로그인이 있을 수 있다.

   호스트는 사용자로 행동할 수 있는 CLI를 거부한다. 앱 id, Feishu/Lark 브랜드, 봇 `open_id`는 봇 설정에서 읽는다.

   두 설정은 앱 시크릿의 키체인 항목을 함께 쓴다. 봇 설정만 지우려면 그 디렉터리를 삭제한다. `lark-cli config remove`는 공유 시크릿까지 건드리므로 실행하지 않는다.

## 설치

`superagent` 프로필이 아직 없는 머신에서 아래 블록을 한 번 실행한다.

```sh
npm install -g @deepseek-ai/dsh@0.2.1-rc.3
git clone <this repository> dsh-superagent && cd dsh-superagent
pnpm install && pnpm build
dsh superagent --from-default-profile web --dump-config > /dev/null
dsh plugin --profile superagent add "link:$PWD"
```

위에 고정한 버전은 공개 버전이다. 다른 버전은 `package.json`의 `engines.dsh`를 만족해야 한다.

네 번째 명령은 DeepSeek Harness Web 템플릿으로 `~/.dsh/profiles/superagent`를 만든다. 다섯 번째 명령은 이 번들을 설치한다. 기본 `~/.dsh` 디렉터리를 옮기려면 `DSH_HOME`을 설정한다.

프로필 생성 명령은 새로 설치할 때만 실행한다. 프로필이 이미 있으면 이 명령이 프로필을 바꿔 버리고 머신 설정이 든 `cordis.patch.yml`도 지운다. 업그레이드에는 쓰지 않는다.

## 머신 설정

[examples/profile.cordis.patch.yml](../examples/profile.cordis.patch.yml)을 `~/.dsh/profiles/superagent/cordis.patch.yml`로 복사해 그 파일을 덮어쓰고, 모든 `<placeholder>`를 채운다. Feishu를 쓰면 그 파일의 `dsh-superagent-feishu` 항목도 켠다. `webserver` 항목이 패널의 포트를 정한다.

| 키 | 필수 | 의미 |
| --- | --- | --- |
| `stateDir` | 예 | 절대 경로. 데이터베이스, 잠금, `worker-bin`의 명령 shim, 에이전트의 git 설정, 그리고 기본값으로 `work` 아래 Ticket 디렉터리가 여기 놓인다. 업그레이드 전에 백업한다 |
| `promptMaxChars`, `admissionContextMaxPages`, `admissionContextTimeoutMs` | 아니요 | 저장할 수 있는 프롬프트 설정의 최대 크기, 평가 한 번이 읽는 Thread 페이지 수와 제한 시간 |

처음 시작한 뒤에는 **Settings → Deployment**나 DeepSeek Harness Plugin Manager에서 머신 한도를 고친다. 바꾼 값은 재시작 없이 적용된다. `stateDir`은 거기서 바꿀 수 없다. 값이 잘못됐거나 모르는 설정 키가 있으면 시작하지 않고, 로그가 그 키를 알려 준다.

## 시작과 중지

```sh
scripts/dsh-superagent start
scripts/dsh-superagent status
```

`start`는 tmux 세션 `dsh-superagent`에서 `dsh --profile superagent`를 실행한다. 다른 프로필이면 세션 이름은 `dsh-<profile>`이다. 런타임이 준비되거나 설정 요구 사항을 알릴 때까지 최대 1분 기다린다. 처음 실행하면 빠진 설정 정보를 출력한다. 이 스크립트 밖에서 띄운 것까지 포함해 중복 인스턴스는 거부한다.

`stop`과 `restart`는 정상 종료를 요청하고 Executor를 최대 5분 기다린다. 프로세스를 강제로 죽이거나 다른 tmux 세션을 건드리지 않는다.

`status`는 프로세스 id, 상태, 설정 문제를 출력한다. 다른 프로필이나 포트를 쓰려면 `--profile`과 `--url`을 주거나 `DSH_SUPERAGENT_PROFILE`과 `DSH_SUPERAGENT_URL`을 설정한다.

`status`, `start`, `restart`는 네 가지 종료 코드 중 하나로 끝난다.

| 코드 | 의미 |
| --- | --- |
| 0 | 서비스가 정상으로 돈다 |
| 1 | 돌지 않거나, 두 개가 돌거나, 응답하지 않거나, 런타임이 오류를 알린다. 재시작으로 고쳐질 수 있다 |
| 2 | 돌고 있지만 런타임이 아닌 부분, 예를 들어 Source나 Policy 동기화(`sync:<source id>`)가 오류를 알린다. 재시작으로 고쳐지지 않는다 |
| 3 | 돌고 있으며 설정을 기다린다. 재시작으로 고쳐지지 않는다 |

아직 시작 중인 Source도 정상으로 친다. 설정 단계에서 확인하지 못한 Feishu 봇도 마찬가지다.

`status`는 실패한 부분과 그 상세를 `errors`에, 설정 요구 사항을 `setup`에 담아 돌려준다. `start`와 `restart`는 그 문제를 한 줄씩 출력하고, 서비스가 끝내 뜨지 않으면 1로 끝난다. 자동 복구를 멈추는 것은 의도적인 `stop`뿐이다.

프로필마다 로그와 제어 파일을 `.artifacts/` 아래에 둔다.

- 시작 로그: `dsh-superagent-<profile>-<date>-<time>-<pid>.log`. pid는 스크립트의 것이다. 최신 20개를 남긴다.
- 제어 파일: `control/profiles/<profile>/`. 중지 표시, 잠금, 프로세스 id가 들어 있다.

로그에 찍힌 URL을 열고 사이드바에서 **Superagent**를 고른다.

### 매시간 점검

매시간 점검은 `superagent`가 아니라 평소 쓰는 DeepSeek Harness 프로필에 만든다. 에이전트 서비스가 내려가 있어도 점검은 계속 돌아야 하기 때문이다. 그 프로필의 에이전트에게 체크아웃 경로를 채운 아래 프롬프트로 매시간 일정을 만들어 달라고 한다.

```text
dsh-superagent를 점검해 줘. <checkout>에서 `scripts/dsh-superagent --profile superagent status`를 실행해. 종료 코드가 0이면 아무것도 하지 말고 아무 말도 하지 마. 2면 재시작하지 말고 `errors` 아래 각 부분과 상세를 알려 줘. 같은 내용을 이미 알려 줬다면 생략해. 3이면 재시작하지 말고 `setup`이 말하는 필요한 설정을 알려 줘. 이미 알려 줬다면 생략해. manually_stopped: true가 나오면 멈춘 채로 둬. 그 밖의 경우(종료 코드 1)에는 `scripts/dsh-superagent --profile superagent --respect-stop restart`를 실행해. 이 명령도 같은 방식으로 끝나. 0이면 복구된 것이니 아무 말도 하지 마. 2와 3은 위와 같이 알려 줘. 1로 끝나거나 다른 식으로 실패하면 가장 최근의 .artifacts/dsh-superagent-superagent-*.log와 docs/006-deployment.md의 "문제 해결" 절을 읽고, 고칠 수 있는 건 고친 다음 무엇이 문제였고 무엇을 했는지 알려 줘.
```

`--respect-stop`은 의도적인 중지를 지켜 준다. 중지 표시는 `stop`만 쓰고 `start`가 지운다. `restart`는 표시를 쓰지 않으므로, 종료가 시간 초과된 재시작도 점검이 복구할 수 있다.

## 설정

폴링이나 작업이 시작되려면 먼저 설정이 성공해야 한다. Overview는 빠진 요구 사항을 나열하고 해당 설정으로 링크한다. 설정을 바꾸면 설정 과정이 다시 돈다. CLI 인증처럼 애플리케이션 밖에서 고친 것이 있으면 **Check again**을 누른다.

1. **Sources.** GitHub 저장소(`owner/name`)와 에이전트 CLI를 정한다. 예: `/home/me/.local/bin/gh-agent`. 요청은 보통 에이전트 계정의 알림으로 들어온다. 계정을 멘션한 새 Issue나 댓글은 다음 폴링 때 들어온다. 기존 Issue 본문을 고쳐 멘션을 추가하면 들어오지 않으니 새 댓글을 단다. Feishu는 봇 CLI, 채팅, 채팅마다 전부 받기와 멘션만 받기 중 어느 모드인지, 다이렉트 메시지를 받을지를 정한다.
2. **Policy.** 예시 규칙 두 개는 고치거나 지울 수 있다. **On each Source** 아래에 작업을 요청할 수 있는 GitHub 계정과 Feishu 사용자를 추가한다. 목록에 아무도 없으면 어떤 요청도 Ticket이 되지 않는다. Feishu에서는 목록을 동기화할 채팅을 고를 수 있다. 동기화는 시작할 때와 **Sync now**를 누를 때 일어난다.
3. **Execution.** 디렉터리 루트와 prepare 명령을 정한다. Ticket마다 저장소 체크아웃을 주려면 다음과 같이 한다.

   ```sh
   git -C /home/me/src/widgets fetch --no-tags "https://github.com/$DSH_SUPERAGENT_GITHUB_REPOSITORY.git" "${DSH_SUPERAGENT_GITHUB_PR_HEAD:-HEAD}:refs/dsh-superagent/$DSH_SUPERAGENT_TICKET" &&
   git -C /home/me/src/widgets worktree add -b "agent/$DSH_SUPERAGENT_NAME" "$DSH_SUPERAGENT_DIR" "refs/dsh-superagent/$DSH_SUPERAGENT_TICKET"
   ```

   본인 계정으로 로그인한 CLI 같은 개인 CLI는 차단 명령에 넣는다.
4. **Prompts.** 팀 섹션을 정한다. GitHub 고지 문구, 리뷰 봇, 커밋 작성자, 자동 병합 조건이다.

### 관리 API

패널은 로컬 HTTP API를 쓰고, 에이전트도 이 API를 부를 수 있다. `SETUP.md`는 이 API로 설정을 저장하고, 서비스 스크립트는 `GET state`를 읽는다.

요청은 `x-orchestrator-request: 1`을 붙여 `http://127.0.0.1:<port>/orchestrator/api/`로 보낸다. 호스트는 `127.0.0.1:<port>`나 `localhost:<port>`여야 한다. 헤더가 빠졌거나 다른 사이트의 `Origin`이 오면 403을 받는다.

API로 저장하면 패널과 같은 권한을 가진다. 메인 Session의 도구로 저장할 때와 달리 실행 환경과 설정 계정 필드도 바꿀 수 있다.

에이전트가 기대도 되는 경로와 필드는 아래와 같다. `src/app/api.ts`의 나머지 경로는 패널을 위한 것이고 패널과 함께 바뀐다.

| 요청 | 응답 |
| --- | --- |
| `GET state` | 모든 페이지가 읽는 것. `setup`에는 `problem`과 `feishuProblem`이 있고, 각각 `null`이거나 `place`, `code`, `values`, `detail`을 가진 설정 문제다. 설정이 계정을 확인하면 `accounts`도 들어간다. `health`는 아래 표의 부분마다 항목 하나이고 `state`(`starting`, `ready`, `paused`, `error`), `detail`, `at`을 가진다. `load`는 `running` 중인 Executor Session, `queued`된 Ticket, `maxWorkers`다. 그리고 `paused`와 `masterId`가 있다 |
| `GET settings` | `blocks`: `policy`, `eval`, `executor`가 각각 `value`와 `revision`을 가진다. `sources`: Source 인스턴스 목록이다. 각각 `id`, `kind`, `installed`, 블록의 `value`인 `{"enabled": …, "config": {…}}`, `revision`, kind의 폼, 그리고 설정 `problem`이 있으면 그것을 가진다. 그 밖에 `policyVersion`, 실행 환경의 `root`와 `variables`를 담은 `environment`가 있다 |
| `GET sources` | Source별 상태. `state`(`missing`, `off`, `error`, `setup`, `starting`, `paused`, `ready`), 부분별 `health`, 설정 `problem`, 최근 하루의 `stats`, 그날 `filtered`한 Trigger, 그날 `dropped`한 메시지가 있다. 버린 메시지는 최신순이고 각각 `channel`, `preview`, Ticket에 속했다면 `ticket`(`id`와 `title`), 저장소에 있으면 `thread`, 그리고 `dropped.at`과 `dropped.reason`(`channelGone` 또는 `channelIgnored`)을 가진다 |
| `PUT settings/<block>`, 본문 `{"value": …, "revision": n}` | 블록 하나를 저장한다. 응답은 `saved`, 블록의 새 `revision`, `policy_changed`, `restarting`이다. `value`는 `GET settings`가 보여 주는 블록 전체다. 빠진 키는 기본값을 쓴다 |
| `POST executor/pause`, 본문 `{"paused": true}` 또는 `false` | 처리를 멈추거나 재개한다. 응답은 `paused`다 |
| `POST setup/check` | dsh-superagent를 재시작해 설정을 다시 돌린다. 응답은 `restarting: true`다. 설정에 고칠 것이 없으면 거부한다 |
| `POST policy-sync/<source id>` | 그 Source의 허용 목록을 지금 동기화한다. 응답은 저장된 그 Source의 부분인 `policy`다 |
| `GET prompts`, `PUT prompts`, 본문 `{"config", "baseRevision"}` | 프롬프트 설정을 읽는다. 응답은 `revision`과 `config`를 담은 `current`, `defaults`, Session이 읽는 순서대로 나열한 팀 섹션 `sections`, 팀 스킬 이름의 패턴 `skillName`, 팀 스킬이 쓸 수 없는 이름 `builtin`, Session이 스킬 이름을 불러올 때 붙이는 `skillPrefix`다. 저장하면 새 `revision`을 돌려준다 |
| `POST tickets/<id>/retry`, `POST tickets/<id>/stop` | 패널처럼 Ticket을 다시 시도하거나 멈춘다 |

상태 항목은 책임별로 나뉜다.

| 항목 | 알리는 것 |
| --- | --- |
| `runtime` | 애플리케이션 자체 |
| `models` | 모델 예산 재시도를 기다리는 Session |
| `evals` | 최근 한 시간 동안 쓸 수 없었던 Eval 중 이후 판단이나 무시가 없는 것 |
| `assessment`, `launch`, `delivery`, `relay`, `notice`, `reply` | [003 Execution](003-execution.md)에서 설명한 저장된 작업. delivery는 기다리는 작업을 세고, reply는 Channel 메시지를 다룬다 |
| `worker` | Executor Session 이벤트 처리. 처음 실패한 뒤에 나타난다 |
| `github`, `feishu`, `history` | Source 폴링, 이벤트, 기록 복구 |
| `sync:<source id>` | 허용 목록 동기화 |

거부 응답에는 상태 코드와 영어 문구인 `error`가 있다.

- 400: 잘못된 값(`issues`, 각각 `path`를 가짐), 계정 확인 실패(`setup`), 고정된 거부(`code`와 `values`), JSON이 아니거나 너무 큰 본문
- 404: 존재하지 않는 것
- 409: 낡은 revision
- 500: 그 밖의 모든 것

블록은 다음과 같다.

- `source:github`, `source:feishu`: `{"enabled": true, "config": {…}}`. GitHub의 config에는 `repository`, `cli`, 그리고 스위치 `observeIssues`, `observePulls`, `observeComments`, `observeCi`가 있다. 스위치는 기본으로 꺼져 있고, 켜면 저장소의 새 Issue, 새 pull request, 모든 댓글, 기본 브랜치의 CI를 받는다. Feishu의 config에는 `cli`, `[{"chatId": "oc_…", "name": "…", "listen": "mentions"}]`(또는 `"all"`) 형태의 `chats`, `directMessages`, 그리고 `"none"`이나 `"mentions"`인 `otherChats`가 있다.
- `policy`: `{"rules": […], "sources": {"github": {"allowed": [{"id": "<login>"}], "bots": [{"id": "dependabot[bot]"}]}, "feishu": {"allowed": [{"id": "ou_…", "name": "…"}], "syncChat": "oc_…", "admission": {"oc_…": {"unlistedAddressed": "explicit"}}}}}`. `bots`는 메시지가 추론 후보가 될 수 있는 봇의 목록이다. `admission` 행의 키는 Feishu에서는 채팅 id, `other`, `direct`이고 GitHub에서는 `issues`, `pulls`, `comments`, `ci`다. 정하지 않은 칸은 기본값을 쓴다([002 Authorization](002-authorization.md) 참고).
- `eval`: `mode`, `timeoutSeconds`, `model`
- `executor`: `model`, `maxWorkers`, `directory`, `prepare`, `blockedCommands`. 처리 일시 중지는 별도 설정 `paused`이고 `POST executor/pause`가 정한다.

저장소나 CLI를 바꾸면 먼저 해당 설정 점검을 돌린다. 점검이 실패하면 `setup`에 상세를 담아 400을 돌려준다. 계정 변경이 성공하거나 설정이 대기 중일 때 무엇이든 저장하면 `restarting: true`를 돌려준다. 애플리케이션이 재시작하는 동안 API는 잠시 쓸 수 없다.

```sh
api=http://127.0.0.1:3082/orchestrator/api
rev=$(curl -s -H 'x-orchestrator-request: 1' $api/settings | jq '.sources[] | select(.id == "github") | .revision')
curl -s -X PUT -H 'x-orchestrator-request: 1' -H 'content-type: application/json' $api/settings/source:github \
  -d "{\"value\": {\"enabled\": true, \"config\": {\"repository\": \"acme/widgets\", \"cli\": \"$HOME/.local/bin/gh-agent\"}}, \"revision\": $rev}"
```

## 설정 점검

설정 과정은 워커 셸처럼 DeepSeek Harness 서브프로세스 서비스를 쓴다. 이름에 KEY, PASSWORD, SECRET, TOKEN이 들어간 환경 변수는 지운다.

설정 과정은 GitHub 저장소와 에이전트의 푸시 권한을 확인하고, 워커 환경을 쓰고, git이 github.com에 에이전트 자격 증명만 쓰는지 확인한다. Feishu 설정이 실패하면 Feishu Source만 꺼진다.

설정 과정이 쓰는 프로세스 환경은 다음과 같다.

- **명령 shim**: `<stateDir>/worker-bin`에 있고 `PATH` 맨 앞에 온다. `gh`는 에이전트의 CLI를, `lark-cli`는 봇의 CLI를 실행하고, 차단 명령은 실패한다. shim은 대상을 실행하기 전에 자기 디렉터리를 `PATH`에서 뺀다.
- **git 설정**: `<stateDir>/worker-gitconfig`에 있고 운영자의 global, system git 설정을 대신한다. 에이전트 CLI를 github.com 자격 증명 헬퍼로 지정하고, GitHub SSH 주소를 HTTPS로 바꾸고, Git LFS 필터를 정의한다. HTTP 프록시 같은 개인 git 설정은 적용되지 않는다. 커밋 신원은 여기서 정하지 않고, git은 자격 증명을 묻지 않으며, `GH_TOKEN`과 `GITHUB_TOKEN`은 지워진다.

`worker-bin`이나 `worker-gitconfig`에 dsh-superagent가 쓰지 않은 파일이 있으면 설정이 멈춘다. Ticket 디렉터리가 git 저장소 안에 있고 그 저장소 자체 설정이 자격 증명을 추가하면 그 Ticket은 실패한다.

## 써 보기

허용된 GitHub 계정으로 `@<agent login> <request>`가 담긴 Issue를 열거나 댓글을 단다. 폴링 간격(기본 1분) 안에 Overview에 Ticket이 보여야 한다. 에이전트는 요청을 확인했다고 알리고, 자기 Session과 디렉터리에서 일한 뒤, 원래 대화에 결과를 전달한다. Feishu에서는 설정한 채팅에서 봇을 멘션한다.

## 업그레이드

1. 턴 중간에 있는 Executor가 없을 때까지 기다린다.
2. `<stateDir>/orchestrator.sqlite`를 백업한다.
3. `git pull && pnpm install && pnpm build`를 실행한다.
4. `scripts/dsh-superagent restart`를 실행하고 상태를 확인한다.

재시작하면 실행 중인 Assignment가 끝나고, 복구 메모를 붙인 대체 Assignment가 시작된다. 팀 문구와 재정의한 프롬프트 부분은 유지된다. 재정의하지 않은 부분은 새 기본값을 따른다. 업그레이드 뒤에는 **Default updated** 표시가 붙은 부분을 검토한다.

새 버전이 마이그레이션한 데이터베이스는 이전 버전이 열 수 없다. 그래서 되돌리려면 업그레이드 전 백업이 있어야 한다. DeepSeek Harness 자체를 업그레이드한 뒤에는 실행 중인 인스턴스를 재시작해 패널이 맞는 산출물을 불러오게 한다.

### 에이전트 프리셋

worker와 router 프리셋은 셸 명령을 5초 뒤 백그라운드로 옮긴다. 프리셋이 없으면 Session을 불러올 수 없다. Session을 쓰는 동안에는 `cordis.patch.yml`의 `dsh-superagent-worker`와 `dsh-superagent-router` 행을 남겨 둔다. 그렇지 않으면 재개가 `agent-preset/not-found`로 실패한다.

## 문제 해결

설정 문제는 Overview에 해결 링크와 함께 패널 언어로 나타난다. 로그와 API는 아래 영어 문구를 보여 준다.

| 증상 | 원인과 해결 |
| --- | --- |
| `The agent GitHub CLI is not set.` | GitHub 카드에서 에이전트 CLI를 정한다 |
| `The agent GitHub CLI was not found.` | 래퍼의 절대 경로나 `PATH`에 있는 명령 이름을 정한다 |
| `The agent GitHub CLI cannot read its account` | `auth login`으로 래퍼를 로그인시킨다 |
| `@… cannot read …` 또는 `@… cannot push to …` | 에이전트 계정에 저장소 쓰기 권한을 준다 |
| `The GitHub Source names no repository.` | GitHub 카드에서 저장소(`owner/name`)를 정한다 |
| Ticket이 `The prepare command failed: …`로 실패한다 | 출력에 원인이 나온다. 예를 들어 클론 경로가 틀렸을 수 있다. 명령을 고치고 Ticket을 다시 시도한다 |
| `git does not read the github.com credential configuration dsh-superagent writes` | git 2.32 이상을 설치한다 |
| Ticket이 `The git configuration of the repository in … sets …`로 실패한다 | 클론의 `.git/config`에서 지목된 자격 증명이나 `http.*.extraheader` 설정을 지운다 |
| `… was not written by dsh-superagent` | 지목된 파일을 `<stateDir>/worker-bin`이나 `<stateDir>/worker-gitconfig` 밖으로 옮기거나 다른 `stateDir`을 고른다 |
| `The bot lark-cli allows user identities` | 위 "Feishu 봇"처럼 Feishu Source가 봇 전용 설정을 가리키게 한다 |
| `The bot lark-cli does not work.` 또는 `The bot identity of app … is …` | 설정의 앱 id와 시크릿을 확인한다 |
| `The Feishu bot is not a member of the chat.` | 채팅 설정에서 봇을 채팅에 추가한다. 다음 시도에서 성공한다 |
| `status`가 2로 끝난다 | 재시작으로 고쳐지지 않는 오류를 어떤 부분이 알린다. `errors`가 관리 API에 나열된 부분 이름과 상세를 보여 준다. 각 부분은 다시 동작하면 자기 항목을 지운다 |
| `status`가 3으로 끝난다 | 설정을 기다린다. `setup`이 무엇이 빠졌는지 알려 주고 Overview가 고칠 설정으로 링크한다 |
| `status`가 1로 끝난다 | 서비스가 돌지 않거나, 두 개가 돌거나, 응답하지 않거나, 런타임이 오류를 알린다. 출력과 최신 로그가 어느 쪽인지 알려 준다 |
| `… timed out after 90 s`, `… was stopped by …`, `… exited with code …`, `… could not run: …` | CLI가 이유를 출력하지 않고 실패했다. 지목된 프로그램을 운영자 사용자로 직접 실행해 그 프로그램의 메시지를 본다 |
| 패널에 dsh-superagent가 응답하지 않는다고 나온다 | 재시작 중이거나 설정 때문에 시작하지 못했다. DeepSeek Harness 로그에 원인이 나온다 |
| `dsh-superagent configuration has keys it does not use` (로그) | 지목된 키를 지운다. 메시지가 각 값이 이제 어디에 있는지 알려 준다 |
| 로그에 플러그인이 실행 중인 dsh와 호환되지 않는다고 나온다 | `engines.dsh` 범위 안의 DeepSeek Harness 버전을 설치한다 |
| DeepSeek Harness를 업그레이드한 뒤 패널에 "Failed to load plugins"가 나온다 | 실행 중인 인스턴스를 재시작한다 |
| 멘션해도 아무 일도 일어나지 않는다 | 작성자가 Source의 허용 목록에 있는지, Source가 켜져 있는지, 처리가 일시 중지되지 않았는지 확인한다. GitHub에서는 Issue 본문을 고쳐 추가한 멘션은 받지 않으니 댓글로 에이전트를 멘션한다 |
