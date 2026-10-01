# Bugbot 분류(triage)

Babysit 플레이북(`../playbooks/babysit.md`)이 Bugbot이나 리뷰 자동화 코멘트를 처리할 때 이 참조 문서를 쓴다. 목표는 Bugbot을 기본적으로 무시하는 것이 아니다. 모든 코멘트를 반드시 고쳐야 할 코드 변경으로 다루는 습관을 멈추는 것이다.

## 판단 기준표

행동하기 전에 Bugbot 스레드마다 분류한다.

- `fix`: 코멘트가 그럴듯한 정확성, 보안, 프라이버시, 데이터 손실, 인증, 과금, 마이그레이션, 멱등성, 경합, 출시된 동작 문제를 짚는다. 그 문제를 소유한 가장 아래 PR에서 고치고, 커밋 SHA로 답한 뒤 스레드를 resolve한다.
- `dismiss`: 코멘트가 문서화된 저위험 소음 패턴에 해당하고, 현재 코드와 맥락으로 그 우려에 코드 변경이 필요 없음을 증명할 수 있다. 짧은 이유로 답하고 스레드를 resolve한다.
- `ask`: 코멘트가 처음 보는 유형이거나, 심각도가 높거나, 보안·프라이버시·데이터와 관련되거나, 모호하다. 추측하지 말고 사용자에게 묻는다.

애매하면 묻는다. 시끄러운 코드 품질 코멘트를 건너뛰는 비용은 작지만, 실제 데이터 버그나 보안 버그를 건너뛰는 비용은 크다.

## 학습한 패턴 형식

새 패턴은 다음 모양으로 추가한다.

```markdown
### <짧은 패턴 이름>

- Confidence: candidate | recurring | strong
- Skip when: <참이어야 하는 조건>
- Do not skip when: <위험 경계>
- Example signal: <패턴을 알아보게 하는 문구나 코드 맥락>
- Source: <PR/코멘트 URL 또는 짧은 이력 메모>
```

예가 한두 개면 `candidate`를 쓴다. 실제 dismiss가 여러 번 쌓이면 `recurring`을 쓴다. `strong`은 패턴이 좁고, 거듭 검증되었고, 위험이 낮을 때만 쓴다.

## 반복해서 건너뛰는 후보

### 의도한 UI 또는 디자인 시스템 시각 변경

- Confidence: candidate
- Skip when: PR 설명, 스크린샷, 디자인 리뷰, 주변 코드가 시각 변경을 분명히 밝히고 있고, Bugbot 코멘트는 공유 시각 기본값이 바뀌었다는 사실을 되풀이할 뿐이다.
- Do not skip when: 코멘트가 접근성, 포커스 가시성, 키보드 탐색, 색 대비, 또는 PR이 의도하지 않고 바꾼 컴포넌트 API 계약을 가리킨다.
- Example signal: 포커스 외곽선, 버튼 크기, 간격, 공유 컴포넌트 시각 기본값에 관한 코멘트에 owner가 "intentional"(의도함)이나 "intended"(의도한 것)로 답한다.

### Bugbot이 볼 수 없는 상위 스택 또는 스택 내부 사용

- Confidence: candidate
- Skip when: Bugbot이 export, 컴포넌트, helper, 파일을 미사용으로 표시했는데, 활성 forge의 PR 목록과 diff, 상위 스택 diff, PR 맥락을 보면 스택의 뒤쪽 PR이 그것을 쓴다.
- Do not skip when: 현재 PR이 스택에 속하지 않거나, 그 심볼이 공개 API이거나, 상위 스택에서 쓴다는 주장을 검증할 수 없다.
- Example signal: "Exported component is never used"(export한 컴포넌트를 아무도 쓰지 않음)에 "used upstack"(상위 스택에서 씀) 같은 사람의 답이 달린다.

### 병렬 구현 중의 일시적 중복

- Confidence: candidate
- Skip when: 삭제·교체·검증 중인 옛 경로와 나란히 새 경로를 유지하려고 PR이 소량의 코드를 의도적으로 중복한다.
- Do not skip when: 중복된 코드가 보안, 과금, 데이터 접근, API 동작을 바꾸거나, 오래 쓸 공유 추상화를 두면 위험이 분명히 줄어든다.
- Example signal: "Significant duplication"(상당한 중복)이나 "duplicated validation logic"(검증 로직 중복)에 owner가 옛 경로는 지워질 것이라거나 중복 로직을 일부러 지역적으로 두었다고 설명한다.

### 기존 프레임워크나 컴포넌트 불변식이 경고를 이미 덮는다

- Confidence: candidate
- Skip when: 그 우려를 현재 diff나 주변 코드에서 보이는 공유 컴포넌트, 프레임워크 계약, 타입 불변식, 단일 진실 공급원이 이미 보장한다.
- Do not skip when: 불변식이 가정만 되고 강제되지 않거나, 타이밍에 의존하거나, 값이 갈라질 수 있는 비동기·상태 경계를 넘는다.
- Example signal: 공유 popover가 뷰포트 경계를 강제하는데 안쪽 popover에 max-height가 없다는 코멘트, 또는 지역에서 검사한 값과 넘긴 값이 같은 출처를 공유하는데 nullable 값을 지적하는 코멘트.

### owner가 선언한 후속 작업이나 미룬 정리

- Confidence: candidate
- Skip when: PR owner가 알려진 후속 작업이라고 명시하고, 현재 PR 때문에 동작이 나빠지지 않으며, 코멘트가 고위험 영역에 관한 것이 아니다.
- Do not skip when: 에이전트가 owner 의견 없이 움직이고 있거나, 문제가 중간·높은 심각도의 제품 동작이거나, 미루면 새 회귀가 머지된다.
- Example signal: "I'll worry about that later"(그건 나중에 신경 쓸게)나 "we'll delete this eventually"(이건 결국 지울 거야).

### 스스로 철회했거나 명시적으로 오탐이라고 한 규칙 코멘트

- Confidence: recurring
- Skip when: 코멘트 본문이나 이후 Bugbot 답글이 발견을 철회했거나, 규칙을 지켰거나, 오탐이라고 명시하고, 에이전트가 해당 규칙을 로컬에서 검증할 수 있다.
- Do not skip when: 고위험 문제에 사람이 설명 없이 "false positive"(오탐)라고 한 것이 유일한 근거다.
- Example signal: 본문에서 파일이 이미 규칙을 지킨다고 말하는 파일 이름 규칙 코멘트.

## 기본적으로 묻는다

이전 PR이 비슷한 것을 dismiss했더라도 다음 범주는 자동으로 건너뛰지 않는다.

- 보안, 프라이버시, 인증, 과금, 데이터 보존, 학습 데이터, 권한 경계에 관한 발견.
- 심각도가 높은 발견.
- 마이그레이션, 스키마, 멱등성, 동시성, 시스템 간 동작에 관한 발견.
- 제안된 수정이 작고, 제품 의도를 바꾸지 않으면서 위험을 분명히 줄이는 코멘트.

과거 데이터를 보면 사람이 보안·데이터 흐름 코멘트를 dismiss하는 경우가 가끔 있었다. 이런 경우는 팀 전체의 건너뛰기 규칙이 아니라 owner 개인의 판단으로 다룬다.

## 최근 babysit에서 얻은 후보 교훈

팀에 쓸모 있어 보이지만 아직 무르익지 않은 후보 교훈은 babysit 중이나 뒤에 여기에 덧붙인다. 여러 PR에서 패턴이 확인되면 반복되는 후보를 위 섹션으로 올리는 편을 택한다.

### 네이티브 브라우저 동작을 손으로 다시 구현한 경우

- Confidence: candidate
- Skip when: 사실상 없다. diff가 네이티브 브라우저 동작을 수동 대체물로 바꿀 때(네이티브 sticky → JS로 위치를 잡는 복제본, 네이티브 스크롤 대상 지정 → 전달한 wheel/touch 이벤트, 페인트 순서 가림 → mask/clip-path), 그 코드에 대한 Bugbot의 로직 버그 발견은 한결같이 타당했다.
- Do not skip when: 그런 코드에서 이벤트 전달 빈틈(wheel deltaMode, 터치 팬, 가장자리 scroll-chaining, 탭 허용 오차), mask/clip hit-testing 불일치, observer와 React 상태 사이의 타이밍 경합을 다룬다. 기본은 fix다.
- Example signal: "masks do not affect hit-testing"(mask가 hit-testing에 영향을 주지 않음), "overlay blocks wheel scroll"(오버레이가 휠 스크롤을 막음), "ignores deltaMode"(deltaMode를 무시함), "runs in the IntersectionObserver callback before React applies state"(React가 상태를 적용하기 전에 IntersectionObserver 콜백에서 실행됨).
- Source: sticky 가림 PR 하나. Bugbot 실행 6회, 발견 약 18건, 하나도 dismiss하지 않고 모두 고쳤다.

### 계약 테스트 드리프트 주장은 싸게 검증된다, 테스트부터 돌린다

- Confidence: candidate
- Skip when: 검증 자체는 절대 건너뛰지 않는다. 명령 하나면 된다. PR이
  프로토콜이나 문서 문장을 고정하는 계약 테스트(SKILL.md에 거는 정규식,
  문서 문구 스냅샷)를 함께 내보내고 Bugbot이 "the test no longer
  matches the doc"(테스트가 더 이상 문서와 맞지 않음)이라고(또는 그 반대로) 주장하면, 분류하기 전에
  PR 끝에서 그 테스트를 돌린다. 실패하면 주장이 실제로 확인된 것이고, 통과하면
  dismiss 답글에 쓸 구체적인 반증이 된다.
- Do not skip when: 해당 없음. 이것은 검증 지름길이지 dismiss 패턴이 아니다.
  반복 통과를 근거로 dismiss 쪽으로 기우는 휴리스틱은 여기서 빗나간다는 점에 유의한다.
  문장을 고정하는 테스트는 바로 앞선 수정 라운드가 문장을 고치기 때문에 어긋난다.
- Example signal: 앞선 수정 커밋이 고정된 문단의 문구를 바꾼 PR에서
  "Contract test omits the pre-fix wait"(계약 테스트가 수정 전 대기를 빠뜨림)가 나왔고, PR 끝에서 테스트를 돌리니
  지적한 바로 그 assertion에서 실패했다.
- Source: Bugbot 실행이 8회였던 문장 고정 PR 하나. 앞선 실행은 모두
  고치고 resolve했는데도 7번째 실행의 주장은 진짜였다.

### 같은 PR 뒤쪽에서 이미 고친 낡은 보안 리뷰 발견

- Confidence: candidate
- Skip when: 에이전트 보안 리뷰(또는 비슷한 것)가 authz·검증 호출이 빠졌다고 주장하는데, 현재 PR 끝에 바로 그 게이트가 테스트와 함께 분명히 있다. 대개 리뷰가 돈 뒤의 강화 커밋에서 추가된 것이다.
- Do not skip when: 인용된 helper가 해당 주체(principal)에게는 아무것도 하지 않거나, 검사가 그것이 막아야 할 부수 효과보다 뒤에 돌거나, 주장된 주체에 대한 커버리지가 없다.
- Example signal: PR 끝에서는 바로 그 가드가 부수 효과 전에 이미 호출되는데 HIGH 등급 "missing authorization check"(인가 검사 누락) 발견이 나온다.
- Source: 강화 커밋이 리뷰 실행보다 늦었던 webhook 엔드포인트 PR 하나.

### 일부러 좁힌 오류 조건을 넓히면 진짜 오류가 가려진다

- Confidence: candidate
- Skip when: 발견이 좁은 오류 조건(특정
  `errno`, 오류 코드, 상태 범주)을 모든 것을 잡는 조건으로 넓히라고 요구하는데, 그 좁음이
  실제 구분을 담고 있다. 대표적인 모양은 `ENOENT`에 걸린 의존성 대체 경로다.
  "바이너리가 설치되지 않음"과 "명령이 실행되었고 실패함"은
  다른 상황이다. 0이 아닌 종료마다 재시도하면 정당한 실패(찾을 수 없음, 인증 만료, 네트워크)를
  대체 경로로 다시 돌리고, 대체 경로의 오류를 보고해 진짜 오류를 숨긴다.
- Do not skip when: 좁은 조건이 같은 범주의 경우를 놓친다
  (`EACCES` 같은 다른 "바이너리 사용 불가" errno, 다른 전송 계층
  실패). 처리되지 않은 경로가 데이터를 잃거나 부분 상태를 남긴다. 또는 재시도가
  멱등적이고 원래 오류도 여전히 드러난다.
- Example signal: "only retries when X fails with ENOENT … never tries the
  fallback even when a working Y exists"(X가 ENOENT로 실패할 때만 재시도함 … 동작하는 Y가 있어도 대체 경로를 시도하지 않음). 이 코멘트가 가리키는 코드의
  대체 경로는 실패한 작업이 아니라 없는 의존성을 위해 존재한다.
- Source: 대체 경로가 실패한 명령이 아니라 없는 바이너리를 위해 존재했던
  CLI 이름 변경 PR 하나.
