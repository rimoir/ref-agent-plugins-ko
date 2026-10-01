# 변경을 만들고 diff를 정리하기

빌드 플레이북들은 한 가지 규율을 공유한다. 관찰한 것을 말하고, 증거 요구는 플레이북에 맡긴다. 이 페이지는 흔한 빌드 작업마다 프롬프트에 무엇을 넣을지 보여 주고, 이어서 diff를 리뷰하기 좋게 유지하는 정리 습관을 다룬다.

## 아는 것을 담아 각 빌드 플레이북에 프롬프트하기

버그 프롬프트는 증상을 말하고 재현부터 요구한다.

```text
/poteto-mode this command emits two records after a retry. repro first, then fix and verify.
```

기능 프롬프트는 동작과 바뀌면 안 되는 것을 말한다.

```text
/poteto-mode add a --json flag. text output stays byte-identical. verify both forms.
```

리팩터링 프롬프트는 구조를 옮기기 전에 동작을 고정한다.

```text
/poteto-mode move parsing into one module, zero behavior change. record the current output first and prove it's unchanged after.
```

성능 프롬프트는 느낌이 아니라 측정값을 말한다.

```text
/poteto-mode startup takes 1.8s on this fixture. trace it, fix the measured cause, show me before and after.
```

각 프롬프트는 해당 플레이북([Bug fix](../../skills/poteto-mode/playbooks/bug-fix.md), [Feature](../../skills/poteto-mode/playbooks/feature.md), [Refactoring](../../skills/poteto-mode/playbooks/refactoring.md), [Perf issue](../../skills/poteto-mode/playbooks/perf-issue.md))으로 넘어가고, 플레이북이 입력하지 않은 단계를 채운다. 고치기 전에 재현하고, 구현하기 전에 데이터 형태에 이름을 붙이고, 재구성하기 전에 동작을 고정하고, 최적화하기 전에 프로파일링한다.

숫자 하나를 꾸준히 개선하려면 [Hillclimb 플레이북](../../skills/poteto-mode/playbooks/hillclimb.md)이 있다. 지표, 목표치, 최소 시도 횟수를 주면, 고정된 측정 하네스로 한 번에 가설 하나씩 반복한다. 개선은 남기고 나머지는 모두 되돌린다.

## `/tdd`로 실패하는 테스트부터 쓰기

버그에 값싼 로컬 테스트 경로가 있으면 프롬프트 전체가 두 단어로 끝날 수 있다.

```text
/tdd implement
```

맥락 안에서는 그것으로 충분하다. [`/tdd`](../../skills/tdd/SKILL.md)는 의도한 이유로 실패하는 가장 작은 테스트를 쓰고, 그다음 수정을 하고, 테스트를 다시 돌린다. 테스트에 넓은 하네스 설정이나 깨지기 쉬운 mock이 필요하다면 스킬이 그렇다고 말하고 대신 가장 가까운 실행 가능한 확인을 쓴다. 실제 명령이 더 강한 증거인 곳에 테스트를 억지로 넣지 않는다.

## TypeScript 규칙은 알아서 로드되게 두기

[`typescript-best-practices`](../../skills/typescript-best-practices/SKILL.md)는 워크플로에서 슬래시 명령으로 쓰지 않는다. 에이전트가 `.ts`나 `.tsx` 파일을 건드릴 때마다 로드되어, 타입 시스템 원칙을 구체적인 규칙으로 바꾼다. 판별 유니언, 경계에서의 `unknown`, 빠짐없는 변형 처리, 스키마에서 파생한 타입이다.

## 커밋 전에 정리하기

[Opening a PR 플레이북](../../skills/poteto-mode/playbooks/opening-a-pr.md)은 커밋할 때마다 diff에 `/deslop`을 돌리고, PR 설명과 커밋 본문에 [`/unslop`](../../skills/unslop/SKILL.md)을 적용한다. `/deslop`은 pstack이 아니라 `cursor-team-kit` 플러그인에 들어 있다. 없다면 같은 결과를 평범한 말로 요청한다. 해설하는 주석, 근거 없는 방어 코드, 죽은 호환 경로, 관계없는 수정을 걷어 내라고.

산문이라면 `/unslop`에 대상과 추가 규칙을 준다.

```text
/unslop the readme changes, no emdashes
```

자기만의 줄임말이 생길 것이다. 스킬은 `unslop that, tighten it` 같은 짧은 프롬프트에서도 의도를 잘 읽는다.

## `/no-comments`로 주석 걷어 내기

주석은 따로 한 번 훑어야 하고, 그 주석을 쓴 에이전트가 하면 안 된다. 작성자는 당신이 자기 주석을 감싸듯 자기 주석을 감싼다. 그러니 리뷰 전에 새로운 눈에 넘긴다.

```text
/no-comments the diff
```

[`/no-comments`](../../skills/no-comments/SKILL.md)는 [Comment Sicko](../../agents/comment-sicko.md)를 띄운다. 남길 것 목록이 짧은 읽기 전용 리뷰어다. 라이선스 헤더, 공개 API의 문서 주석, 코드가 설명하지 못하는 것을 설명하는 링크, 바꿀 수 없는 외부 의존성 때문에 강제된 동작. 나머지는 모두 지운다. 자기 코드 안의 의외성은 이렇게 봐주지 않는다. 그 주석은 리팩터링 표시로 돌아오고, `/no-comments`는 받아들인 표시를 근본 원인에서 고친다. 주석이 "do not remove" 같은 제약을 주장하면, 스킬은 그 주장을 타입, 테스트, lint로 표현하자고 제안한다. 어느 쪽이든 주석은 빠진다.

역할 분담을 분명히 해 둘 만하다. `/deslop`은 코드에서 슬롭을 걷어 내고, `/unslop`은 산문에서 걷어 내고, `/no-comments`는 주석을 그것을 쓰지 않은 리뷰어에게 넘긴다.

**함정:** 정리는 선택적인 마감 손질이 아니다. 해설하는 주석과 방어용 죽은 무게가 있는 diff는 리뷰어에게 덜 끝난 것으로 읽히고, 늘어난 코드는 다음 버그가 숨는 곳이다. diff가 부풀어 보이면 리뷰에서 지적받은 뒤가 아니라 커밋 전에 `deslop it`이라고 말한다.

다음: [검증하고 출시하기](./06-verify-and-ship.md).
