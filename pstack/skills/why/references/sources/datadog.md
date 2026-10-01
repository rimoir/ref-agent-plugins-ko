# Datadog 텔레메트리

## 이 출처에 담긴 것

Datadog은 런타임 기록을 담는다. 계획하거나 논의한 것이 아니라 프로덕션에서 실제로 일어난 일이다.

- **메트릭.** 팀이 계측해 둔 카운터, 게이지, 히스토그램. 메트릭이 *있다는 것* 자체가 증거다. 누군가 이 숫자를 지켜볼 가치가 있다고 봤다는 뜻이다.
- **모니터와 알림.** 팀이 누군가를 깨울 만하다고 정한 조건. `rate_limit_hit > 10/min`에 울리는 모니터는 팀이 그 임계값을 걱정했다는 직접 증거다.
- **대시보드.** 골라 엮은 화면. 차트를 보면 팀이 어떤 하위 시스템에서 무엇을 중요하게 여기는지 알 수 있다.
- **APM 트레이스와 스팬.** 요청 단위 런타임 데이터. "왜 느린가", "왜 여기에 타임아웃이 있나" 같은 질문에 쓸모 있다.
- **로그.** 양이 많은 이벤트 기록. 방어 코드를 만든 동기가 된 오류 조건이 담겨 있을 때가 많다.
- **인시던트.** 타임라인과 링크된 포스트모템이 있는 공식 장애 기록.
- **노트북.** 탐색적 조사. 가설과 분석이 담겨 있을 때가 많다.

Datadog은 "이 코드가 작성될 무렵 프로덕션의 실제 상황이 어땠나?"에 답한다. 이것이 코드의 모양을 설명해 줄 때가 많다.

## 찾는 방법

Datadog MCP를 쓴다. 넓게 시작한 뒤 좁힌다.

1. **담당 서비스를 찾는다.**

   ```
   search_datadog_services (filter by name or team)
   search_datadog_service_dependencies (see upstream/downstream)
   ```

2. **대시보드와 모니터를 먼저 본다. 팀이 무엇을 신경 쓰는지 알려 준다.**

   ```
   search_datadog_dashboards (query: feature name, service name, symbol)
   search_datadog_monitors   (same queries)
   ```

   대시보드나 모니터가 대상을 다루면 그 쿼리와 지켜보는 임계값을 적어 둔다. "왜 N으로 제한돼 있나?"의 답이 그 임계값인 경우가 많다.

3. **대상 주변의 메트릭.**

   ```
   search_datadog_metrics (by name pattern, e.g., the feature or symbol)
   get_datadog_metric_context (metadata: description, units, tags)
   get_datadog_metric (timeseries; "was there a spike around the PR date?")
   ```

   메트릭의 추이를 대상이 추가되거나 바뀐 날짜와 맞춰 보면 강한 보강 증거가 된다. "`payment_timeout` 메트릭이 2023-11-03에 치솟았고 재시도 로직은 2023-11-06에 병합됐다."

4. **로그. 쏟아 내지 말고 좁힌다.**

   ```
   search_datadog_logs (raw log patterns near the target, set use_log_patterns=true)
   analyze_datadog_logs (SQL-style aggregations, only when you need counts)
   ```

   심볼, 오류 문자열, 기능 이름으로 찾는다. **기간을 제한한 쿼리를 강하게 우선한다**(예: 변경 전후 30일). 로그 양은 엄청나다. 제한 없는 검색은 시간을 낭비하고 시간 초과가 날 수 있다.

5. **APM 스팬과 트레이스.**

   ```
   aggregate_spans    (stats: "how often does this endpoint fail?")
   search_datadog_spans (inspect individual spans)
   get_datadog_trace  (a specific trace ID)
   ```

   타임아웃, 재시도, 느린 경로, 서비스 간 동작에 쓸모 있다.

6. **인시던트.**

   ```
   search_datadog_incidents (by title, team, date range)
   get_datadog_incident     (full detail for a specific incident)
   ```

   대상이 방어적으로 보이면 그것이 추가된 무렵의 인시던트를 찾는다. 타임라인에 "X에 대한 방어 검사 추가"가 있는 인시던트는 거의 직접 증거다.

## 여기서 좋은 증거의 모습

- 쿼리와 임계값이 코드가 강제하는 제약과 맞는 모니터(코드는 100으로 제한하고, 모니터는 요청이 분당 100을 넘으면 알림)
- 대상 작성자가 만든 대시보드로, 위젯이 코드가 측정하거나 막는 것과 대응하는 것
- 코드 병합 직전에 프로덕션 급증이 있고 그 뒤로 값이 안정된 메트릭
- 대상 코드, 같은 심볼, 같은 오류 문자열을 언급하는 인시던트 기록
- 방어 코드가 막을 특정 오류 패턴을 보여 주는 로그로, 타임스탬프가 변경 전 구간에 있는 것

## 흔한 함정

- **상관은 인과가 아니다.** PR 전의 급증과 그 뒤의 안정화는 시사적일 뿐 결정적이지 않다. 같은 구간에 다른 변경이 반영됐을 수 있다. 인접 PR을 확인한다.
- **찾은 차트에 과적합하기.** Datadog 시각화는 사람이 *만든* 것이고 그 사람의 관점을 반영한다. "retry success rate"라는 차트는 팀이 재시도 성공을 신경 썼다는 증거이지, 특정 코드 한 줄이 존재하는 이유는 아니다.
- **사라진 텔레메트리.** 메트릭은 이름이 바뀌거나, 지워지거나, 보존 기간이 짧을 수 있다. 관련 구간의 데이터를 찾을 수 없다면 그것은 빈틈이지 결과 없음이 아니다.
- **규모에서 오는 잡음.** 흔한 문자열로 로그를 찾으면 수천 건이 걸린다. 서비스, 태그, 시간으로 과감하게 좁힌다. 원시 로그를 쏟아 내지 말고 `analyze_datadog_logs`로 집계한다.
- **계측됐다 != 원인이었다.** 메트릭이 있다는 것은 누군가 무언가를 잴 만큼 신경 썼다는 뜻이지, 코드가 그것 *때문에* 추가됐다는 뜻은 아니다. 커밋·PR 날짜와 대조한다.

## 돌려줄 것

관련 항목마다 다음을 적는다.
- 종류(대시보드 / 모니터 / 메트릭 / 로그 패턴 / 트레이스 / 인시던트 / 노트북)
- 제목이나 이름
- 링크나 식별자(대시보드 ID, 모니터 ID, 메트릭 이름, 인시던트 ID)
- 소유자·작성자와 생성·수정 날짜
- 질문과 관련된 구체적인 조건, 쿼리, 인용(가능하면 원문 그대로)
- 관련성: 대상 코드에 대해 시사하는 바와 연결이 얼마나 강한지
