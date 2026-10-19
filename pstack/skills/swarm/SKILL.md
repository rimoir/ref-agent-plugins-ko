---
name: swarm
description: "병렬 작업자 N개를 펼치고, 모두 끝날 때까지 거둬들인 뒤, 보고서 하나를 돌려준다. /swarm, 'swarm this', 또는 병렬 커버리지, 경주, 건틀릿, 탐색에 쓴다."
disable-model-invocation: true
---

# Swarm

## 시작

무엇이든 띄우기 전에 phase마다 한 항목씩 할 일 목록을 연다.

1. Frame
2. Fan out
3. Aggregate
4. Report

## Phase A: 틀 잡기

1. 완료 조건(done predicate)과 swarm이 돌려줘야 할 산출물이나 보고서를 밝힌다.
2. 형태를 고른다. 조각으로 나누거나, 같은 지시로 작업자 N개를 경주시키거나, 둘을 섞는다. 경주나 혼합 형태라면 띄우기 전에 `first pass`, `rank all`, `best-of` 중 하나를 선언한다.
4. 작업자 모델은 `~/.cursor/rules/pstack-models.mdc`의 `swarm workers` 줄에서 고른다. 규칙이나 그 줄이 없으면 `grok-4.7-xhigh-fast`를 쓴다. `auto`나 `inherit-parent`이면 `model`을 생략해 작업자들이 부모 모델로 돌게 한다. Task 도구가 slug를 거부하면 기본값을 쓰고 그렇다고 알린다. 기본값을 거부하면 오류 메시지에서 같은 계열의 가장 가까운 유효 slug를 쓴다. 모델 경주라면 각 갈래의 모델을 미리 명시한다. 각 subagent의 추론 수준과 속도(fast 또는 표준)는 **poteto-mode** 스킬의 Subagents 절에 따라 작업에 맞게 고른다.
5. 작업자가 무언가를 쓴다면 각자 쓸 수 있는 출력 위치를 따로 준다. 작업자가 커밋을 검증하거나 측정한다면 지시마다 정확한 SHA를 명시한다. 측정 지시에는 방법(샘플 수, 샘플 하나가 무엇인지, 순서)도 명시한다. 작업자는 결과에 둘 다 기록한다.

## Phase B: 펼치기

작업자 N개 모두를 메시지 하나에서 `subagent_type: generalPurpose`, `environment: "cloud"`, `run_in_background: true`, 그리고 4단계의 모델로 띄운다. 모델은 `auto`나 `inherit-parent`이면 비워 둔다. `environment: "local"`은 작업자가 사용자 컴퓨터에 있는 무언가에 접근해야 할 때만 쓴다.

작업자가 기본값이 아닌 푸시된 브랜치에서 시작해야 하면 `cloud_base_branch`를 넘긴다.

모든 지시는 그 자체로 완결돼야 한다. 목표, 범위, 정확한 조각이나 경주 갈래, 검증 방법, 보고할 내용을 넣는다. 보고는 증거와 함께 `PASS`, `ISSUES`, `BLOCKED` 중 하나를 쓴다. 결함을 증명할 수 있는 작업자는 `ISSUES`를 보고하고, 첫 번째만이 아니라 증명할 수 있는 모든 문제를 나열한다.

작업자가 이탈하면 N-1로 진행하고 그 사실을 적는다.

## Phase C: 모으기

최종 결과를 읽는다. 지시가 명시한 SHA와 방법을 기록하지 않은 결과는 버리고 그 작업자를 한 번 새로 띄운다. 두 번째도 놓치면 공백으로 기록한다. 공백은 통과로 치지 않는다. 커버리지라면 필요한 조각마다 결과가 있어야 한다. 경주라면 미리 선언한 선택 규칙을 적용한다. first pass, rank all, best-of 중 하나다. 작업자의 원시 출력을 그대로 붙여 넣지 않는다.

## Phase D: 보고

표, 한 줄짜리 문제, 공백이나 이탈, 그리고 경주 규칙을 썼다면 그 규칙을 담은 통합 보고서 하나를 채팅으로 돌려준다.
