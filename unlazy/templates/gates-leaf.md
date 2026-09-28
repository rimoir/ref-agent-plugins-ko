# Gates: <리프 또는 작업 이름>

OWNS: <이 리프가 쓸 수 있는 저장소 기준 상대 glob, 예를 들어 src/api/**, tests/api/**>

Scope: <완성된 산출물 전체를 설명하는 한 문장>

- [ ] G1: <결과물에서 직접 측정한 확인 가능한 결과>
  CHECK: node scripts/verify-outcome.mjs
  EXPECT: outcome verification passed
  EVIDENCE: pending

- [ ] G2: <하위 프로젝트에서 확인하는 통합 결과>
  CHECK: node scripts/verify-integration.mjs
  EXPECT: integration verification passed
  CWD: packages/example
  EVIDENCE: pending

- [ ] G3: <어떤 명령으로도 판정할 수 없는 수동 결과>
  EVIDENCE: pending

<!--
검사기를 실행하기 전에 모든 플레이스홀더를 바꾼다.

엄격한 형식:
- 모든 게이트에 겹치지 않는 명시적 id를 쓴다.
- CHECK, EXPECT, CWD, EVIDENCE는 들여쓴다.
- 실행 게이트에는 CHECK와 EXPECT를 모두 두고, 수동 게이트에는 둘 다 두지 않는다.
- 성공하려면 프로세스 종료 코드 0과 EXPECT 일치가 모두 필요하다.
- EXPECT는 모든 확인이 통과한 뒤에만 출력하는 성공 전용 표시 문자열로 정한다.
- 무언가가 없다는 확인이나 부정 확인이라면, 같은 검사기를 알려진 양성 픽스처에
  실행해 보고 그 대조 결과를 게이트의 수동 검토에 기록한다.
- 주어진 수치는 원본에서 측정한다. 주어진 숫자를 EXPECT에 옮겨 적어 그 숫자
  자체의 증거로 삼지 마라.
- 이식성 있는 예시에는 저장소에 들어 있는 Node 스크립트를 쓴다. 기본값이 아닌
  셸이나 외부 도구가 필요하면 명시적으로 선언한다.
- 스코프 탐색과 레거시 탐색은 검사를 저장소 루트 기준으로 실행한다. 이 게이트
  파일을 `.unlazy/` 안의 경로로 직접 지정할 때는 저장소를 가리키는 `--root`와
  `--cwd`를 명시적으로 넘겨서, 저장소 기준 상대 경로 명령이 같은 기준 경로를
  유지하게 한다.
- 수동 증거는 정확히 기록하고, 영향이 큰 수동 게이트는 위험에 따라 검토한다.
- OWNS 경로는 저장소 기준 상대 경로여야 하고, 빠짐없어야 하며, 동시에 배정된
  다른 모든 리프의 경로와 겹치지 않아야 한다. 점유 신청은 파일을 쓰는 쪽끼리
  조정할 뿐이고 샌드박스를 만들지 않는다.

게이트가 정말로 불가능해지면 게이트를 지우지 말고 다음 줄을 추가한다.

```text
ABANDON: G<n> <non-empty reason and handoff>
```

모든 포기는 최종 보고에서 성공하지 못한 인계로 드러낸다. 포기한 리프는 완료가
아니다. references/gates.md를 본다.
-->
