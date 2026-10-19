# 변경을 만들고 diff를 정리하기

빌드 플레이북들은 한 가지 규율을 공유한다. 관찰한 것을 말하고, 증거 요구는 플레이북에 맡긴다. 이 페이지는 흔한 빌드 작업마다 프롬프트에 무엇을 넣을지 보여 주고, 이어서 diff를 리뷰하기 좋게 유지하는 정리 습관을 다룬다.

## 아는 것을 담아 각 빌드 플레이북에 프롬프트하기

버그 프롬프트는 증상을 말하고 재현부터 요구한다.

```text
/poteto-mode 재시도하고 나면 이 명령이 레코드를 두 개 내보내. 먼저 재현하고 고친 다음 검증해 줘.
```

기능 프롬프트는 동작과 바뀌면 안 되는 것을 말한다.

```text
/poteto-mode --json 플래그를 추가해 줘. 텍스트 출력은 바이트 단위로 그대로 둬야 해. 두 형식 다 검증해.
```

리팩터링 프롬프트는 구조를 옮기기 전에 동작을 고정한다.

```text
/poteto-mode 파싱을 모듈 하나로 모아 줘. 동작은 하나도 바뀌면 안 돼. 지금 출력을 먼저 기록해 두고, 바꾼 뒤에도 같다는 걸 증명해.
```

성능 프롬프트는 인상이 아니라 측정값을 말한다.

```text
/poteto-mode 이 픽스처에서 시작에 1.8초 걸려. 트레이스를 떠서 측정된 원인을 고치고, 전후를 보여 줘.
```

각 프롬프트는 해당 플레이북([Bug fix](../../skills/poteto-mode/playbooks/bug-fix.md), [Feature](../../skills/poteto-mode/playbooks/feature.md), [Refactoring](../../skills/poteto-mode/playbooks/refactoring.md), [Perf issue](../../skills/poteto-mode/playbooks/perf-issue.md))으로 넘어가고, 플레이북이 입력하지 않은 단계를 채운다. 고치기 전에 재현하고, 구현하기 전에 데이터 형태에 이름을 붙이고, 재구성하기 전에 동작을 고정하고, 최적화하기 전에 프로파일링한다.

숫자 하나를 꾸준히 개선하려면 [Hillclimb 플레이북](../../skills/poteto-mode/playbooks/hillclimb.md)이 있다. 지표, 목표치, 최소 시도 횟수를 주면, 고정된 측정 하네스로 한 번에 가설 하나씩 반복한다. 개선은 남기고 나머지는 모두 되돌린다.

두 perf 플레이북 모두 자기 숫자에 [`/benchmark-checklist`](../../skills/benchmark-checklist/SKILL.md)를 돌린다. Perf issue는 기준선과 그 뒤의 모든 숫자를 점검하고, Hillclimb은 하네스를 고정하기 전에 점검한다. 직접 입력할 때는 [검증하고 내보내기](./06-verify-and-ship.md#vet-a-measured-number-with-benchmark-checklist)에서 다룬다.

수정보다 원인이 먼저 필요할 때도 있다. 누수, 유휴 상태의 CPU 공회전, 화면 깨짐처럼 지금 살아 있는 증상이라면 [Runtime forensics 플레이북](../../skills/poteto-mode/playbooks/runtime-forensics.md)이 실행 중인 프로세스를 계측한다. 이미 떠 둔 프로파일이라면 [Trace forensics 플레이북](../../skills/poteto-mode/playbooks/trace-forensics.md)이 그 산출물을 읽고 핫 프레임을 소스에 매핑한다. 둘 다 수정이 아니라 진단을 돌려준다.

```text
/poteto-mode 느린 시작에서 뜬 cpuprofile이야. 시간이 어디서 쓰이는지, 어느 소스 줄 때문인지 알려 줘. 아직 고치지는 마.
```

## `/tdd`로 실패하는 테스트부터 쓰기

버그에 값싼 로컬 테스트 경로가 있으면 프롬프트 전체가 두 단어로 끝날 수 있다.

```text
/tdd implement
```

맥락 안에서는 그것으로 충분하다. [`/tdd`](../../skills/tdd/SKILL.md)는 의도한 이유로 실패하는 가장 작은 테스트를 쓰고, 그다음 수정을 하고, 테스트를 다시 돌린다. 테스트에 넓은 하네스 설정이나 깨지기 쉬운 mock이 필요하다면 스킬이 그렇다고 말하고 대신 가장 가까운 실행 가능한 확인을 쓴다. 실제 명령이 더 강한 증거인 곳에 테스트를 억지로 넣지 않는다.

## TypeScript 규칙은 이름으로 로드하기

[`typescript-best-practices`](../../skills/typescript-best-practices/SKILL.md)는 타입 시스템 원칙을 구체적인 규칙으로 바꾼다. 판별 유니언, 경계에서의 `unknown`, 빠짐없는 변형 처리, 스키마에서 파생한 타입이다. 저절로 로드되지 않으니 작업이 `.ts`나 `.tsx` 파일을 건드리면 `/typescript-best-practices`를 입력한다.

## 커밋 전에 정리하기

[Opening a PR 플레이북](../../skills/poteto-mode/playbooks/opening-a-pr.md)은 커밋할 때마다 diff에 `/deslop`을 돌리고, PR 설명과 커밋 본문에 [`/unslop`](../../skills/unslop/SKILL.md)을 적용한다. `/deslop`은 pstack이 아니라 `cursor-team-kit` 플러그인에 들어 있다. 없다면 같은 결과를 평범한 말로 요청한다. 해설하는 주석, 근거 없는 방어 코드, 죽은 호환 경로, 관계없는 수정을 걷어 내라고.

산문이라면 `/unslop`에 대상과 추가 규칙을 준다.

```text
/unslop README 바뀐 부분, em대시 없이
```

자기만의 줄임말이 생길 것이다. 스킬은 `unslop that, tighten it` 같은 짧은 프롬프트에서도 의도를 잘 읽는다.

## `/no-comments`로 주석 걷어 내기

주석은 따로 한 번 훑어야 하고, 그 주석을 쓴 에이전트가 하면 안 된다. 작성자는 당신이 자기 주석을 감싸듯 자기 주석을 감싼다. 그러니 리뷰 전에 새로운 눈에 넘긴다.

```text
/no-comments 이 diff
```

[`/no-comments`](../../skills/no-comments/SKILL.md)는 [Comment Sicko](../../agents/comment-sicko.md)를 띄운다. 남길 것 목록이 짧은 읽기 전용 리뷰어다. 라이선스 헤더, 공개 API의 문서 주석, 코드가 설명하지 못하는 것을 설명하는 링크, 바꿀 수 없는 외부 의존성 때문에 강제된 동작. 나머지는 모두 지운다. 자기 코드 안의 의외성은 이렇게 봐주지 않는다. 그 주석은 리팩터링 표시로 돌아오고, `/no-comments`는 받아들인 표시를 근본 원인에서 고친다. 주석이 "do not remove" 같은 제약을 주장하면, 스킬은 그 주장을 타입, 테스트, lint로 표현하자고 제안한다. 어느 쪽이든 주석은 빠진다.

역할 분담을 분명히 해 둘 만하다. `/deslop`은 코드에서 슬롭을 걷어 내고, `/unslop`은 산문에서 걷어 내고, `/no-comments`는 주석을 그것을 쓰지 않은 리뷰어에게 넘긴다.

**함정:** 정리는 선택적인 마감 손질이 아니다. 해설하는 주석과 방어용 죽은 무게가 있는 diff는 리뷰어에게 덜 끝난 것으로 읽히고, 늘어난 코드는 다음 버그가 숨는 곳이다. diff가 부풀어 보이면 리뷰에서 지적받은 뒤가 아니라 커밋 전에 `deslop it`이라고 말한다.

다음: [검증하고 출시하기](./06-verify-and-ship.md).
