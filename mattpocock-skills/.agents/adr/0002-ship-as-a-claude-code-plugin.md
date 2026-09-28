# 스킬 모음을 Claude Code 네이티브 플러그인으로 배포하고 Codex 네이티브 플러그인은 미룬다

이 스킬들은 처음부터 [skills.sh](https://skills.sh/mattpocock/skills)(`npx skills add mattpocock/skills`)로 설치할 수 있었다. skills.sh는 Claude Code, Codex, 그 밖의 Agent Skills 표준 하네스에서 사용자 프로젝트에 수정 가능한 스킬 파일을 복사해 넣는다. 반복해서 들어온 요청은 **설치만 하면 바로 쓰는** 배포 방식이다. 사용자가 직접 관리하는 포크가 아니라, 수정하지 않고 항상 최신 상태로 유지되는 읽기 전용 묶음을 구독하는 방식이다. 네이티브 플러그인 시스템이 제공하는 것이 바로 이것이다.

**Claude Code 플러그인**은 네이티브로 배포하고, **Codex 플러그인**은 네이티브 배포를 당분간 **미룬다**. 이렇게 갈린 이유는 각 생태계의 플러그인 매니페스트가 스킬을 고르는 방식이 이 저장소의 버킷 구조와 맞는지가 다르기 때문이다.

## 제약: 버킷으로 나눈 스킬과 경로 하나만 받는 선택 방식

스킬은 `skills/` 아래의 버킷 폴더에 있다. `engineering/`과 `productivity/`는 **정식 버킷**(promoted, 플러그인에 포함되고 문서 페이지가 있는 버킷)이고, `misc/`, `personal/`, `in-progress/`, `deprecated/`는 정식 버킷이 **아니다**. 플러그인은 정식 버킷의 스킬만 내보내야 하고, 이 스킬들은 버킷 폴더 두 곳에 나뉘어 있다.

- **Claude Code**: `.claude-plugin/plugin.json`은 `skills`를 **스킬 디렉터리 경로를 하나하나 적은 배열**로 받는다. 정식 버킷의 스킬을 하나씩 나열하면 나머지는 헷갈릴 여지 없이 빠진다. 여기에 `.claude-plugin/marketplace.json`을 더해 저장소가 플러그인 하나만 담은 자체 마켓플레이스가 되게 한다. 처음부터 끝까지 확인했다. `claude plugin validate . --strict`가 통과하고, `marketplace add` → `install`로 정식 버킷의 스킬이 모두 설치된다.

- **Codex**: `.codex-plugin/plugin.json`은 `skills`를 **경로 문자열 하나**로만 받고(배열을 주면 `missing or invalid plugin.json` 오류로 거부한다), 그 경로 아래에서 `SKILL.md` 파일을 재귀적으로 찾는다. 경로 하나로는 버킷 폴더 두 곳을 가리킬 수도, 일부 스킬만 골라 낼 수도 없다. 우회 방법을 시험했지만 모두 쓸 수 없었다.
  - `./skills/`를 가리키면 `deprecated/`, `in-progress/`, `personal/`, `misc/`까지 함께 배포된다. 일부러 정식 버킷에 넣지 않은, 은퇴한 스킬과 초안 스킬과 개인 스킬이다.
  - 버킷 안의 스킬을 가리키는 **심볼릭 링크**만 모은 평평한 디렉터리를 따로 만들면 설치 과정에서 사라진다. Codex는 플러그인 트리를 캐시로 복사하면서 **심볼릭 링크를 버리므로** 스킬이 빈 채로 설치된다.

Codex에 정식 버킷 스킬만 담긴 경로 하나를 주는 확실한 방법은 다음뿐이다. (a) `skills/`에 정식 버킷 스킬만 남도록 **구조를 바꾼다**. 정식 버킷이 아닌 버킷을 밖으로 옮기는 일이라 영향 범위가 넓다. `CLAUDE.md`, `scripts/link-skills.sh`, 버킷 README, 그리고 `in-progress/`와 `personal/`에 기대는 로컬 개발 워크플로까지 영향을 받는다. (b) 정식 버킷 스킬의 **사본을 커밋해** 평평한 디렉터리에 둔다. 계속 동기화해야 하고 기준 원본이 둘이 된다. 둘 다 구조에 관한 결정이므로 Claude 플러그인 배포에 끼워 넣을 일이 아니다. 예전에 플러그인을 내지 않은, 어렴풋이만 기억하던 원래 이유도 이것일 가능성이 매우 높다. 매니페스트 형식으로는 버킷으로 나눈 저장소에서 고른 일부만 깔끔하게 표현할 수 없었다.

## 결정

- **Claude Code 플러그인**(`.claude-plugin/plugin.json` + `.claude-plugin/marketplace.json`)을 정식 버킷의 스킬만 담아 지금 배포하고, v1.2의 핵심 산출물로 삼는다.
- **skills.sh**는 모든 하네스에 쓰는 설치 도구로 유지한다. 지금도 Codex와 다른 하네스를 지원하므로 설치 방법이 없는 Codex 사용자는 생기지 않는다.
- Codex 네이티브 플러그인은 `skills/`를 정식 버킷 스킬만 남도록 구조를 바꿀지, 생성한 평평한 사본을 커밋할지 정할 때까지 **미룬다**. Codex가 `skills` 배열이나 포함 목록을 지원하거나, 설치할 때 심볼릭 링크를 유지하게 되면 다시 검토한다.

## 이 결정으로 생기는 불변 조건

- 모든 정식 버킷 스킬은 `.claude-plugin/plugin.json`의 `skills` 배열에 항목이 있다(이미 `CLAUDE.md` 규칙이었고, 이제 플러그인에 무엇이 들어가는지도 이 배열이 정한다).
- `.claude-plugin/plugin.json`의 `version`은 `package.json`의 버전을 따른다. 릴리스할 때 둘을 함께 올린다. Claude는 플러그인 `version`을 보고 설치한 사용자에게 업데이트를 보여 줄지 정한다.

## 업데이트, 2026-08-05

`mattpocock-skills`가 **Claude Code 공식 마켓플레이스**(설정 이름 `claude-plugins-official`, 원본 저장소 `anthropics/claude-plugins-official`)에 등록되었다. 이 마켓플레이스는 모든 Claude Code 설치에 기본으로 들어 있다. 이제 문서에 안내하는 경로는 `claude plugins install mattpocock-skills`이고, 위의 `marketplace add` → `install` 경로는 이것으로 대체되었다. 설치 문구는 [.agents/install-block.md](../install-block.md)에 있다.

공식 목록은 이 저장소의 git URL을 가리키고 `.claude-plugin/plugin.json`을 직접 읽으므로 `.claude-plugin/marketplace.json`에 의존하지 않는다. 그 파일은 저장소를 직접 설치할 때(릴리스되지 않은 커밋이나 포크)를 위한 대체 수단으로만 남겨 둔다.

2026-08-05에 Claude Code 2.1.222에서 실제 공식 목록으로 확인한 내용은 다음과 같다.

- `claude plugins install mattpocock-skills`는 마켓플레이스를 먼저 추가하지 않아도 설치되고, `mattpocock-skills@claude-plugins-official`로 표시된다.
- 이어서 `claude plugin details mattpocock-skills`는 버전 1.2.0을 표시하고 정식 버킷의 스킬을 불러온다.
- 목록의 `source`는 `{"source": "url", "url": "https://github.com/mattpocock/skills.git", "sha": …}`이다. **sha가 고정되어 있으므로** 릴리스는 태그를 다는 순간이 아니라 이 고정 sha가 옮겨질 때 설치한 사용자에게 전달된다. 이 글을 쓰는 시점에 고정 sha는 `main`보다 커밋 두 개 뒤에 있어서, `plugin.json`의 24개가 아니라 22개 스킬이 목록에 나온다.
- 세션 안에서 쓰는 `/plugin install mattpocock-skills`는 **시험하지 않았다**. 헤드리스(`claude -p`) 세션에서는 `/plugin`을 쓸 수 없기 때문이다. 이 명령은 CLI와 같은 설치 로직을 쓰고, 문서의 예시 형식은 `/plugin install <name>@claude-plugins-official`이다.
