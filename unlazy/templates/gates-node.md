# Gates: <중간 노드 이름> 통합

Scope: 자식 <명시적인 자식 id 목록>을 검증된 결과 하나로 통합한다

- [ ] N1: 이름을 적은 모든 직접 자식을 각자의 정확한 게이트 파일로 재검증했다
  CHECK: node <skill-dir>/scripts/gate-check.mjs --root . --cwd . --reverify --jobs 1 .unlazy/<scope>/gates/leaf-<a>.md .unlazy/<scope>/gates/node-<b>.md
  EXPECT: ALL MET
  EVIDENCE: pending

- [ ] N2: 자식 인터페이스가 PLAN.md의 계약과 일치한다
  CHECK: node scripts/verify-interfaces.mjs
  EXPECT: interface verification passed
  EVIDENCE: pending

- [ ] N3: 자식 간 동작이 엔드투엔드로 작동한다
  CHECK: node scripts/verify-integration.mjs
  EXPECT: integration verification passed
  EVIDENCE: pending

- [ ] N4: 영향을 받는 형제 노드의 동작이 회귀하지 않았다
  CHECK: node scripts/verify-regressions.mjs
  EXPECT: regression verification passed
  EVIDENCE: pending

- [ ] N5: 모든 직접 리프 자식의 소유권 점유(lease)를 부모 검증 뒤에 해제했다
  EVIDENCE: pending

- [ ] N6: 자식들에서 나온 영향이 큰 수동 결과를 중간 노드 수준에서 검토했다
  EVIDENCE: pending

<!--
검사기를 실행하기 전에 모든 플레이스홀더를 바꾼다.

N1은 직접 자식이 리프이든 다른 중간 노드(branch)이든 모든 직접 자식의 게이트
파일을 명시적으로 적어야 하고, --status가 아니라 --reverify를 써야 한다.
--status는 저장된 정의 바인딩만 검증하고, 명령을 실행하거나 현재 결과물을
살펴보지 않는다. 자식 검사가 서로 독립이고 결정적 병렬 실행을 의도한 경우가
아니면 --jobs 1을 유지한다.
자식이 포기를 보고하면 N1은 `HANDOFF REQUIRED`를 출력하고 1로 종료한다. 이때
중간 노드를 ABANDONED로 표시하고 인계를 드러낸다. 그 결과를 완료로 고쳐 쓰지 마라.

중간 노드 경로는 node-<id>.md를 쓰고, 리프 경로는 leaf-<id>.md를 쓴다. 중간
노드를 완료하려면 통합 증거가 필요하다. 각자 완료된 리프를 모아 놓은 것만으로는
부족하다.

N5는 검증을 마친 직접 리프 자식마다 아래 명령을 한 번씩 실행하고, 그 출력을 수동
증거로 기록한다. 중간 노드인 자식은 리프 점유를 갖지 않는다.

node <skill-dir>/scripts/gate-check.mjs --scope <scope> --leaf leaf-<id> --release

어떤 자식도 소유권 점유 신청을 하지 않았을 때만 N5를 뺀다.
references/orchestration.md와 references/parallel.md를 본다.
-->
