# Databricks 분석과 시스템 테이블

## 이 출처에 담긴 것

Databricks는 제품 분석, 데이터 파이프라인, 웨어하우스 텔레메트리 계층이다. Datadog을 보완한다. Datadog이 *인프라·런타임* 관점이라면 Databricks는 *제품·데이터* 관점이다(사용자가 무엇을 했는지, 어떤 실험이 돌았는지, 기능 사용량이 어떻게 변했는지, 임계값 상수가 어디서 왔는지).

- **제품 분석 이벤트.** `your_warehouse.events.analytics_track_event`(원본)와, 이벤트마다 타입을 붙이고 중복을 제거한 `<your_analytics_db>.<schema>.<table>`의 dbt 모델. 사용자 행동이다. 기능 호출, 클릭, 수락·거절, 제출, 클라이언트가 보고한 에러.
- **사용량·과금 이벤트.** `your_warehouse.events.usage_event` / `<your_analytics_db>.<schema>.stg_usage_events`, `your_warehouse.events.raw_model_event` / `<your_analytics_db>.<schema>.stg_raw_model_events`. 비용이나 물량이 이끈 결정에 쓴다.
- **실험·피처 플래그 데이터.** 노출 테이블과 결과 테이블. **스키마는 회사마다 다르다.** 이름을 가정하기 전에 `SHOW TABLES`로 확인한다.
- **시스템 테이블.** `system.query.history`, `system.compute.warehouses`, `system.billing.*`, `system.access.audit`. "이 쿼리가 비쌌나?", "누가 이걸 얼마나 자주 돌렸나?", "웨어하우스 부하가 언제 치솟았나?"에 답한다.
- **dbt 계보(lineage).** `<your_analytics_db>.<schema>`의 모델을 보면 어떤 파이프라인이 테이블이나 필드에 의존하는지 드러난다. 상류 변경이 소비자 코드 변경의 동기가 되는 경우가 많다.
- **Databricks 노트북.** 엔지니어가 코드 변경 전에 쓴 탐색 분석. **SQL MCP로는 조회할 수 없다.** 근거가 노트북에 있을 것 같으면 빈틈으로 이름 붙인다.

## 검색 방법

Databricks SQL MCP를 쓴다. 주 도구는 `execute_sql_read_only`다. `statement_id`를 돌려주면 다시 실행하지 말고 `poll_sql_result`로 폴링한다.

**쿼리 전에 지형부터 파악한다.** 스키마는 회사마다 다르다. 테이블 이름을 믿기 전에 확인한다.

```sql
SHOW TABLES IN <your_analytics_db>.<schema> LIKE '*<keyword>*';
DESCRIBE TABLE <your_analytics_db>.<schema>.stg_<event>;
```

**모든 쿼리에 시간 범위를 건다.** 이 테이블들은 거대해서 제약 없는 스캔은 타임아웃된다. 출시일을 감싸는 구간으로 `_timestamp`(이벤트)나 `start_time`(`system.query.history`)을 거른다. 보통 전후 약 30일이고, 확실한 이유가 있을 때만 넓힌다.

**원본 테이블보다 타입이 붙은 dbt 모델을 쓴다.** `<your_analytics_db>.<schema>.<table>`은 중복이 제거되고 타입이 붙어 있으며 liquid clustering이 적용돼 있다. `your_warehouse.events.analytics_track_event`에는 중복이 있고 `properties_json`에 타입이 없다. 모델 이름 패턴은 `stg_<source>_<event_name_with_underscores>`이고, `<source>`는 `app`, `backend`, `website`, `cli` 중 하나다. 패턴만으로 정확한 모델 이름이 안 나오면 `SHOW TABLES`로 확인한다. 아직 dbt 모델이 없거나 dbt 갱신 지연 구간 안의 이벤트가 필요할 때만 원본 테이블로 내려간다.

**타입이 붙은 dbt 모델의 컬럼 관례**(알아 두면 `DESCRIBE` 왕복을 아낀다)

- `_timestamp`, `_id`, `_auth_id`, `_request_id`, `event_name`. 모든 모델에 있는 표준 컬럼
- `properties_<name>`. 타입이 붙고 밑줄 표기로 바뀐 이벤트 속성(`properties_entrypoint`, `properties_size_bytes`, …)
- `context_team_id`, `context_client_version`, `context_country`, `context_client_os`. 미리 추출해 둔 클라이언트 맥락

### 대체로 성과가 나는 조사 패턴

대상에 맞는 테이블과 컬럼 조합을 고른다.

1. **이벤트 사용량 궤적.** PR 머지 전후 ±30일 구간에서 관련 `stg_*` 모델의 일별 건수. 머지 하루이틀 안에 0에서 안정적인 물량으로 계단처럼 뛰면, 그 PR이 기능을 출시했다는 강한 정황 증거다. 0으로 줄어들면 지원 중단이나 삭제를 시사한다.
2. **안전장치·방어 검사의 기원.** PR *이전* 14일 동안 관련 `properties_<name>` 컬럼의 분포(중앙값 / p99 / 최댓값). p99가 대상의 임계값 상수와 일치하면 그 숫자를 데이터에서 골랐음을 시사한다.
3. **실험·피처 플래그 조회.** `SHOW TABLES ... LIKE '*experiment*'`로 노출 테이블을 찾고, PR 날짜 근처에서 관련 플래그 키의 변형별 노출 건수를 뽑는다.
4. **마이그레이션, 백필, 성능 재작성에 대한 쿼리 기록 증거.** `system.query.history`를 `statement_text ILIKE '%<table_or_symbol>%'`와 좁은 `start_time` 구간으로 거르면 변경의 동기였을 비싼 쿼리가 드러난다(`total_duration_ms`로 정렬하거나 `SUM(read_bytes)`, `COUNT(*)`로 집계한다).
5. **dbt 계보.** 대상이 `<your_analytics_db>.<schema>` 모델을 읽거나 쓴다면, 그 모델 자체의 git 기록(이 레포 안)에 근거가 담긴 경우가 많다. 직접 쫓지 말고 그 단서를 git 조사자에게 넘긴다.

## 여기서 좋은 증거의 모습

위 패턴 외에도 다음이 있다.

- 방어 코드 PR 이후 며칠 사이에 에러 분류 이벤트의 건수가 거의 0으로 떨어진다. 그 PR이 해당 에러 유형을 해결했음을 시사한다
- 노출 테이블 행에 대상의 피처 플래그 키가 있고, PR 출시일 무렵 "shipped" / "concluded" 결정이 기록돼 있다

## 흔한 함정

- **계측됐다 ≠ 원인이다.** 이벤트가 있다는 것은 누군가 로그를 남길 만큼 신경 썼다는 뜻이지, 대상 코드가 그것 *때문에* 존재한다는 뜻이 아니다. 인과를 주장하기 전에 git 조사자의 PR·커밋 인용과 짝짓는다.
- **조용한 계측 변경.** 이벤트 물량이 계단처럼 뛴 것은 사용자 행동이 바뀐 것이 아니라 새 이벤트가 기록되기 시작했다는 뜻일 수 있다. 상승을 기능 출시 신호로 읽기 전에 같은 구간의 계측 PR을 확인한다.
- **스키마 표류.** 이벤트 속성은 변한다. 오늘 타입이 붙은 dbt 모델에 있는 컬럼이 대상을 작성할 당시에는 없었을 수 있다. 오래된 데이터에는 그 속성이 원본 `properties_json` 안에만 있을 수 있다.
- **dbt 갱신 지연.** `<your_analytics_db>.<schema>.*`는 일정에 따라(흔히 매시간·매일) 다시 만들어진다. 최근 몇 시간의 이벤트라면 `your_warehouse.events.*`로 돌아가 `_id`로 중복을 제거한다.
- **회사마다 다른 테이블.** 실험, 피처 플래그, 과금, 사용량 테이블은 제각각이다. 존재를 확인한 적 없는 테이블의 결과를 보고하는 것은 전형적인 실패 방식이다. 먼저 `SHOW TABLES` / `DESCRIBE TABLE`로 확인한다.
- **보존 기한 절벽.** 관련 구간이 테이블의 보존 기한이나 dbt 모델 생성일보다 앞선다면 그것은 결과 없음이 아니라 *빈틈*이다. 종합자가 "결과 없음"을 "활동 없음"으로 읽지 않도록 명시적으로 이름 붙인다.
- **노트북은 조회할 수 없다.** SQL MCP는 Databricks 노트북을 보지 못한다. 근거가 노트북에 있을 것 같으면 빈틈으로 돌려준다.

## 돌려줄 것

관련 발견마다 다음을 적는다.
- 유형(제품 이벤트 / 실험 노출 / 사용량·과금 이벤트 / 시스템 테이블 행 / dbt 모델)
- 완전한 테이블 이름과 실행한 정확한 쿼리
- 조회한 시간 구간
- 간결한 수치 요약(건수, 백분위수, 처음·마지막 관측 타임스탬프). **원본 행을 쏟아 내지 않는다.**
- 대상 출시일과의 시간 상관관계(예: "첫 행 2024-08-15, PR #49074는 2024-08-14 머지")
- 관련성과 강도: direct / circumstantial / weak
