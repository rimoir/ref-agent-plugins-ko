## 하는 일

`setup-matt-pocock-skills`는 저장소 하나를 대상으로 이슈를 어디서 관리하는지, 분류 라벨 이름이 무엇인지, 도메인 문서가 어디 있는지 답을 정한다. 그 답을 `docs/agents/` 아래 마크다운 파일로 기록한다.

저장소마다 달라지는 것은 이 파일들뿐이다. 스킬 자체는 어디서나 똑같고, 실행할 때 `docs/agents/issue-tracker.md`를 읽고 거기 적힌 대로 한다. 그래서 이 스킬 모음은 GitHub에 묶여 있지 않고, 다른 곳을 가리키게 하려고 스킬 파일을 고칠 필요도 없다. "스킬을 사용자 지정 이슈 트래커에 연결해 줘"라고 하며 이 스킬을 실행하면, 프로그램으로 연결할 수 있는 트래커라면 무엇이든 스킬을 하나도 고치지 않고 쓸 수 있다.

이 스킬은 정해진 대로 실행되는 스크립트가 아니라 프롬프트로 움직이는 스킬이다. `git remote`, 기존 `CLAUDE.md`, 기존 `GLOSSARY.md`를 읽고, 찾은 내용을 제안하고, 무엇이든 쓰기 전에 사용자의 확인을 기다린다.

## 언제 쓰나

`/setup-matt-pocock-skills`를 입력해서 실행한다. [에이전트](https://www.aihero.dev/ai-coding-dictionary/agent)는 이 스킬을 스스로 실행하지 않는다. 일부러 모델이 호출할 수 없게 표시해 두었으므로, 다른 스킬이 대신 실행할 수도 없다.

저장소마다 한 번, 다른 엔지니어링 스킬을 처음 쓰기 전에 실행한다. [triage](https://aihero.dev/skills-triage), [to-spec](https://aihero.dev/skills-to-spec), [to-tickets](https://aihero.dev/skills-to-tickets), [wayfinder](https://aihero.dev/skills-wayfinder)가 이슈를 어디에 둘지 추측하기 시작하거나 트래커에 없는 라벨을 붙인다면, 이 저장소에서 아직 설정하지 않은 것이다. 프로젝트가 이미 절반쯤 진행된 저장소에서 실행해도 괜찮다. 이 스킬은 이미 있는 것을 읽으므로 앞서 한 작업이 헛되지 않는다.

## 사전 준비

이 스킬은 실행한 저장소에 다음 파일을 쓴다.

| 쓰는 것 | 위치 |
| --- | --- |
| `issue-tracker.md` | `docs/agents/` |
| `domain.md` | `docs/agents/` |
| `triage-labels.md` | `docs/agents/`, `triage` 스킬이 설치되어 있을 때만 |
| `## Agent skills` 블록 | `CLAUDE.md` / `AGENTS.md` 중 이미 있는 파일 |

모두 커밋되는 마크다운이다. 사용자 수준이나 전역 설정 방식은 없다. 설정은 저장소 안에 있으므로 저장소마다 자기 설정을 따로 가진다.

## 정하는 것

이 스킬은 각 섹션에서 추천 답을 먼저 제시하고, 탐색으로 이미 정해진 것은 건너뛴다. 대부분은 확인 두 번으로 끝난다.

| 결정 | 제안하는 것 | 실제로 묻는 경우 |
| --- | --- | --- |
| **이슈 트래커** | `git remote`에 맞는 트래커 | 항상(실제로 골라야 하는 것은 이것 하나다) |
| **분류 라벨** | 표준 이름(`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`)을 그대로 쓰기 | `triage` 스킬이 설치되어 있을 때만 |
| **도메인 문서** | 단일 컨텍스트(루트에 `GLOSSARY.md` 하나와 `docs/adr/`) | 모노레포 신호를 찾았을 때만(그때는 다중 컨텍스트 `GLOSSARY-MAP.md`를 제안한다) |

트래커 선택지는 다음과 같다.

| 선택지 | 이슈를 관리하는 곳 | 필요한 것 |
| --- | --- | --- |
| **GitHub** | 저장소의 GitHub Issues | `gh` CLI |
| **GitLab** | 저장소의 GitLab Issues | `glab` CLI |
| **로컬 마크다운** | 이 저장소의 `.scratch/<feature>/` 아래 파일 | 없음(원격 저장소도 필요 없다) |
| **기타** | 사용자가 말하는 곳 | 작업 방식을 설명하는 사용자의 한 문단 |

GitHub, GitLab, 로컬 마크다운은 스킬에 템플릿으로 들어 있어 따로 설정하지 않아도 동작한다. 로컬 마크다운은 대체 수단이 아니라 다른 선택지와 동등한 선택지다. 원격 저장소 없이 혼자 하는 프로젝트도 완전히 지원한다. 다시 강조할 주의 사항이 하나 있다. GitHub을 쓰고 있다면 로컬 마크다운을 쓰지 않는다. 둘은 겹쳐 쓰는 것이 아니라 둘 중 하나를 고르는 것이다.

"기타"도 자리만 채워 둔 선택지가 아니다. Jira, Linear, Azure DevOps, Beads가 모두 동작하는 이유가 이것이다. 사용자가 작업 방식을 설명하면 스킬이 그 글을 `docs/agents/issue-tracker.md`에 기록하고, 뒤이어 실행되는 스킬들이 그 글을 따른다. 커뮤니티에서 이미 이렇게 쓰고 있다. [MCP](https://www.aihero.dev/ai-coding-dictionary/mcp)로 Jira를 쓰는 방식, `gh`와 비슷하게 만든 Gitea CLI, 직접 만든 로컬 대시보드가 있다.

## 자주 묻는 질문

**GitHub을 꼭 써야 하나요?**

아니다. GitHub, GitLab, `.scratch/` 아래 로컬 마크다운은 모두 바로 쓸 수 있는 템플릿으로 들어 있고, 그 밖의 트래커는 "기타" 경로로 쓸 수 있다. 기록에서 가장 많이 반복된 질문이고, 대략 이런 말로 나온다. *"GitHub에만 묶여 있다"*, *"GitLab / Jira를 쓸 수 있나"*, *"Azure DevOps는 어떤가"*. 답은 매번 같다. 트래커는 스킬의 속성이 아니라 설정에서 정하는 답이다.

**스킬을 업데이트한 뒤 다시 실행해야 하나요?**

v1.1 직후에 이 질문을 직접 받았을 때 Matt는 그렇다고 답했다. 스킬 자체의 마무리 메시지는 더 느슨하다. 트래커를 바꾸거나 처음부터 다시 설정할 때만 다시 실행하면 된다고 알려 준다. 둘 다 근거가 있고, 차이가 생기는 이유도 실제로 있다. 기본 템플릿이 버전마다 바뀌므로, 이전 릴리스가 쓴 `docs/agents/issue-tracker.md`가 지금 그 파일을 읽는 스킬과 맞지 않게 될 수 있다. 뒤이어 실행되는 스킬이 문서에 적힌 것과 다르게 동작하기 시작하면, 다시 실행하는 것이 손쉬운 해결책이다.

**`CLAUDE.md`에 썼는데, 저는 Codex를 써요.**

알려진 문제이고 아직 해결되지 않았다. 파일을 고르는 규칙은 "`CLAUDE.md`가 있으면 그 파일을, 없으면 `AGENTS.md`를 수정한다"이다. 어느 [하네스](https://www.aihero.dev/ai-coding-dictionary/harness)가 실행 중인지가 아니라 어느 파일이 있는지를 확인한다. Claude Code를 쓰다 남은 `CLAUDE.md`가 있는 저장소에서는 `## Agent skills` 블록이 Codex가 읽지 않는 곳에 들어간다. 다음 우회 방법이 쓰이고 있다. 블록을 직접 `AGENTS.md`로 옮기거나, `AGENTS.md`를 기준 파일로 두고 `CLAUDE.md`를 그 파일을 가리키는 한 줄짜리 포인터로 만든다. 두 파일 모두 없으면 스킬은 대신 고르지 않고 어느 파일을 만들지 묻는다. 스킬이 알아서 정해 줄 것으로 기대한 사람들은 이 동작에 혼란스러워했다.

**분류 라벨을 만들어 주지 않았어요.**

이 스킬은 라벨을 만들지 않는다. `docs/agents/triage-labels.md`는 *대응표*다. 트래커의 어느 문자열이 어느 표준 역할에 해당하는지 `/triage`에 알려 준다. `gh label create`를 실행하지 않는다. 새로 만든 GitHub 저장소에는 라벨이 실제로 아직 없고, 이 일이 버그로 여러 번 보고되었다. 덧붙일 점은 다음과 같다.

- 트래커가 이미 표준 이름을 쓰고 있다면 대응표는 같은 이름끼리 짝지은 표이고 설정할 것이 없다. 이것이 의도한 일반적인 경우이고, 빠진 단계가 아니다.
- [wayfinder](https://aihero.dev/skills-wayfinder)의 `wayfinder:map`, `wayfinder:<type>` 라벨도 여기서 만들지 않는다. 그리고 `gh issue create --label <missing>`은 라벨을 만들지 않고 그냥 실패한다. GitHub 저장소에서 wayfinder를 처음 실행하기 전에 이 라벨들을 직접 만든다.

**다른 스킬의 동작([집요한 질문](https://www.aihero.dev/ai-coding-dictionary/grilling)을 하는 빈도, 질문 형식, 말투)도 여기서 설정할 수 있나요?**

아니다. 이 스킬이 설정하는 것은 트래커, 라벨, 문서 구조뿐이다. 사용자별 선호를 여기서 설정하게 해 달라는 요청이 직접 있었지만, 스킬은 정해진 방식을 고수한다는 것이 한결같은 답이다. *"설정은 죽음이다(Config is death)."* 선호는 `CLAUDE.md`에 평범한 지시로 적는다. 모든 스킬이 이미 그 파일을 읽는다.

**설정을 저장소마다 커밋하지 않고 `~/.claude`에 둘 수 있나요?**

지금은 안 된다. 여러 저장소에서 스킬을 쓰는 사람이 바로 이 기능을 요청했고 그 요청은 아직 열려 있지만, 사용자 수준 설정 방식은 없다. 저장소마다 자기 `docs/agents/`를 가진다.

**다른 스킬을 설정하는 스킬이 있다는 게 이상하지 않나요?**

오래된 불만 하나는 그렇다고 하며 이렇게 말한다. *"다른 스킬을 설정하려고 스킬을 두는 것은 옳지 않게 느껴진다. LLM이 자기 스킬을 설정한다는 뜻이기 때문이다."* 이 트레이드오프는 실제로 있고, 인정된 것이다. 설정 단계를 두지 않으면 이슈를 다루는 모든 스킬에 트래커 지시를 중복해서 넣어야 한다. 결과물이 직접 읽고 고칠 수 있는 마크다운이라는 점이 그 단점을 줄인다. 스킬이 쓴 파일을 모두 읽고 손으로 고칠 수 있고, 평소의 작은 수정은 스킬을 다시 실행하지 않고 그렇게 손으로 하면 된다.

## 잘 동작하고 있다는 신호

- `docs/agents/issue-tracker.md`와 `docs/agents/domain.md`가 있고, `triage`가 설치되어 있으면 `triage-labels.md`도 있다.
- 하네스가 실제로 읽는 지시 파일에 `## Agent skills` 섹션이 생기고, 그 안에 각 파일을 가리키는 한 줄 요약이 있다.
- 제안한 트래커가 실제로 쓰는 원격 저장소와 맞고, 라벨 문자열이 트래커에 실제로 있는 라벨과 맞는다.
- 그 뒤로 `/to-tickets`는 이슈를 어디서 관리하는지 묻지 않고 게시하고, `/triage`는 라벨을 지어내지 않고 있는 라벨을 붙인다.
- 스킬 파일 자체는 아무것도 바뀌지 않았다. 설정이 `SKILL.md`를 수정했다면 무언가 잘못된 것이다.

## 전체 흐름에서의 위치

`setup-matt-pocock-skills`는 엔지니어링 흐름의 **한 번만 실행하는 설정**이다. 흐름 속 한 단계가 아니라 나머지 모든 스킬이 전제로 삼는 사전 준비다. 관련 스킬은 이 스킬이 쓴 파일을 읽는 스킬들이다. [triage](https://aihero.dev/skills-triage)는 여기서 기록한 라벨 이름을 붙이고, [to-spec](https://aihero.dev/skills-to-spec)과 [to-tickets](https://aihero.dev/skills-to-tickets)는 여기서 정한 트래커에 게시하고, [wayfinder](https://aihero.dev/skills-wayfinder)는 같은 트래커 파일의 "wayfinder 작업" 섹션을 읽어 계획 이슈(map, 결정 목록과 하위 티켓을 묶는 상위 이슈)와 하위 [티켓](https://www.aihero.dev/ai-coding-dictionary/ticket)을 어떻게 저장하는지 안다. 이 스킬이 기록한 도메인 문서 구조는 나중에 [domain-modeling](https://aihero.dev/skills-domain-modeling)이 채운다. domain-modeling은 용어나 결정이 실제로 정해질 때가 되어서야 `GLOSSARY.md`와 ADR을 만든다. 그래서 설정 직후 저장소가 비어 있는 것이 정상이다. 다음에 어느 스킬을 쓸지는 [ask-matt](https://aihero.dev/skills-ask-matt)가 전체 스킬 모음을 기준으로 안내한다.
