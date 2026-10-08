# 기여하기

도와줘서 고맙다. 어떤 변경이 머지되는지, 그리고 무엇을 함께 내야 하는지 정리한다.

## 새 스킬은 내가 만든다

새 스킬은 직접 추가하므로, PR 대신 아이디어를 이슈로 열어 달라.

## 규칙 세트를 바꾸려면 벤치마크가 필요하다

규칙 세트는 모든 ponytail 사용자가 모든 세션에서 불러오는 내용이다. `skills/`, `AGENTS.md`,
규칙 사본(`.cursor/`, `.windsurf/`, `.clinerules/`, `.agents/`, `.qoder/`, `.kiro/`,
`.github/copilot-instructions.md`), `.openclaw/skills/`, 그 밖에 에이전트가 받는 지시를 바꾸는
모든 것이 여기에 속한다.

이 부분의 변경은 PR에 같은 작업, 같은 모델로 돌린 세 갈래 벤치마크가 있을 때만 머지한다.

1. `baseline` (ponytail 없음)
2. 현재 ponytail (`main`)
3. 변경을 적용한 ponytail

PR에는 다음이 있어야 한다.

- 변경이 차이를 만들어야 하는 작업과, 실제로 차이가 난다는 수치
- 변경 때문에 깨질 수 있는 기존 작업 하나 이상과, 깨지지 않는다는 수치 (새 규칙은
  기존 규칙과 자주 충돌한다)
- 최신 모델로 갈래마다 최소 6회 실행한 결과와 사용한 모델

이것이 없으면 아이디어가 아무리 좋아도 PR은 닫힌다.

실제 작업은 [`benchmarks/agentic/run.py`](../benchmarks/agentic/run.py)가 한다 (준비 과정은
[해당 README](../benchmarks/agentic/README.md#reproduce) 참고). `ponytail` 갈래는
`PONYTAIL_PLUGIN_DIR`에서 플러그인을 불러오므로, `main` 체크아웃으로 한 번, 자기 브랜치로 한 번 돌린다.

```bash
cd benchmarks/agentic
python run.py --selftest
PONYTAIL_PLUGIN_DIR=/abs/path/to/ponytail-main python run.py --task <task> --arms baseline,ponytail --models opus --runs 6
PONYTAIL_PLUGIN_DIR=/abs/path/to/your-branch python run.py --task <task> --arms ponytail --models opus --runs 6
```

작업이 아직 `tasks.py`에 없다면 `good`과 `bad` 기준 답안을 함께 넣어 추가한다. 그래야 `--selftest`로
채점기가 그 차이를 잡아내는지 증명할 수 있다.

규칙 문구는 `AGENTS.md`와 `skills/ponytail/SKILL.md`에 있다. 사본을 맞춰 두고
(`node scripts/check-rule-copies.js`) `.openclaw/`는 `node scripts/build-openclaw-skills.js`로
다시 생성한다.

## 그 밖의 변경

훅, 설치 스크립트, 어댑터, 문서의 버그 수정에는 벤치마크가 필요 없다. PR을 열기 전에 다음을 돌린다.

```bash
npm test
node scripts/check-rule-copies.js
node scripts/check-versions.js
```

PR 하나에는 변경 하나만 담고, 고치는 이슈를 링크한다.

## 개발

압축 규칙 문구를 바꿀 때는 에이전트별 사본을 맞춰 둔다.

```bash
node scripts/check-rule-copies.js
npm test
```

OpenClaw 스킬 패키지(`.openclaw/skills/`)는 `skills/`에서 생성한다. 스킬을 바꾼 뒤에는 `node scripts/build-openclaw-skills.js`를 다시 돌린다. 패키지가 오래되면 테스트가 실패한다. ClawHub에 스킬을 배포하려면 `clawhub login`을 한 번 실행한 뒤 `node scripts/publish-openclaw-skills.js`를 돌린다 (`package.json` 버전으로 여섯 개를 모두 배포한다. 미리 보려면 `--dry-run`을 붙인다).

정확성 벤치마크는 이메일과 CSV 검사에 Python을 띄운다. `python`보다 `python3`을 먼저 시도한다. CSV 검사에는 로컬에 `pandas`가 설치되어 있어야 한다.
