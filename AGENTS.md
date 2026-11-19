# ref-agent-plugins-ko 번역 지침

참고할 만한 외부 에이전트 플러그인을 복사해 두고 문서와 스킬을 한국어로 번역한다. 영어 원문 파일 위에 번역을 덮어쓰는 방식이라 원본 파일과 번역 파일이 따로 없다. 이 저장소에는 upstream diff로 설명되는 것만 둔다.

## upstream과 번역 기준

번역 기준은 `sources.json` 하나에만 적는다. 키는 폴더 이름이다.

- `track: tag`: 최신 태그. `ref`는 태그 이름
- `track: main`: main 최신 커밋. `ref`는 짧은 sha
- `track: file`: `file`(JSON)의 `version`. `ref`는 버전 문자열. 기준 커밋은 `git log -- <file>`에서 찾는다
- `path`: 모노레포 안의 하위 폴더 (pstack)
- `test`: 검증 때 플러그인 폴더에서 돌리는 명령
- `summary`: README 표와 마켓플레이스 설명
- `marketplace`: 있으면 Claude Code 마켓플레이스에 올린다. `strict`, `skills`, `license`

## git 추적 규칙

- 번역한 파일과 번역하지 않은 upstream 원문(스크립트, 설정, manifest, 테스트 등)을 모두 추적한다. 그래야 플러그인을 바로 설치해 쓸 수 있다.
- upstream에 없는 로컬 부산물(`node_modules`, `__pycache__`, 테스트 중 생긴 lock 파일 등)은 `.gitignore`로 뺀다.
- 어떤 파일이 번역 대상인지는 기준 ref의 upstream과 비교해 판단한다. 내용이 같으면 원문, 다르면 번역이다.

## 갱신 절차

1. `python3 tools/check-updates.py`로 바뀐 플러그인을 찾는다. 한 줄에 플러그인 하나다.
2. 플러그인마다 `i18n/<플러그인>-<새 ref>` 브랜치를 만든다. 여러 개면 플러그인마다 에이전트를 하나씩 붙인다. 각 에이전트는 자기 폴더만 고친다.
3. upstream을 scratchpad에 클론하고 기준 ref가 로컬 사본과 맞는지 먼저 확인한다. 번역하지 않은 원문 파일을 기준 ref와 비교하면 된다.
4. `git diff --name-status <기준> <새 버전>`으로 바뀐 파일을 나누고 아래처럼 처리한다.

   | 파일 상태 | 처리 |
   |---|---|
   | 번역한(추적) 파일이 바뀜 | 기존 번역은 두고 diff로 바뀐 부분만 같은 문체로 번역해 넣는다 |
   | 새 문서 (SKILL.md, README, docs, CONTRIBUTING, INSTALL 등) | 번역해서 추가한다 |
   | 번역하지 않은 파일이 바뀜, 새 스크립트·설정 | 새 원문으로 덮어쓴다 |
   | upstream에서 삭제·이름 변경 | 똑같이 지우거나 옮긴다. 추적 파일은 `git mv`를 쓴다 |
   | 생성 스크립트가 만드는 파일 | 직접 고치지 말고 스크립트를 다시 돌린다. 예: ponytail `.openclaw/skills/*`는 `node scripts/build-openclaw-skills.js` |

5. `sources.json`의 `ref`를 새 값으로 고치고 `python3 tools/render.py`로 README 표와 `.claude-plugin/marketplace.json`을 다시 만든다. 두 파일의 버전 표기는 손으로 고치지 않는다.
6. `python3 tools/verify.py <플러그인>`과 아래 "검증"의 수동 항목을 마친다.
7. 커밋 하나를 만들고 PR을 연다.

## 자동 실행

`.github/workflows/update.yml`이 3일마다 위 절차를 돌린다. 감지는 LLM 없이 하고, 바뀐 플러그인마다 Claude Code가 번역한 뒤 `i18n/<플러그인>-<새 ref>` 브랜치로 PR을 연다. 같은 브랜치가 이미 있으면 건너뛰니 PR을 머지하거나 닫고 브랜치를 지워야 다음 갱신이 잡힌다. 한 플러그인만 다시 돌리려면 Actions에서 `only`를 넣어 수동 실행한다.

PR이 열리면 `review.yml`이 verify를 돌리고, 번역에 참여하지 않은 Claude가 upstream diff와 대조해 리뷰한다. 지적은 차단(오역, 누락, 토큰 변경, 원문 불일치, verify 실패)과 사소로 나뉜다. 차단 지적이 있으면 Claude가 고치고 다시 리뷰하며, 최대 3회 리뷰한다. 차단 지적이 없으면 바로 squash 머지하고, `sync.yml`이 다른 열린 PR의 README·마켓플레이스 충돌을 정리한다. 끝까지 남은 지적은 해당 줄이나 PR에 `@claude <지시>`로 답해 고치게 한다(`claude.yml`, 저장소 소유자만).

## 새 플러그인 추가

1. upstream을 `<폴더>/`에 복사하고 `chore(<플러그인>): upstream 원문 추가 (upstream vX)`로 커밋한다.
2. `sources.json`에 항목을 넣고 `tools/render.py`를 돌린다. 테스트가 있으면 `test`에 적는다.
3. 아래 번역 규칙대로 번역하고 `tools/verify.py`를 통과시킨 뒤 `docs(<플러그인>): 한국어 번역 추가 (upstream vX)`로 커밋한다.
4. 스크립트나 테스트가 찾는 문자열, 특수 파일이 있으면 아래 목록에 더한다.

## 번역 규칙

### 문체

- 산문은 하다체로 쓴다. 개조식과 헤딩은 마침표 없는 명사형으로 쓴다.
- em대시(U+2014)와 세미콜론을 쓰지 않는다. 원문에 있으면 문장을 나눠 푼다.
- 번역투(`~에 대해`, `~를 통해`, `~로 인해`)를 피한다.
- 용어는 같은 플러그인의 기존 번역을 따른다. 새 원칙이나 개념 이름은 기존 표기 방식에 맞춘다. 예: pstack 원칙은 "숫자를 설명하라(Explain the Number)"처럼 쓴다.

### 번역하는 것

- 본문, 헤딩, 표, frontmatter의 `description`
- 코드블록 안의 코드 주석과 docstring
- mermaid 노드·엣지 라벨. 노드 ID, 문법 키워드, 화살표는 그대로 둔다. 바꾼 뒤 `npx -y @mermaid-js/mermaid-cli`로 렌더해 확인한다.
- 사용자가 입력하는 예시 프롬프트. 실제로 칠 법한 자연스러운 한국어로 옮긴다.
- 출력 예시의 설명문과 placeholder 설명

### 번역하지 않는 것

- 명령, 플래그, 경로, URL, 식별자, 패키지 이름, frontmatter 키와 `name`
- 스킬 이름과 슬래시 명령 (`/poteto-mode`, `$ponytail:...`), 템플릿 placeholder 이름 (`<base>`, `<app>`)
- 코드가 그대로 쓰는 문자열 리터럴. 오류 메시지, UI 문구, 로그 값 등이다.
- 스크립트나 테스트가 찾는 문자열. 손대기 전에 `scripts/`, `tests/`, `*.mjs`, `*.js`를 grep해 확인한다.
  - pstack `multi-phase-plan.md`의 계획 템플릿 전체 (`check-plan.mjs`가 헤딩과 단어를 검사한다)
  - setup-pstack 설정 블록의 역할 키와 예산 라벨 (em대시가 있어도 원문 그대로)
  - reviewer 출력 형식의 `**Location**`, `[Severity]` 같은 구조 키
  - unlazy의 `EXPECT:` 값, `OWNS:`/`CHECK:`/`CWD:` 같은 키
  - unslop 스토리 영상의 단계 이름(`Spacing`, `Details` 등), `data-*` 속성, `unslop by @heydamir` (`story.mjs`가 찾거나 그대로 쓴다)
  - dsh-superagent `prompts/team/delivery.md`의 `it changes fewer than 200 lines (additions plus deletions);` (`autoMergeThreshold`와 migration이 찾아 바꾼다), 섹션 이름 `Communication`, `Ticket scope`, `Delivery requirements`, `Policy` (코드가 헤딩을 만들고 프롬프트가 이 이름으로 가리킨다)
- `shortcut:`과 예전 `ponytail:` 주석 접두어. `/ponytail-debt`가 이 접두어로 주석을 모은다. 접두어 뒤의 설명은 번역한다.
- 실제 책과 글 제목

### 슬래시 명령과 조사

예시 프롬프트에서 슬래시 명령 뒤에 조사가 오면 한 칸 띄운다. 예를 들어 `/architect`와 조사 `로` 사이에 공백을 둔다. 명령 이름이 공백에서 끝나야 확실히 인식된다. Cursor 문서는 문장 중간 명령의 파싱 규칙을 밝히지 않는다.

### 앵커 링크

헤딩을 번역하면 영어 slug로 건 링크가 깨진다. 링크는 원문대로 두고 한국어 헤딩 바로 앞에 원래 slug를 넣는다. 그 slug를 가리키는 링크가 저장소 안에 있을 때만 넣는다. 가리키는 링크가 없는 `<a id>`는 마크다운 뷰어에 태그로만 보인다. upstream이 직접 넣은 `<a id>`는 원문이므로 그대로 둔다.

```md
<a id="run-your-first-task"></a>
## 첫 작업 돌리기
```

번역이 끝나면 `python3 tools/check-anchors.py <폴더>`로 폴더 전체의 `](...#anchor)` 링크가 대상 파일의 앵커(GitHub slug 또는 `<a id>`)를 가리키는지 검사한다. 헤딩을 바꾸지 않은 갱신에서도 돌린다.

### 테스트

테스트가 번역된 파일의 영어 문구를 검사하면 단언을 한국어 문구로 바꾼다. 예: `/lazy senior/`를 `/게으른 시니어/`로 바꾼다. 원문 그대로 둔 파일을 검사하는 테스트는 건드리지 않는다.

### 특수 파일

- `ponytail/README.md`, `ponytail/i18n/README.ko.md`: upstream이 한국어 README를 직접 제공하니 둘 다 upstream 원문으로 덮어쓴다. 코드블록 주석은 번역했으니 갱신할 때 그 차이만 다시 맞춘다.
- `ponytail/i18n/README.es.md`, `README.ja.md`, `README.zh-CN.md`: 번역하지 않고 원문으로 둔다.
- `ponytail/examples/*.md`: 벤치마크 모델 출력을 옮긴 파일이다. 코드는 그대로 두고 주석만 번역한다. 줄 수가 README 수치와 맞도록 한 줄은 한 줄로 옮긴다.
- `mattpocock-skills/AGENTS.md`: `CLAUDE.md`를 가리키는 심볼릭 링크다. 링크 그대로 둔다.
- `emilkowalski-skills/skills/improve-animations/PLAN-TEMPLATE.md`: 템플릿 블록은 원문 그대로 둔다. 안쪽 코드 펜스 앞의 폭 없는 공백(U+200B)도 지우지 않는다.
- `emilkowalski-skills/skills/break-ui/CATALOG.md`: 값 열은 사용자 코드에 넣는 최악의 데이터라 번역하지 않는다.
- `unslop/`: CC BY 4.0이다. SKILL.md 앞과 references 끝의 크레딧을 지우지 않고 번역본임을 밝힌 문구를 유지한다. `README.md` 끝의 번역 안내 문단은 upstream에 없으니 갱신할 때 남긴다.
- `dsh-superagent/`: 플러그인이 아닌 DeepSeek Harness 번들이라 마켓플레이스에 올리지 않는다. `prompts/`는 런타임 프롬프트지만 번역한다. 대문자 도메인 용어(Ticket, Source, Session, Policy 등)는 영어로 둔다. 테스트(`tests/cards.spec.ts` 등)가 프롬프트 문구를 단언하니 프롬프트를 고치면 단언도 같이 고친다. `README.md` 끝의 번역 안내 문단은 upstream에 없으니 갱신할 때 남긴다.
- `emilkowalski-skills/skills/animation-vocabulary/SKILL.md`: 용어 이름은 영어로 두고, 용어와 정의를 em대시로 잇던 원문 형식은 `**Term**: 정의`로 바꾼다. 예시 출력은 용어 항목의 번역을 글자 그대로 옮긴다.

## 검증

- **자동:** `tools/verify.py`가 앵커, 추가한 줄의 em대시·세미콜론(경고), `sources.json`의 `test`를 돈다.
- **mermaid:** 바꾼 블록을 렌더한다.
- **테스트 환경:** CI는 Node 22, ffmpeg, pandas를 설치한다. 로컬에 없으면 unslop story 테스트와 ponytail csv 테스트가 실패한다.
- **diff 검토:** `git diff -U0 --word-diff=plain`으로 코드 토큰이나 문자열 리터럴이 바뀌지 않았는지 읽는다.

## 커밋

- 플러그인마다 커밋과 PR을 하나씩 만든다.
- 번역 파일, upstream 원문, `sources.json` 변경을 함께 넣는다. `git status`에 남은 파일이 없는지 확인한다.
- 제목 형식은 아래와 같다.
  ```
  docs(<플러그인>): 한국어 번역 추가 (upstream vX)
  docs(<플러그인>): 한국어 번역 갱신 (upstream vX)
  ```
- 본문에는 반영한 범위(`<기준>..<새 버전>`)와 구조 변경(이름 변경, 삭제, 승격)을 적는다.
