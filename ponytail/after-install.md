# Hermes용 Ponytail 설치 완료

`--enable` 옵션 없이 설치했다면 다음 명령으로 켠다.

```bash
hermes plugins enable ponytail
```

켠 다음 Hermes나 게이트웨이를 다시 시작한다.

여러 사용자가 함께 쓰는 게이트웨이에서는 Hermes의 슬래시 명령 접근 제어로 `/ponytail`을 신뢰할 수 있는 사용자만 쓰게 제한한다. 실행 중에 바꾼 모드는 프로세스 단위로 유지된다.

명령:

- `/ponytail [lite|full|ultra|off]`
- `/ponytail-review [target]`
- `/ponytail-audit [target]`
- `/ponytail-debt`
- `/ponytail-gain`
- `/ponytail-help`

함께 들어 있는 스킬은 `ponytail:ponytail`, `ponytail:ponytail-review`, `ponytail:ponytail-audit`, `ponytail:ponytail-debt`, `ponytail:ponytail-gain`, `ponytail:ponytail-help`라는 이름으로 쓸 수 있다.
