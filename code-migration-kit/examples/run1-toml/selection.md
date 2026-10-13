# 스트레스 테스트 파일 선정 (취향이 아니라 기준으로)
encoder.py(304줄), 점수 근거:
- amendment A1(InlineTableDict sentinel, encoder.py:227)을 시험한다. 가장 새롭고 가장 덜 검증된 규칙이다
- inventory 20행 중 10행을 시험한다. UNKNOWN 계열 결정 두 개가 모두 들어 있다
- 죽은 분기가 2개 있다(87 py2 guard, 260 도달 불가 list). 죽은 코드도 1:1로 옮긴다는
  자세를 시험한다
- 디스패치 테이블 dump_funcs(135-141). dict->object + 함수 맵 매핑을 시험한다
제외: decoder.py(1057줄, 검사자가 diff를 한눈에 담기에 너무 크다),
tz.py/ordered.py/__init__.py(너무 사소해서 어떤 규칙도 고발하지 못한다).
파일럿 실행: 이번 축소판 dogfood에서는 Step 3의 첫 단위에 FOLDED(합침).
리뷰어가 그곳에서 규칙 준수 여부를 맡는다. 이탈로 기록했다.
