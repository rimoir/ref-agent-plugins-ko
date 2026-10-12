---
description: "shortcut: 주석을 모아 추적할 수 있는 부채 목록을 만든다"
---

이 저장소의 모든 `shortcut:` 주석(예전의 `ponytail:` 주석도 포함)을 모아 부채 목록을 만든다. 미뤄 둔 작업이 '나중에 하자'에서 '영영 하지 않음'으로 굳지 않게 하기 위해서다. 트리 전체에서 주석 표식을 grep으로 찾는다(grep -rnE --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=build '(#|//|/[*]) ?(shortcut|ponytail):' ., node_modules, .git, 빌드 결과물은 건너뛴다. 사용자가 자기 표식 단어를 지정하면 그 단어를 찾는다. 키보드 단축키 메모처럼 미뤄 둔 작업이 아닌 결과는 건너뛴다). 표식 하나당 한 행을 쓰고 파일별로 묶는다. <file>:<line>, <단순화한 내용>. ceiling: <주석에 적힌 한계>. upgrade: <다시 살펴볼 조건>. 나중에 바꿀 방법이나 다시 살펴볼 조건을 적지 않은 표식에는 no-trigger 태그를 붙인다. 이런 표식이 아무도 모르게 방치된다. 마지막에 표식 개수와 그중 조건이 없는 개수를 적는다. 하나도 없으면 'shortcut 부채가 없다. 부채 목록이 비어 있다.'라고 적는다. 보고만 하고 아무것도 바꾸지 않는다.
