스킬은 `skills/` 아래의 버킷 폴더로 나눠 둔다.

- `engineering/`: 매일 하는 코드 작업
- `productivity/`: 코드 외 일상 워크플로 도구
- `misc/`: 남겨 두지만 거의 쓰지 않음, 정식 버킷이 아님
- `in-progress/`: 베타 단계, 일부러 공개했고 피드백을 받으려 하지만 플러그인에는 포함하지 않음
- `deprecated/`: 더 이상 쓰지 않음

**정식 버킷**(promoted, 플러그인에 포함되고 문서 페이지가 있는 `engineering/`과 `productivity/`)에 있는 스킬은 모두 최상위 `README.md`에 항목이 있어야 하고 `.claude-plugin/plugin.json`의 `skills` 배열에도 들어 있어야 한다(Claude Code 플러그인은 정식 버킷의 스킬을 빠짐없이, 그 스킬만 담는다). `misc/`, `in-progress/`, `deprecated/`의 스킬은 둘 중 어디에도 나오면 안 된다.

설치 명령은 [.agents/install-block.md](./.agents/install-block.md)에서 글자 그대로 복사한다. `.claude-plugin/marketplace.json`은 이 저장소를 플러그인 하나만 담은 자체 마켓플레이스로 만든다(설치 블록이 설명하는 대체 경로일 뿐 문서에 안내하는 경로는 아니다). 두 매니페스트 중 하나라도 고쳤으면 `claude plugin validate . --strict`를 실행한다. Claude 플러그인은 내고 Codex 플러그인은 (아직) 내지 않는 이유는 [.agents/adr/0002-ship-as-a-claude-code-plugin.md](./.agents/adr/0002-ship-as-a-claude-code-plugin.md)에 있다.

최상위 `README.md`의 각 스킬 항목은 스킬 이름을 그 스킬의 `SKILL.md`로 링크해야 한다.

각 버킷 폴더에는 `README.md`가 있고, 이 파일은 버킷 안의 모든 스킬을 한 줄 설명과 함께 나열하며 스킬 이름을 그 스킬의 `SKILL.md`로 링크한다. 정식 버킷의 `README.md`와 최상위 `README.md`는 항목을 **사용자 호출**(User-invoked)과 **모델 호출**(Model-invoked)로 묶는다. 정식 버킷이 아닌 버킷(`misc/`, `in-progress/`)의 `README.md`는 묶지 않은 단순 목록을 쓴다.

`engineering/`과 `productivity/`의 스킬에는 사람이 읽는 문서 페이지도 `docs/<bucket>/<skill-name>.md`에 있다(docs 트리는 `skills/` 아래의 이 두 버킷 폴더 구조를 그대로 따른다). 게시 URL은 버킷과 상관없이 `https://aihero.dev/skills-<skill-name>`이다. docs 경로는 저장소 안에서 정리하는 용도일 뿐이다. `engineering/`이나 `productivity/`에 스킬을 추가하거나, 이름을 바꾸거나, 동작을 바꾸면 [.agents/writing-docs.md](./.agents/writing-docs.md)에 따라 그 스킬의 문서 페이지를 만들거나 다시 맞춘다. 완성된 페이지에는 **하는 일**, **언제 쓰나**, **자주 묻는 질문**, **잘 동작하고 있다는 신호** 섹션이 있다. 템플릿, 섹션 순서, 질문을 찾을 곳은 `writing-docs.md`에 있다. 정식 버킷이 아닌 버킷(`misc/`, `in-progress/`, `deprecated/`)의 스킬에는 문서 페이지를 **만들지 않는다**. 예외는 정식 버킷에서 아예 없앤 스킬 하나뿐이다. 그 페이지는 보관(archived) 표시를 달고 남긴다(`writing-docs.md` 참고).

모든 `SKILL.md`는 사용자 호출 스킬(사람이 이름을 입력해야만 실행되는 스킬. frontmatter에 `disable-model-invocation: true`, `agents/openai.yaml`에 `policy.allow_implicit_invocation: false`를 두며 사람만 호출할 수 있다)이거나 모델 호출 스킬(모델이 스스로 실행할 수도, 사람이 입력해 실행할 수도 있는 스킬)이다. [.agents/invocation.md](./.agents/invocation.md)를 본다.

[`ask-matt`](./skills/engineering/ask-matt/SKILL.md)는 안내 스킬(router, 다른 스킬과 각각 쓸 때를 알려 주는 스킬)이다. 사용자가 호출할 수 있는 모든 스킬과 그 스킬들 사이의 관계를 정리해 둔다. 문서 페이지를 다시 맞추게 만드는 조건이 이 스킬에도 똑같이 적용된다. 사용자가 호출할 수 있는 스킬을 추가하거나, 이름을 바꾸거나, 없애거나, 흐름 안에서 맡는 자리를 바꿀 때마다 `ask-matt`의 `SKILL.md`를 다시 읽고 내용이 정확하도록 고친다. 새 스킬을 전혀 언급하지 않거나 없어진 스킬로 여전히 안내하면 안내 스킬이 잘못된 안내를 하게 된다.

`deprecated/`와 `misc/` 밖의 모든 스킬을 로컬 하네스 스킬 디렉터리(`~/.claude/skills`, `~/.agents/skills`)에 (다시) 연결하려면 `scripts/link-skills.sh`를 실행한다. 각 항목은 이 저장소를 가리키는 심볼릭 링크이므로 `git pull`만 하면 설치된 스킬이 최신 상태로 유지된다. 스킬을 추가하거나, 없애거나, 이름을 바꾼 뒤에는 스크립트를 다시 실행한다.

이 저장소의 산문(`SKILL.md` 파일, docs, `README.md`, `CHANGELOG.md`, ADR, changeset, 코드 주석) 어디에도 em dash를 쓰지 않는다. 문장에 em dash가 필요해 보이면 쉼표, 콜론, 마침표, 괄호, 접속사 가운데 그 문장에 실제로 맞는 것으로 문장을 다시 쓴다. 문자만 기계적으로 바꿔 넣지 마라.
