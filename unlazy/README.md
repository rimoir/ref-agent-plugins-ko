<div align="center">

# unlazy

**실행 게이트(완료로 인정하려면 충족해야 하는 조건 한 항목)로 뒷받침하는, 규모 있는 AI 에이전트 작업의 완료 규율**

완료 판정 게이트 파일을 먼저 쓴다. 검토한 검사를 실행한다. 반환된 작업을 재검증한다. 증거가 뒷받침하는 것만 보고한다.

[빠른 시작](#빠른-시작) | [게이트 계약](#게이트-계약) | [오케스트레이션](#오케스트레이션과-병렬-작업) | [보안](#보안-경계) | [연구](#연구-근거)

</div>

## 버전 상태

현재 소스는 `2.1.0`을 대상으로 한다. 여기서는 이 소스를 태그가 붙은 GitHub 릴리스로 표시하지 않는다. 바뀌지 않는 설치가 필요하면 정확한 커밋을 고정한다. 아직 릴리스되지 않은 변경 내역은 [CHANGELOG.md](CHANGELOG.md)를 본다.

## 설치

지원하는 에이전트에는 [skills CLI](https://github.com/vercel-labs/skills)로 설치한다.

```text
npx skills add Leonxlnx/unlazy
```

`-g`를 붙이면 사용자 수준으로 설치하고, `--all`을 붙이면 감지된 모든 에이전트에 설치한다.

수동 설치 위치는 다음과 같다.

```text
Claude Code:  ~/.claude/skills/unlazy
Codex CLI:    ~/.codex/skills/unlazy
```

저장소를 해당 디렉터리에 클론한다. 슬래시 스킬을 지원하는 곳에서는 `/unlazy`로, Codex에서는 `$unlazy`로 호출하거나, 스킬 설명에 적힌 자연어 트리거로 호출한다.

핵심은 [SKILL.md](SKILL.md)다. 검사기와 선택 사항인 훅은 Node 16 이상이 필요하고, 서드파티 런타임 패키지를 쓰지 않는다.

## 빠른 시작

명시적인 트리거를 넣어 규모 있는 작업을 요청한다.

```text
/unlazy tree 5 refactor the payment module and verify every migration path
```

단독 작업이면 [templates/gates-leaf.md](templates/gates-leaf.md)를 `GATES.md`로 복사하고, 모든 플레이스홀더를 채운 뒤, 명령을 실행하지 않고 내용을 확인한다.

```text
node <path-to-skill>/scripts/gate-check.mjs --status GATES.md
```

`--status`는 항상 명령을 실행하지 않는 유일한 모드다. 정확히 일치하는 승인 기록이 없는 새 판정 기준(oracle)이면, 일반 실행은 명령을 실행하지 않고 해석을 마친 명령, 기대 출력, 작업 디렉터리, 셸, `PATH`를 출력한다.

```text
node <path-to-skill>/scripts/gate-check.mjs GATES.md
```

일반 실행을 영구적인 모의 실행으로 여기지 마라. 정확히 그 판정 기준이 승인되면 일반 실행은 명령을 실행할 수 있다.

`CHECK:` 줄은 셸 코드다. 모든 명령과 호출되는 스크립트를 읽은 뒤에 게이트 파일을 승인하고 실행한다.

```text
node <path-to-skill>/scripts/gate-check.mjs --approve GATES.md
```

재검증(`--reverify`)은 이미 완료로 표시된 게이트를 포함해 모든 실행 게이트를 다시 실행한다.

```text
node <path-to-skill>/scripts/gate-check.mjs --reverify GATES.md
```

현재 CLI 전체는 `--help`로 본다.

## 게이트 계약

```markdown
# Gates: 가격 책정 동작

- [ ] G1: 가격 픽스처가 기대한 요금제 등급을 렌더링한다
  CHECK: node scripts/verify-pricing.mjs
  EXPECT: pricing verification passed
  EVIDENCE: pending

- [ ] G2: checkout 통합이 해당 패키지 디렉터리에서 성공한다
  CHECK: node scripts/verify-checkout.mjs
  EXPECT: checkout verification passed
  CWD: packages/checkout
  EVIDENCE: pending
```

실행 게이트는 프로세스가 `0`으로 종료하고 `EXPECT:`가 합친 출력과 일치할 때만 통과한다. 캡처한 stdout/stderr 내용과, `EXPECT:`와 그 요약 해시에 쓰는 정규 UTF-8 합친 문자열은 둘 다 1 MiB 한도 안에 들어가야 한다. 검사기는 한도를 넘는 매칭 문자열을 잘라 내서 성공으로 처리하지 않는다. 정규 자동 증거는 파싱한 `CHECK:`, `EXPECT:`, raw `CWD:` 정의를 담은, 버전 표시가 붙은 전체 SHA-256 다이제스트로 시작하고, 그 뒤에 종료 코드와 성공 출력 요약 해시가 오며, 마지막에 길이가 제한된 환경 정보가 온다. 완료로 체크된 실행 게이트의 증거가 없거나, 일반 문장이거나, 레거시 형식이거나, 형식이 잘못되었거나, 정의와 맞지 않으면 그 게이트는 최신이 아니고 미충족이다. 사람이 적은 일반 증거가 있는 기존 수동 게이트는 그대로 호환된다. 이 바인딩은 키를 쓰지 않으므로 구조가 바뀐 것은 잡아내지만 게이트 파일 변조는 잡아내지 못한다. 게이트 파일을 고칠 수 있는 사람은 누구나 정규 증거처럼 보이는 증거를 위조할 수 있다. `--status`와 Stop은 셸을 결정하거나 검사를 실행하지 않고도 정의가 바뀐 것을 감지하지만, 예전 증거는 다시 실행한 결과가 아니다. 부모 검증에는 `--reverify`를 쓴다.

파서는 게이트가 하나도 없는 게이트 파일, 중복 id, 필드가 빠진 실행 게이트, 잘못된 기대값, 이유가 없거나 알 수 없는 게이트 id를 가리키는 포기를 거부한다. 코드 펜스 안의 예시는 무시하고, 갱신할 때 CRLF나 LF를 그대로 유지하며, 필요하면 빠진 증거 줄을 넣는다. 유효한 포기는 성공이 아니라 종료 상태인 인계다. 검사기는 `HANDOFF REQUIRED`를 출력하고 `1`로 종료하며, Stop은 전체 id(`leaf-1.2.1:G3`처럼 파일 이름을 앞에 붙인 id)를 보고하면서 종료를 허용한다.

검사기는 사용자가 선언한 명령 판정 기준만 증명할 수 있다. 자연어 제목과 임의의 셸 코드가 같은 뜻인지는 추론하지 못한다. 그래서 좋은 게이트는 다음을 지킨다.

- 결과가 가리키는 결과물이나 서비스를 읽는다.
- 모든 확인이 통과한 뒤에만 성공 전용 표시 문자열을 출력한다.
- 부재 검사를 양성 대조(검사가 반드시 걸러 내야 하는 알려진 입력으로, 검사가 실제로 실패할 수 있음을 보인다)로 시험한다.
- 주어진 수치를 `EXPECT:`에 그대로 옮기지 않고 직접 측정한다.
- 영향이 큰 수동 결과는 위험에 비례하는 증거로 검토한다.

기계적으로 찾을 수 있는 약한 게이트 파일 패턴은 권고용이며 명령을 실행하지 않는 `scripts/gate-lint.mjs`로 잡는다. 경고를 실패로 처리하려면 `--strict`를 붙인다. 전체 명세는 [references/gates.md](references/gates.md)에 있다.

## 셸과 PATH

검사기는 `--shell`을 먼저 쓰고, 없으면 `UNLAZY_SHELL`을, 그것도 없으면 Node의 플랫폼 기본 셸을 쓴다. 기본 셸은 Unix에서는 `/bin/sh`이고, Windows에서는 `process.env.ComSpec`이며 이 값이 없으면 플랫폼의 대체 방식을 따른다. 검사는 `PATH`를 포함해 검사기를 실행한 환경을 물려받는다.

Windows에서는 이 점이 중요하다. Git Bash에서 실행한 검사기는 PowerShell에서 실행한 같은 검사기가 보지 못하는 Unix 계열 도구를 볼 수 있다. `--shell`은 인터프리터를 바꿀 뿐이고 `grep`, `tail`, `tr` 같은 외부 프로그램을 설치하지 않는다. 이식성 있는 예시는 저장소에 들어 있는 Node 스크립트를 호출한다.

부모 재검증은 선언된 같은 셸과 필요한 툴체인을 써야 한다. 셸이나 PATH가 맞지 않으면 성공 증거가 아니라 해결해야 할 검증 실패다.

## 보안 경계

승인 기록은 기본적으로 `~/.unlazy/approved` 아래에 저장된다. `UNLAZY_APPROVAL_DIR`로 소유자 전용인 다른 실제 디렉터리를 고를 수 있지만, 그 정규 경로는 검사 대상 저장소 밖에 있어야 한다. 심볼릭 링크로 된 승인 저장소, 그리고 링크되었거나 교체되었거나 소유자 전용이 아닌 기록은 실패로 처리한다(fail closed). 각 기록은 게이트 파일 절대 경로와 게이트, 정확한 `CHECK:`와 `EXPECT:`, 해석된 `CWD:`와 셸, 타임아웃, 출력과 정규식 한도, 정규식 워커 한도, 플랫폼, 물려받은 `PATH` 전체에 묶인다. 묶인 입력 중 하나라도 고치면 다시 승인해야 한다.

승인은 동의일 뿐 샌드박스가 아니다. 승인 저장소는 검사 대상 저장소 밖에 있는, 정규 경로의 소유자 전용 디렉터리다. 기록은 링크가 하나뿐인 소유자 전용 일반 파일일 때만 받아들인다. 환경과 무관한 정의 다이제스트는 런타임 승인 식별 정보와 별개다. 런타임 승인 식별 정보는 해석된 게이트 파일과 런타임 컨텍스트에도 묶인다. 승인은 호출되는 스크립트, 픽스처, 의존성, 그 밖의 간접 입력을 해시하지 않는다. `--status`와 Stop은 기록된 정의 바인딩을 검증하지만 그런 결과물은 들여다보지 않는다. 바뀐 의존성은 다시 검토하고 `--reverify`를 실행한다. 사용자가 직접 설계한 의존성 식별이 필요할 때 쓰는, 적용 범위가 제한된 다이제스트 패턴은 [SECURITY.md](SECURITY.md)를 본다. 검사는 주변 파일 시스템, 환경, 자격 증명, 네트워크에 그대로 접근한 채 실행된다. 스코프(scope)와 소유권 점유(lease)는 협력하는 프로세스끼리 조정할 뿐, 프로세스가 무엇을 읽고 쓸 수 있는지 제한하지 않는다.

## 오케스트레이션과 병렬 작업

새 컨텍스트가 필요한 작업에는 `.unlazy/<scope>/` 아래에 스코프 파이프라인 하나를 만든다.

```text
.unlazy/<scope>/PLAN.md
.unlazy/<scope>/GATES.md
.unlazy/<scope>/gates/leaf-*.md
.unlazy/<scope>/gates/node-*.md
```

총괄 에이전트는 현재 요청을 다시 읽고, 개정 번호가 붙은 계약 항목 목록을 관리한다. 이 목록은 따로 빠뜨릴 수 있는 필수 결과와 완료 판정 기준을 바꾸는 제약마다 담당과 확인 수단을 연결한다. 총괄 에이전트는 배정(dispatch) 전에 인터페이스, 의존성, 규약, 파일 소유권을 확정한다. 리프(leaf, 트리 맨 아래의 작업 단위)는 선언된 `WAITING`, `READY`, `IN-FLIGHT`, `VERIFIED`, `ABANDONED` 상태를 쓴다. 중간 노드(branch)는 `OPEN`, `VERIFIED`, `ABANDONED`를 쓴다.

READY 리프들은 각자 빠짐없고 서로 겹치지 않는 저장소 기준 상대 경로를 `OWNS:`로 선언하고 그 경로를 점유 신청(`--claim`)한 뒤에만 함께 실행할 수 있다.

```text
node <path-to-skill>/scripts/gate-check.mjs --scope api --leaf leaf-1.2.1 --claim
```

점유 매칭은 보수적이어서 안전해 보이는 쌍도 거부할 수 있다. 점유는 조정용 안전장치이지 쓰기 분리가 아니다. 워크트리 안에 만드는 출력이 서로 겹치면 워크트리를 따로 쓰고, 캐시 쓰기가 충돌할 수 있으면 캐시 위치를 따로 설정한다.

배정은 연속 배정으로 이루어진다. 검증된 리프가 다른 리프의 대기를 풀면, 관련 없는 작업을 기다리지 않고 새로 READY가 된 리프를 바로 시작한다. 게이트 검사는 기본적으로 순차 실행한다. `--jobs <N>`(`N`은 1부터 64까지의 정수)은 독립적인 검사에 쓰는 선택 사항인 연속 상한(하나가 끝나면 다음을 시작한다)이며, 보고는 게이트 파일 순서를 유지한다.

서로 독립적인 READY 묶음마다 네이티브 실행 묶음(wave)을 열고, 호스트가 돌려준 에이전트 핸들을 하나씩 기록하고, 처음 기다리기 전에 확정(`seal`)한다. 일부만 시작된 실행을 복구할 수 없으면 감사 기록이 남는 `abandon --reason` 전환을 쓴다. 핸들을 지어내거나 상태를 지우지 마라. 병렬로 분산 배정하기 전에 [references/method.md](references/method.md), [references/orchestration.md](references/orchestration.md), [references/dispatch.md](references/dispatch.md), [references/parallel.md](references/parallel.md)를 읽는다.

`gate-check.mjs --scope <id>`는 스코프의 게이트 파일과 실행 묶음을 함께 모아 판정한다. 모든 게이트가 충족되고 모든 실행 묶음이 완료되었을 때만 `ALL MET`를 출력한다. 포기한 실행 묶음은 성공이 아닌 `HANDOFF REQUIRED` 결과로 남는다.

## 선택 사항: Claude Code Stop 훅

이 훅은 현재 세션에 해당하는 게이트 파일과 배정 상태를 살펴보고, 충족되지 않은 게이트나 완료되지 않은 실행 묶음이 남아 있는 동안 Claude Code 문서에 나온 최상위 `decision: "block"` 응답을 돌려준다. 검사는 실행하지 않는다. 훅 자체의 세션별 진행 안전장치는 게이트나 배정 상태에 의미 있는 진행이 없는 채로 연속 여섯 번 차단하면 차단을 해제한다. 메타데이터만 고친 수정은 이 횟수를 초기화하지 않는다. 포기는 포기만 있는 메시지, 차단과 섞인 메시지, 마지막 차단 해제 메시지 모두에서 길이가 제한된 명시적 인계로 계속 보이고, 자유 형식으로 적은 이유는 그대로 출력하지 않는다.

사용자가 동의할 때만 설치한다.

```text
node <path-to-skill>/scripts/install-hooks.mjs
node <path-to-skill>/scripts/install-hooks.mjs --scope api
node <path-to-skill>/scripts/install-hooks.mjs --uninstall
```

기본 설치는 `.claude/settings.local.json`에 쓴다. 이 파일과 `.unlazy/`, `.unlazy-hook-state.json`을 프로젝트의 무시 규칙에 넣어 둔다. `--shared`는 Node와 훅 스크립트의 절대 경로를 프로젝트 설정에 쓰므로 보통 다른 환경으로 옮겨 쓸 수 없고, 로컬 디렉터리 이름이 드러날 수 있다. `--global`은 현재 사용자의 Claude 설정에 쓴다.

설치 스크립트는 관련 없는 훅을 보존하고, 형태가 잘못된 설정은 거부하며, 설치 디렉터리 이름에 기대지 않고 위치가 옮겨진 unlazy 항목을 알아본다. 설정은 원자적으로 쓰고, 기존 설정 파일을 교체하기 전에 그 옆에 `<settings-file>.unlazy.bak`을 만든다.

## 2.1.0에서 바뀐 점

아직 릴리스되지 않은 `2.1.0` 소스는 커뮤니티 PR에서 쓸모 있는 부분을 받아들이면서 그 PR들의 경계 사례 문제를 고쳤다.

- 엄격한 공유 게이트 파일 파싱과 명시적인 파일 이름 지정
- `--reverify`, 명시적인 `--approve`, 종료 코드와 EXPECT가 모두 맞아야 성공하고 그 밖에는 실패로 처리하는 판정
- `--shell`과 `UNLAZY_SHELL`, 실행 전 PATH 공개, 그리고 해석된 셸, CWD, 종료 코드, 일치 여부, 성공 출력 요약 해시를 담은 증거
- 스코프 파이프라인, 세션 라우팅, 원자적 게이트 파일 갱신, 직렬화된 점유 조정
- 연속 오케스트레이션과 선택 사항인 `--jobs`(기본은 순차 실행)
- 네이티브 배정 실행 묶음과, 감사 기록이 남는 일부만 시작된 실행의 포기
- 개정 번호가 붙은 PLAN 계약 항목 목록과 최종 요청 대조
- 권고용 게이트 린트와 선택해서 켜는 엄격한 실패 처리
- 부모 완료로 승격될 수 없는, 성공이 아닌 게이트 포기
- 검사기, status, Stop이 함께 쓰는 정의 바인딩 자동 증거, 실패로 처리하는 레거시 마이그레이션, 수동 게이트 호환
- 비교 가능한 디스크립터 stat을 쓰는 엄격한 Windows 파일 식별(Node 22.14.0/libuv 1.49.2로 고정한 CI 검사 포함)
- 상한이 있는 Windows 타임아웃 프로세스 트리 정리와, 실제로 중첩된 자손 프로세스로 확인하는 CI 회귀 테스트
- 세션별 Stop 훅 상태와 백업을 남기는 원자적 설정 갱신
- Node 16 지원, 런타임 의존성 없음, 패키지 테스트 명령, CI
- 정확한 보안, 이식성, 연구, 재현성 문서

기여자 이력과 풀 리퀘스트 링크는 [CHANGELOG.md](CHANGELOG.md)에 있다.

## 저장소 구성

```text
SKILL.md                         핵심 지시와 모드 선택
SECURITY.md                      CHECK, 셸, 승인, 훅, 점유 위협 모델
agents/openai.yaml               스킬 UI 메타데이터
references/gates.md              엄격한 형식, 승인, 셸, 작성 규칙
references/method.md             깊이 트리(Depth Tree) 분해 방법
references/orchestration.md      상태, 연속 배정, 검증 계층
references/dispatch.md           네이티브 실행 묶음, 호스트 어댑터, 복구
references/parallel.md           스코프와 점유 조정의 한계
references/token-economy.md      주의력과 검증 비용 규율
research/validation-protocol.md  과거 비교의 한계와 재실행 절차
templates/                       계획, 리프, 중간 노드 게이트 파일 템플릿
scripts/                         검사기, 린터, 배정 기록기, 설치 스크립트, Stop 훅
tests/                           결정적 동작 테스트와 회귀 테스트
```

저장소의 전체 테스트 명령을 실행한다.

```text
npm test
```

## 연구 근거

연구 결과는 명시적인 구조가 필요한 이유인 실패 양상을 뒷받침하지만, unlazy가 일정한 개선을 낸다는 것을 증명하지는 않는다.

- 자세한 여러 부분짜리 프롬프트를 주어도 시험한 모델들은 여전히 일부만 따르거나 너무 일찍 응답을 끊는다 ([Quantifying Laziness](https://arxiv.org/abs/2512.20662)).
- 추론은 작업과 모델에 따라 탐색을 너무 일찍 멈추기도 하고, 쓸모 있는 연산량을 넘어 계속되기도 한다 ([Thoughts Are All Over the Place](https://arxiv.org/abs/2501.18585), [When More Thinking Hurts](https://arxiv.org/abs/2604.10739), [OptimalThinkingBench](https://arxiv.org/abs/2508.13141)).
- SlopCodeBench는 시험한 어떤 에이전트도 문제 하나를 처음부터 끝까지 완전히 풀지 못했고, 가장 좋은 에이전트가 체크포인트의 `14.8%`를 통과했다고 보고한다. 체크포인트 성공은 작업 완료가 아니다 ([SlopCodeBench](https://arxiv.org/abs/2603.24755)).
- s1의 budget forcing은 모델이 멈추려 할 때 `Wait`를 여러 번 덧붙여 추론을 늘린다. 토큰 하나가 항상 작업을 개선한다는 주장이 아니다 ([s1](https://arxiv.org/abs/2501.19393)).
- METR의 Time Horizon 1.1은 전체 기간 P50 두 배 증가 시간 적합값을 `196.5`일로, 2023년 이후 적합값을 `130.8`일로 보고한다. 더 짧은 값을 전체 기간 추정치로 설명하면 안 된다 ([METR Time Horizon 1.1](https://metr.org/blog/2026-1-29-time-horizon-1-1/)).
- 외부 자료 없이 푸는(closed-book) 지식 집약 작업에서는 테스트 시점 연산을 늘릴수록 환각이 늘 수 있고, 연산만 쓰는 후처리는 원래 없던 정답 정보를 더할 수 없다 ([Test-Time Scaling in Reasoning Models Is Not Effective for Knowledge-Intensive Tasks Yet](https://arxiv.org/abs/2509.06861), COLM 2026).

이전 README 버전은 내부에서 한 과거 비교 실험(6회 실행)도 인용했다. 그 비율과 개수를 정확히 재현하는 데 필요한 원본 결과물은 이 저장소에 없다. 그 결과는 벤치마크 보장이 아니라 과거의 설계 참고 자료로 다룬다. 그 한계와, 설득력 있는 재실행 절차는 [research/validation-protocol.md](research/validation-protocol.md)에 있다.

### 출처 (최신순)

2026-08-23 기준으로 알려진 가장 최근 공개 버전이나 발행일 순서로 정렬했다. 날짜가 없는 자료는 마지막에 둔다.

- 2026-08-06: [Test-Time Scaling in Reasoning Models Is Not Effective for Knowledge-Intensive Tasks Yet](https://arxiv.org/abs/2509.06861), v3, COLM 2026
- 2026-07-10: [Measuring AI Ability to Complete Long Software Tasks](https://arxiv.org/abs/2503.14499), v4, NeurIPS 2025
- 2026-05-07: [SlopCodeBench: Benchmarking How Coding Agents Degrade Over Long-Horizon Iterative Tasks](https://arxiv.org/abs/2603.24755), v2
- 2026-04-13: ["Should I Give Up Now?" Investigating LLM Pitfalls in Software Engineering](https://arxiv.org/abs/2411.09916), v3
- 2026-04-12: [When More Thinking Hurts: Overthinking in LLM Test-Time Compute Scaling](https://arxiv.org/abs/2604.10739)
- 2026-01-29: [METR Time Horizon 1.1](https://metr.org/blog/2026-1-29-time-horizon-1-1/)
- 2025-12-19: [Quantifying Laziness, Decoding Suboptimality, and Context Degradation in Large Language Models](https://arxiv.org/abs/2512.20662)
- 2025-10-04: [OptimalThinkingBench: Evaluating Over and Underthinking in LLMs](https://arxiv.org/abs/2508.13141), v2
- 2025-10-03: [Context Anxiety: How AI Agents Panic About Their Perceived Context Windows](https://inkeep.com/blog/context-anxiety)
- 2025-03-01: [s1: Simple test-time scaling](https://arxiv.org/abs/2501.19393), v3
- 2025-02-18: [Thoughts Are All Over the Place: On the Underthinking of o1-Like LLMs](https://arxiv.org/abs/2501.18585), v2
- 날짜 없는 페이지: [Unified diffs make GPT-4 Turbo 3X less lazy](https://aider.chat/docs/unified-diffs.html)

## 기여하기

이슈와 풀 리퀘스트를 환영한다. [CONTRIBUTING.md](CONTRIBUTING.md)와 [SECURITY.md](SECURITY.md)를 읽는다. 동작에 관한 주장에는 최신이면서 그 주장을 직접 뒷받침하는 출처가 필요하고, 실행 코드 변경에는 회귀 테스트가 필요하다.

## 라이선스

[MIT](LICENSE)
