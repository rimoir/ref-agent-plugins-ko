# inventory 감사 메모 (skeptic 1라운드)
20/20행 CONFIRMED, 반박 0건. 고친 것은 타입이 아니라 근거의 품질이다.
- decoder 행 3개: 인용 줄 번호가 하나씩 어긋남(35->36, 148->149 x2. 재귀 load 호출 하나를 loads 전달로 잘못 적음)
- encoder.py:197 행: "똑같이 오동작한다"는 주장은 FALSE다(Python은 :188에서 TypeError를 던지고, JS의 for...in은 조용히 아무것도 하지 않는다) -> 번역에서 이 차이에 TODO(port)를 달아야 한다
- encoder.py:260 행: t를 Array<string|number|(string|number)[]>로 선언해야 한다. 그러지 않으면 strict tsc에서 죽은 분기가 never로 좁혀진다
- encoder.py:203: 재귀 dump_sections 호출이 리스트 원소를 그대로 넘긴다 -> 그 위치에 cast + TODO(port)
- encoder.py:302 행은 존재하지 않는 규칙집 행을 인용했다. 실질 주장(규칙집이 침묵한다)은 참이다
