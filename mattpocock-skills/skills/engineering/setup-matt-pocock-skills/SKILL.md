---
name: setup-matt-pocock-skills
description: "엔지니어링 스킬을 쓸 수 있게 이 저장소를 설정한다. 이슈 트래커, 분류 라벨 이름, 도메인 문서 구조를 정한다. 다른 엔지니어링 스킬을 처음 쓰기 전에 한 번 실행한다."
disable-model-invocation: true
---

# Matt Pocock 스킬 설정

엔지니어링 스킬이 전제로 삼는 저장소별 설정의 기본 틀을 만든다.

- **이슈 트래커**: 이슈를 관리하는 곳(기본값은 GitHub이고, 로컬 마크다운도 별도 설정 없이 지원한다)
- **분류 라벨**: 표준 분류(triage) 역할마다 쓰는 라벨 문자열
- **도메인 문서**: `GLOSSARY.md`와 ADR(아키텍처 결정 기록)을 두는 위치와, 스킬이 그 문서를 읽는 규칙

이 스킬은 정해진 대로 실행되는 스크립트가 아니라 프롬프트로 움직이는 스킬이다. 탐색하고, 찾은 내용을 보여 주고, 사용자와 확인한 다음 파일을 쓴다.

## 절차

### 1. 탐색

현재 저장소를 살펴 시작 상태를 파악한다. 있는 것은 모두 읽고, 추측하지 않는다.

- `git remote -v`와 `.git/config`: GitHub 저장소인가? 어느 저장소인가?
- 저장소 루트의 `AGENTS.md`와 `CLAUDE.md`: 둘 중 하나라도 있는가? 어느 한쪽에 `## Agent skills` 섹션이 이미 있는가?
- 저장소 루트의 `GLOSSARY.md`와 `GLOSSARY-MAP.md`
- `docs/adr/`와 `src/*/docs/adr/` 디렉터리
- `docs/agents/`: 이 스킬이 전에 만든 결과물이 이미 있는가?
- `.scratch/`: 로컬 마크다운 이슈 트래커 규칙을 이미 쓰고 있다는 표시
- `triage` 스킬이 설치되어 있는가? (이 스킬 옆에 `triage` 스킬 폴더가 있거나, 쓸 수 있는 스킬 목록에 `triage`가 있다.) 섹션 B를 진행할지 여부가 이것으로 정해진다.
- 모노레포 신호: `pnpm-workspace.yaml`, `package.json`의 `workspaces` 필드, 또는 각자 `src/`를 가진 `packages/*` 디렉터리들. 이런 신호는 실제로 여러 패키지로 이루어진 큰 저장소에만 있다. 신호가 없으면 단일 컨텍스트이고, 거의 모든 저장소가 여기에 해당한다.

### 2. 찾은 내용을 보여 주고 묻기

있는 것과 없는 것을 요약한다. 그다음 섹션을 순서대로 다룬다. 한 섹션에서 답 하나를 받고 다음 섹션으로 넘어간다.

각 섹션은 추천 답을 먼저 제시해 사용자가 한마디로 받아들일 수 있게 한다. 선택이 실제로 갈릴 때만 한 줄 설명을 붙인다. 탐색으로 이미 답이 정해진 섹션은 통째로 건너뛴다(`triage`가 설치되지 않았으면 섹션 B, 모노레포가 아니면 섹션 C).

**섹션 A: 이슈 트래커.**

> 설명: "이슈 트래커"는 이 저장소의 이슈를 관리하는 곳입니다. `to-tickets`, `triage`, `to-spec` 같은 스킬이 여기서 이슈를 읽고 여기에 씁니다. 이 스킬들은 `gh issue create`를 호출할지, `.scratch/` 아래에 마크다운 파일을 쓸지, 아니면 사용자가 설명한 다른 방식을 따를지 알아야 합니다. 이 저장소의 작업을 실제로 관리하는 곳을 골라 주세요.

기본 방침: 이 스킬들은 GitHub을 기준으로 설계했다. `git remote`가 GitHub을 가리키면 GitHub을 제안한다. `git remote`가 GitLab(`gitlab.com`이나 자체 호스팅 서버)을 가리키면 GitLab을 제안한다. 그 밖의 경우(또는 사용자가 원하면) 다음 선택지를 제시한다.

- **GitHub**: 저장소의 GitHub Issues에서 이슈를 관리한다(`gh` CLI 사용).
- **GitLab**: 저장소의 GitLab Issues에서 이슈를 관리한다([`glab`](https://gitlab.com/gitlab-org/cli) CLI 사용).
- **로컬 마크다운**: 이 저장소의 `.scratch/<feature>/` 아래 파일로 이슈를 관리한다(혼자 하는 프로젝트나 원격 저장소가 없는 저장소에 알맞다).
- **기타**(Jira, Linear 등): 사용자에게 작업 방식을 한 문단으로 설명해 달라고 한다. 스킬은 그 설명을 자유 형식 글로 기록한다.

선택한 내용을 `docs/agents/issue-tracker.md`에 기록한다. GitHub과 GitLab 템플릿에는 "PR을 요청 접수 경로로 쓰기" 플래그가 있고 기본값은 **꺼짐**이다. 꺼진 채로 두고 이 플래그 이야기를 꺼내지 않는다. 외부 PR을 분류 대기열에 넣고 싶은 사용자는 나중에 파일에서 플래그를 직접 바꿀 수 있다.

**섹션 B: 분류 라벨 이름.** `triage` 스킬이 설치되어 있지 않으면(탐색에서 확인했다) 이 섹션을 통째로 건너뛴다. 설치되지 않은 스킬에는 라벨이 필요 없다.

설치되어 있다면 질문을 정확히 하나만 한다.

> 기본 분류 라벨을 그대로 쓰시겠어요? (추천: **예**)

기본값은 표준 분류 역할이며, 각 라벨 문자열은 역할 이름과 같다: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. 사용자가 **예**라고 하면 그대로 쓴다. 사용자가 아니라고 할 때만(보통 트래커가 이미 다른 이름을 쓰고 있어서다. 예: `needs-triage` 대신 `bug:triage`) 바꿀 이름을 받아 둔다. 그래야 `triage`가 중복 라벨을 새로 만들지 않고 기존 라벨을 붙인다.

**섹션 C: 도메인 문서.** 기본값은 **단일 컨텍스트**(저장소 루트에 `GLOSSARY.md` 하나와 `docs/adr/`)다. 거의 모든 저장소에 맞으므로 묻지 않고 그대로 쓴다.

**다중 컨텍스트**(루트의 `GLOSSARY-MAP.md`가 컨텍스트별 `GLOSSARY.md` 파일을 가리키는 구조)는 탐색에서 모노레포 신호를 찾았을 때만 제안한다. 그때는 어느 구조를 원하는지 확인한다.

### 3. 확인과 수정

사용자에게 다음 초안을 보여 준다.

- `CLAUDE.md` / `AGENTS.md` 중 수정할 파일에 넣을 `## Agent skills` 블록(어느 파일을 고르는지는 4단계 참고)
- `docs/agents/issue-tracker.md`, `docs/agents/domain.md`, `docs/agents/triage-labels.md`의 내용(`docs/agents/triage-labels.md`는 `triage`가 설치되어 있을 때만)

쓰기 전에 사용자가 고칠 수 있게 한다.

### 4. 쓰기

**수정할 파일 고르기:**

- `CLAUDE.md`가 있으면 그 파일을 수정한다.
- 없고 `AGENTS.md`가 있으면 그 파일을 수정한다.
- 둘 다 없으면 어느 파일을 만들지 사용자에게 묻는다. 대신 골라 주지 않는다.

`CLAUDE.md`가 이미 있으면 `AGENTS.md`를 절대 만들지 않는다(반대도 마찬가지). 항상 이미 있는 파일을 수정한다.

고른 파일에 `## Agent skills` 블록이 이미 있으면 중복 블록을 덧붙이지 말고 그 블록의 내용을 제자리에서 고친다. 주변 섹션에 사용자가 고친 내용은 덮어쓰지 않는다.

블록은 다음과 같다.

```markdown
## Agent skills

### 이슈 트래커

[이슈를 어디서 관리하는지 한 줄 요약]. `docs/agents/issue-tracker.md`를 참고한다.

### 분류 라벨

[라벨 이름 한 줄 요약]. `docs/agents/triage-labels.md`를 참고한다.

### 도메인 문서

[구조 한 줄 요약: "single-context" 또는 "multi-context"]. `docs/agents/domain.md`를 참고한다.
```

`### 분류 라벨` 하위 블록을 넣고 `docs/agents/triage-labels.md`를 쓰는 것은 `triage`가 설치되어 있어 섹션 B를 진행했을 때만이다. 그렇지 않으면 둘 다 뺀다.

그다음 이 스킬 폴더의 기본 템플릿을 출발점으로 삼아 문서 파일을 쓴다.

- [issue-tracker-github.md](./issue-tracker-github.md): GitHub 이슈 트래커
- [issue-tracker-gitlab.md](./issue-tracker-gitlab.md): GitLab 이슈 트래커
- [issue-tracker-local.md](./issue-tracker-local.md): 로컬 마크다운 이슈 트래커
- [triage-labels.md](./triage-labels.md): 라벨 대응표(`triage`가 설치되어 있을 때만)
- [domain.md](./domain.md): 도메인 문서를 읽는 규칙과 구조

"기타" 이슈 트래커라면 사용자의 설명을 바탕으로 `docs/agents/issue-tracker.md`를 처음부터 쓴다.

### 5. 마무리

설정이 끝났다는 것과, 이제 어떤 엔지니어링 스킬이 이 파일들을 읽는지 사용자에게 알린다. 나중에 `docs/agents/*.md`를 직접 고쳐도 된다고 말한다. 이 스킬을 다시 실행할 필요는 이슈 트래커를 바꾸거나 처음부터 다시 설정하고 싶을 때뿐이다.
