# SETUP

운영자와 함께 dsh-superagent를 설치하는 에이전트를 위한 지침이다. 사람이라면 코딩 에이전트에게 이 파일을 읽고 따르라고 부탁한다.

## 설치 진행 방식

설치는 [docs/000-philosophy.md](docs/000-philosophy.md)를 따른다. 운영자의 주의를 되도록 적게 쓴다.

- **첫 질문 전에는** 이 파일과 `docs/000-philosophy.md`만 읽고, 아래 점검을 한 번 돌린다. 답을 모두 모을 때까지 다른 것은 읽지 않는다.
- **메시지 하나에 질문 하나만,** 한 가지에 대해서만 묻는다. 답을 받은 뒤 다음 질문으로 간다. 점검으로 이미 답이 나온 질문은 건너뛴다.
- **메시지는 300단어 아래로 쓴다.** 운영자가 더 원하면 예외다. 질문마다 운영자가 한 단어로 받아들일 수 있는 추천 답과, 왜 중요한지 한 문장을 붙인다.
- **묻는 동안에는 실행하지 않는다.** 답을 모두 모은 뒤 전체 계획을 메시지 하나로 보내고, 운영자가 확인한 뒤에만 실행한다.
- **채팅으로 비밀 값을 절대 묻지 않는다.** 계정 만들기, CLI 로그인, 앱 secret 입력처럼 운영자 손이 필요한 단계는 운영자가 자기 터미널에서 칠 정확한 명령과 함께 메시지 하나에 모은다.
- **철학은 질문을 통해 한 문장씩 가르친다.** 강의하듯 늘어놓지 않는다.

## 1. 점검

이 체크아웃에서 한 번 돌리고, 결과는 혼자 알고 있는다.

```sh
node -v; pnpm -v; git --version; tmux -V; python3 --version; gh --version | head -1; dsh --version
gh api user --jq .login
command -v lark-cli
grep -l -E 'id: dsh-superagent\b' "${DSH_HOME:-$HOME/.dsh}"/profiles/*/cordis.patch.yml 2>/dev/null
```

- **사전 요구 사항:** Node.js 22.19+ 또는 24+, pnpm, git 2.32+, tmux, Python 3.8+, GitHub CLI 2.48+, 그리고 `package.json`의 `engines.dsh` 범위 안의 DSH. 빠진 것은 질문이 아니라 계획의 항목이 된다. DSH에는 모델 제공자도 필요하다. 운영자가 모델로 DSH를 돌려 본 적이 없다면 모델 설정은 운영자 단계다.
- **운영자 로그인:** `gh api user` 결과는 운영자 자신의 GitHub 로그인이고, 질문 5의 추천 답으로 쓴다.
- **기존 프로필:** `dsh-superagent` 항목이 있는 프로필은 이전 설치다. 그것을 이어 갈지 묻고, 설정은 유지하고, `docs/006-deployment.md`의 업그레이드 절을 읽는다.

## 2. 질문

이 순서로, 메시지 하나에 하나씩 묻는다. 순서는 [docs/001-domain.md](docs/001-domain.md)의 작업 흐름을 따른다. 먼저 Trigger가 어디서 오는지, 다음으로 거기서 누가 일을 부탁할 수 있는지, 마지막으로 Executor가 Ticket으로 무엇을 하는지 묻는다. 추천 답은 대괄호 안에 있다.

**Source: 요청이 오는 곳**

1. **Source.** 에이전트가 GitHub에서만 요청을 받을까, Feishu 채팅에서도 받을까? [팀이 Feishu에서 일하지 않으면 GitHub만.]
2. **저장소.** 에이전트가 작업할 github.com 저장소는 어느 것인가? `owner/name` 형식으로 답한다.
3. **에이전트 계정.** 에이전트는 어느 GitHub 사용자 계정으로 움직이나? [운영자 자신의 계정은 절대 안 되고 전용 계정. 에이전트가 쓰는 모든 글이 이 이름으로 보인다.] 아직 없을 수 있다. 계정 만들기는 운영자 단계다.
4. Feishu를 쓰면: **어느 채팅인가,** 이름으로 답한다. 봇을 설정한 뒤 에이전트가 id를 찾는다.

**Policy: 누가 일을 부탁할 수 있나**

5. **GitHub에서.** 어느 GitHub 로그인이 에이전트에게 일을 부탁할 수 있나? [`<operator login>`만. 에이전트는 이 목록에 있는 사람을 위해서만 움직이고, 목록이 짧아야 운영자가 에이전트의 행동을 익히는 동안 팀의 소음이 적다.]
6. Feishu를 쓰면: **Feishu에서는 누가 부탁할 수 있나?** [첫 채팅의 모든 사람. 멤버 목록과 동기화한다.]

**실행: 에이전트가 Ticket으로 하는 일**

7. **체크아웃.** 각 Ticket은 저장소의 어느 로컬 클론에서 체크아웃하나? [`~/src/<name>` 아래 새 클론.]
8. **커밋 신원.** 에이전트의 커밋에 author로 누구를 적을까? [에이전트 계정. 그래야 에이전트의 작업임이 드러난다.] 운영자 같은 다른 신원은 Delivery requirements 프롬프트 섹션에 넣는다.
9. **자동 병합.** 에이전트가 자기 pull request가 준비되고 승인되면 auto-merge를 켤까? [아니요. 에이전트의 pull request가 한동안 맞게 나올 때까지는 사람이 병합한다.] 에이전트는 에이전트 계정으로는 절대 auto-merge를 켜지 않는다. 그래서 '예'라면 병합할 수 있는 다른 계정의 GitHub CLI가 필요하다. 운영자 단계에서 운영자에게 그 계정으로 CLI에 로그인해 달라고 하고, Delivery requirements에 그 계정을 적는다. '아니요'라면 Delivery requirements에서 auto-merge 단락을 지운다.

좋은 기본값이 있는 값은 묻지 않고 계획에 나열한다.

- 프로필 `superagent`. 운영자가 일하는 프로필과 따로 둔 DSH Web 프로필의 사본이라, 운영자의 Session을 닫지 않고 재시작할 수 있다. 포트 `3082`. 상태 디렉터리는 절대 경로로 `<home>/.dsh/state/superagent`.
- 운영자 자신의 프로필에서 매시간 도는 점검. dsh-superagent가 돌고 있지 않으면 고친다.
- 브랜치 접두어 `agent/`.
- accept 모드 `observe`. 능동 작업을 실제로 하지 않고 기록만 한다. 기본 규칙과 프롬프트 섹션.
- Feishu를 쓰면: 봇은 멘션만 읽고, 다이렉트 메시지는 켠다.

## 3. 계획

300단어 아래의 메시지 하나를 보낸다. 무엇을 설치하는지, 계정과 CLI, 저장할 설정, 운영자 단계, 기본값을 담는다. 확인은 한 번만 받는다.

## 4. 실행

1. **운영자 단계부터.** `docs/006-deployment.md`의 계정 절을 읽고, CLI 래퍼는 직접 쓴 뒤, 운영자만 할 수 있는 일을 메시지 하나로 보낸다. 에이전트 계정 만들기, auto-merge를 쓰면 그것을 켤 계정으로 CLI 로그인하기, 에이전트 계정으로 저장소 초대 수락하기, 래퍼마다 `auth login` 돌리기, Feishu를 쓰면 봇 앱을 만들어 게시하고 그 secret으로 `config init` 명령 돌리기다. 운영자가 끝났다고 할 때까지 기다린 뒤 `<wrapper> api user --jq .login`으로 로그인을 하나씩 확인한다.
2. **설치와 시작.** `docs/006-deployment.md`의 설치, 머신 설정, 시작과 중지 절을 따른다. 이 저장소의 `git clone`은 건너뛴다. 이미 그 체크아웃 안에 있다. 질문 7에서 새 클론을 골랐다면 질문 2의 저장소를 클론한다. 기존 프로필이 있으면 `dsh superagent --from-default-profile` 명령은 건너뛴다. 이 명령은 프로필을 바꾸고 `cordis.patch.yml`을 지운다. 그 파일은 통째로 바꾸지 말고 고쳐 쓴다.
3. **설정.** `docs/006-deployment.md`의 관리 API 절에 따라 이 순서대로 저장한다. `github` Source, 쓴다면 `feishu` Source, 허용 목록을 담은 `policy` 블록(Feishu는 먼저 봇의 CLI로 채팅 id를 찾는다), 질문 7의 답으로 만든 prepare 명령을 담은 `executor` 블록이다. 그다음 질문 8의 커밋 신원과 질문 9의 auto-merge 답을 Delivery requirements에 넣어 프롬프트를 저장한다. 저장 응답이 `restarting: true`면 dsh-superagent가 재시작한다. 다음 요청 전에 `scripts/dsh-superagent status`가 더는 1로 끝나지 않을 때까지 기다리고, `GET settings`에서 revision을 다시 읽는다.
4. **실패.** 거부된 저장은 응답 본문에 설정 문제를 밝힌다. `docs/006-deployment.md`의 문제 해결 표에서 찾아 고치고 이어 간다. 직접 고칠 수 없는 것만 운영자에게 묻는다.

## 5. 확인과 인계

`scripts/dsh-superagent status`가 설정 문제 없이 0으로 끝나야 한다. 운영자 자신의 DSH 프로필 안에서 돌고 있다면 `docs/006-deployment.md`의 매시간 점검 절에 있는 점검을 일정 도구로 만든다. 그렇지 않으면 운영자에게 그 프롬프트를 주고 거기서 일정을 걸게 한다. 그다음 300단어 아래의 메시지 하나를 보낸다.

- 패널 URL, 그리고 사이드바의 **Superagent** 항목을 보면 된다는 것.
- 써 보는 방법: 허용 목록에 있는 계정으로 저장소의 issue에 `@<agent login> <request>` 댓글을 단다. 1분 안팎으로 overview에 Ticket이 나타난다.
- `docs/000-philosophy.md`의 책임 절에서 뽑은 운영자 규칙 세 가지: 좁게 시작하기, 소음이 줄도록 조정하기, 에이전트가 한 말에 책임지기.
- 더 읽을 곳: `docs/`의 번호 붙은 문서를 순서대로.
