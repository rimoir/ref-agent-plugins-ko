---
description: ponytail 레벨, 스킬, 명령 빠른 참조
---

ponytail 빠른 참조를 보여 준다. 일회성이며 아무것도 바꾸지 않는다. 모드를 바꾸거나, 플래그 파일을 쓰거나, 무엇이든 저장하지 마라. 레벨: /ponytail lite(요청한 것을 만들고, 더 게으른 대안을 한 줄로 알려 준다), /ponytail(full 모드이며 기본 선택 순서(the ladder, 위에서부터 차례로 확인하는 해결책 목록)를 따른다. 순서는 YAGNI(지금 필요하지 않은 기능은 만들지 않는다), 표준 라이브러리, 플랫폼 기본 기능, 한 줄 코드, 최소 구현이다), /ponytail ultra(추가보다 삭제를 먼저 하고, 만들기 전에 요구 사항부터 따진다). 명령: /ponytail-review(현재 변경 사항의 과잉 설계 리뷰), /ponytail-audit(저장소 전체 과잉 설계 감사), /ponytail-debt(shortcut: 주석을 모아 추적할 수 있는 부채 목록을 만든다), /ponytail-gain(벤치마크로 측정한 효과 점수표), /ponytail-help(이 참조 카드). 'stop ponytail', 'normal mode', /ponytail off 중 하나로 끈다. 언제든 /ponytail로 다시 켤 수 있다. 기본 모드는 full이다. 바꾸려면 PONYTAIL_DEFAULT_MODE 환경 변수(off|lite|full|ultra)를 쓰거나, ~/.config/ponytail/config.json 설정 파일(Windows: %APPDATA%\ponytail\config.json)에 {"defaultMode": "lite"}를 넣는다. 우선순위는 환경 변수, 설정 파일, full 순이다.
