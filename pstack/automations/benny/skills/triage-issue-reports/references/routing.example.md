# 라우팅 맵 예시

이 파일을 `.cursor/automations/benny/` 밖으로, 예를 들어 `.cursor/benny/routing.md`로 복사하고 모든 자리표시자를 바꾼다. `routing.map_path`가 그 사본을 가리키게 한다. 팩을 갱신할 때 이 사본을 덮어써서는 안 된다.

분류 스킬은 이 파일을 데이터로 다룬다. 라우트에는 보고나 원인 추적에서 나온 증거가 필요하다. 키워드 일치만으로는 부족하다.

```yaml
routes:
  - name: "billing-example"
    match:
      product_areas:
        - "billing-area-placeholder"
      code_paths:
        - "billing-code-path-placeholder"
      error_signatures:
        - "billing-error-placeholder"
    destination:
      slack_channel: "billing-channel-placeholder"
      tracker_team: "billing-team-placeholder"
    owners:
      - "billing-owner-placeholder"
    allow_feature_owner_ping: false

  - name: "desktop-example"
    match:
      product_areas:
        - "desktop-area-placeholder"
      code_paths:
        - "desktop-code-path-placeholder"
      error_signatures:
        - "desktop-error-placeholder"
    destination:
      slack_channel: "desktop-channel-placeholder"
      tracker_team: "desktop-team-placeholder"
    owners:
      - "desktop-owner-placeholder"
    allow_feature_owner_ping: false

fallback:
  destination: ""
  owners: []
  allow_feature_owner_ping: false

ping_policy:
  default: "off"
  allow:
    - "configured-feature-owner"
    - "confirmed-regression-author"
  deny:
    - "broad-on-call-group"
    - "unverified-owner"
```

## 규칙

- 일치하지 않는 보고를 모두 받아 주는 팀이 없다면 `fallback.destination`은 비워 둔다.
- 안정적인 제품 영역, 코드 경로, 오류 시그니처를 쓴다.
- 공개 사본에는 비공개 데이터를 넣지 않는다.
- 공개될 예시에 날것의 사용자 ID나 채널 ID를 붙여 넣지 않는다.
- 대상 팀이 동의하기 전까지 기능 담당자 호출(ping)은 꺼 둔다.
- 재라우팅은 보고자에게 어디로 가야 하는지 알려 준다. 자동화는 절대 교차 게시하지 않는다.
