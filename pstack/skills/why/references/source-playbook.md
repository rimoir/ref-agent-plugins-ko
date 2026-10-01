# 출처별 플레이북

why 스킬은 쓸 수 있는 증거 범주마다 조사자 하나를 띄우고, 각 조사자는 아래의 출처별 플레이북 하나를 읽는다. 플레이북은 흔한 MCP에 대한 구체적인 예시다. 같은 범주의 다른 MCP에는 맞게 고쳐 쓴다.

| 범주 | 플레이북 | 다루는 예시 MCP |
|---|---|---|
| 소스 관리 이력 | [`code-archaeology.md`](./sources/code-archaeology.md) | git, `gh` |
| 이슈·티켓 트래커 | [`linear.md`](./sources/linear.md) | Linear(Jira, GitHub Issues, Plane, Shortcut에 맞게 고쳐 쓴다) |
| 장문 문서 | [`notion.md`](./sources/notion.md) | Notion(Confluence, Google Docs, Coda에 맞게 고쳐 쓴다) |
| 실시간 팀 채팅 | [`slack.md`](./sources/slack.md) | Slack(Discord, Microsoft Teams, Mattermost에 맞게 고쳐 쓴다) |
| 인프라 관측성 | [`datadog.md`](./sources/datadog.md) | Datadog(New Relic, Honeycomb, Grafana, Splunk에 맞게 고쳐 쓴다) |
| 오류·예외 추적 | [`sentry.md`](./sources/sentry.md) | Sentry(Rollbar, Bugsnag, Airbrake에 맞게 고쳐 쓴다) |
| 제품 분석 웨어하우스 | [`databricks.md`](./sources/databricks.md) | Databricks SQL(Snowflake, BigQuery, ClickHouse, dbt에 맞게 고쳐 쓴다) |

범주 공통:

- [`incident-postmortem.md`](./sources/incident-postmortem.md). 대상 코드가 방어적으로 보이면(null 검사, 재시도, 타임아웃, 속도 제한, 기능 플래그, 외부 송신 차단, OOM 핸들러) 이것을 더한다.
