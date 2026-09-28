# 예제

벤치마크 실행에서 나온 실제 모델 출력을 그대로 실었다. 같은 모델이 같은 과제에 스킬 없이 답한 결과(`## Ponytail 없이`)와 ponytail을 켜고 답한 결과(`## Ponytail 적용`)를
나란히 비교할 수 있다. 모델은 Claude Haiku 4.5, temperature는 1이고 출처는 `benchmarks/output.json`이다.

사람이 손으로 쓴 것이 아니다. 직접 재현하려면
`npx promptfoo@latest eval -c benchmarks/promptfooconfig.yaml`을 실행한다. 측정 방법, 모든 모델의 결과,
10회 실행 중앙값은 [../benchmarks/](../benchmarks/)에 있다.

| 예제 | Ponytail 없이 (코드 줄 수) | Ponytail 적용 (코드 줄 수) |
|---|--:|--:|
| [이메일 검증](email-validation.md) | 75 | 3 |
| [디바운스](debounce.md) | 116 | 10 |
| [CSV 합계](csv-sum.md) | 20 | 3 |
| [카운트다운 타이머](react-countdown.md) | 267 | 9 |
| [요청 속도 제한](rate-limit.md) | 128 | 10 |
