---
name: technical-writing
description: "계층형 기술 글쓰기 표준. Diátaxis 구조, Google 개발자 스타일 문장, STE 지시문 규칙, Global English 구문을 쓴다. /technical-writing을 호출하거나 문서, RFC, readme, PR 설명, 커밋 메시지를 쓰거나 리뷰할 때 쓴다."
disable-model-invocation: true
---

# 기술 글쓰기

목표는 지친 엔지니어가 한 번 읽고 이해하는 글이다. 네 개의 계층이 그 목표로 데려가고, 계층마다 질문이 하나씩 있다. 이 문서는 어떤 종류인가, 문장은 독자를 어떻게 부르는가, 문장 하나가 얼마나 싣는가, 두 가지로 읽히는 문장이 있는가. 네 계층을 모두 적용한다.

계층 위에 규칙 세 개가 있다.

- **일하지 않는 단어는 모두 지운다.** 단어 하나를 빼도 문장이 버티면 그 단어는 나간다. "In order to"는 "to"다. "It is important to note that"은 아무것도 아니다.
- **짧고 일상적인 단어를 쓴다.** "utilize"가 아니라 "use", "facilitate"가 아니라 "help", "perform"이 아니라 "do"다. 긴 단어는 정밀함으로 제 길이 값을 해야 한다.
- **규칙이 문장을 더 나쁘게 만들면 다른 방법으로 고치거나 그대로 둔다.** 규칙은 독자를 위해 있다. 모든 규칙을 지켰는데 기계가 쓴 것처럼 들리는 문장은 실패한 문장이다.

코드베이스가 곧 단어장이다. 동의어나 설명 말고 실제 심볼, 파일, 플래그, 명령 이름을 쓴다.

전문어(jargon)를 지어내지 않는다. 개발자가 소리 내어 말할 법한 단어를 쓴다. "evacuate", "ratchet", "endgame" 대신 "move", "delete", "a budget that only decreases"라고 쓴다. 이름 붙은 패턴은 처음 나올 때 뜻을 밝히면 써도 된다. 새로 찾은 위반 단어와 대체어는 `unslop`의 추상 은유 규칙에 추가할 제안으로 답변에 diff와 함께 적는다. 그 스킬을 직접 고치지는 않는다.

## 리듬에 변화를 준다

계층은 문서가 무엇을 말하고 문장마다 얼마를 싣는지 정한다. 모든 계층을 지키고도 기계가 쓴 글처럼 읽힐 수 있다. 문장이 전부 짧게 잘리고, 관점이 어디에도 없고, 구체적인 것이 하나도 없을 때다.

- 문장 길이를 일부러 섞는다. 짧은 문장은 요점을 꽂는다. 시간을 들이는 긴 문장은 사실을 그 조건이나 결과와 함께 싣는다.
- 한 문장에 한 생각이라는 말이 모든 문장을 같은 길이로 쓰라는 뜻은 아니다. 생각 두 개를 실은 문장은 나눈다. 생각 하나를 실은 긴 문장은 그대로 둔다.
- 모드가 허락하는 곳에서는 관점을 가진다. 설명(explanation)은 트레이드오프를 따지므로 장단점을 나열하지 말고 어떻게 판단하는지 말한다. 레퍼런스는 건조하게 둔다.
- 무미건조하기보다 구체적으로 쓴다. "schema changes can cause issues"가 아니라 "a column rename fails the build"처럼 쓴다.

## 모드부터 고른다 (Diátaxis)

문서 하나에 모드 하나다. 질문 두 개로 고른다. 내용이 행동(하기)을 돕는가, 이해(생각하기)를 돕는가. 학습에 쓰이는가, 업무에 쓰이는가.

- 행동 + 학습: **튜토리얼(tutorial)**
- 행동 + 업무: **하우투(how-to)**
- 이해 + 업무: **레퍼런스(reference)**
- 이해 + 학습: **설명(explanation)**

이 나침반은 문서 전체에도, 문장 하나에도 쓸 수 있다.

**튜토리얼: 해 보며 배운다.** 쓰는 사람이 교사다. 학습자의 성공은 학습자가 아니라 교사의 몫이다. 학습자가 무엇을 "배울지"가 아니라 무엇을 만들지 말하며 시작한다. 모든 단계가 눈에 보이는 결과를 일찍, 자주 낸다. 무엇이 보여야 하는지 알려 준다. 예상 출력, 바뀐 프롬프트, 로그 한 줄이다. 설명은 한 구절과 링크 하나로 줄인다. 가르치려고 멈추면 수업이 끊긴다. 구체적으로 쓴다. "우리"를 주어로 명령형으로 쓴다. "먼저 x를 한다. 이제 y를 한다."

**하우투: 목표까지 가는 단계.** 기계가 할 수 있는 동작이 아니라 사람이 가진 문제를 푼다. 독자의 역량을 전제하고 가르치는 부분은 건너뛴다. 행동만 쓴다. 곁가지도, 배경도, 완결성을 위한 완결성도 없다. 그런 것은 링크로 뺀다. 분기와 판단은 허용한다. "x를 원하면 y를 한다." 가이드 이름은 작업으로 짓는다. "Radar array calibration"이 아니라 "How to calibrate the radar array"다.

**레퍼런스: 찾아보는 사실.** 기술한다. 기술만 한다. 지시도, 설득도, 의견도 없다. 건조하고 완전하고 확신 있게 쓴다. 사실, 옵션, 한계, 오류를 얼버무림 없이 적는다. 기술하는 대상의 구조를 그대로 따라 코드와 문서를 함께 탐색할 수 있게 한다. 독자가 예상하는 자리에 내용을 둔다. 가능하면 코드에서 생성해 계속 사실로 남게 한다.

**설명: 이해와 이유.** 경계가 분명한 주제 하나를 다루고, 제품과 떨어져서도 읽힌다. 모든 제목은 앞에 "About..."이 숨어 있어도 어색하지 않아야 한다. 실제 "왜" 질문에 닻을 내린다. 맥락을 준다. 설계 결정, 역사, 제약, 대안이다. 의견은 여기서만, 다른 곳에서는 허용하지 않는다.

모드를 섞지 않는다. 튜토리얼 안에 레퍼런스 표를 넣지 않고, 레퍼런스 안에서 튜토리얼처럼 손을 잡아 주지 않고, 하우투 안에서 논쟁하지 않는다. 대신 나누고 링크한다.

## 독자에게 말하는 문장을 쓴다 (Google 개발자 스타일)

- 독자를 "you"로 부르고 현재 시제로 쓴다. "Will"은 정말 나중에 일어나는 일에만 쓴다.
- 누가 무엇을 하는지 말한다. "is checked"가 아니라 "the compiler checks"다. 수동태는 행위자를 모르거나 행위자가 요점과 상관없을 때만 괜찮다.
- 지시는 명령문으로 쓴다. "Click Submit." 사실은 담백하게 말한다. "should be done"은 절대 쓰지 않는다.
- 조건을 지시 앞에 둔다. "To delete the document, click Delete." 독자는 해당하지 않는 내용을 건너뛴다.
- 흔한 경우를 먼저, 예외를 나중에 쓴다.
- 잘 아는 친구처럼 말한다. 유행어도, 비유적 표현도, 지시문 속 "please"도 없고, 절차에서는 "simply", "easy", "quickly"를 절대 쓰지 않는다. 쉬웠다면 독자가 여기 오지 않았다.
- 미리 예고하지 않고("we will soon support..."), 연이은 문장을 같은 구절로 시작하지 않는다.
- 링크는 어디로 가는지 말하는 단어로 건다. 페이지 제목이나 짧은 설명이다. "click here"는 절대 쓰지 않는다. 바깥으로 나가는 링크보다 페이지 안의 맥락 한 문장을 낫게 여긴다.
- 헤딩은 주제만이 아니라 요점을 싣는다("Modes"가 아니라 "Pick the mode first"). 문장형 대소문자(sentence case)로 쓴다. 작업 헤딩은 맨 동사구("Create an instance"), 개념 헤딩은 명사구다. 페이지당 h1은 하나, 단계를 건너뛰지 않는다.
- 순서가 있으면 번호 목록, 나머지는 글머리표 목록이다. 목록은 완전한 문장으로 소개한다. 항목은 형태를 나란히 맞춘다.
- 코드는 코드 글꼴로, UI 요소는 굵게 쓴다. 연속 쉼표(serial comma)를 쓴다. "etc."는 빼고 목록이 일부라는 것을 앞에서 밝힌다.

## 문장이 한 번에 하나씩 실리게 한다 (STE 규칙)

- 지시문은 한 문장에 지시 하나, 그 밖의 문장은 한 문장에 생각 하나다.
- 약 20단어가 넘는 지시문과 약 25단어가 넘는 그 밖의 문장은 나눈다.
- 경고나 조건은 그것이 지키는 단계 앞에 둔다. "If hot oil touches your skin, injuries can occur."
- "the"와 "a"를 남긴다. "Remove backup file"은 두 가지로 읽힌다. "Remove the backup file"은 한 가지로 읽힌다.
- 단어마다 뜻 하나, 역할 하나를 주고 유지한다. "check"가 검사한다는 뜻이면 억제한다는 뜻으로도 쓰지 않는다.
- 동작마다 단어 하나를 골라 고수한다. 여기선 "start", 저기선 "initiate"가 아니라 "start"다.
- 절차는 직접 명령문으로 쓴다. 서술로도, 수동태로도 쓰지 않는다. "the component must be installed"가 아니라 "Install the component"다.
- 할 수 있으면 "-ing" 단어를 피한다. 너무 많은 문법 역할을 맡아 오독을 낳는다.

## 두 가지로 읽히는 문장을 남기지 않는다 (Global English)

- "only", "not" 같은 단어는 꾸미는 단어 바로 옆에 둔다. "only fails on growth"와 "fails only on growth"는 뜻이 다르다.
- 긴 명사 나열을 푼다. "the proto import budget check script"는 "the script that checks the proto-import budget"이 된다.
- "it", "they", "this"가 모두 분명한 대상 하나를 가리키게 한다. 애매하면 명사를 반복한다. "this"나 "which"로 절 전체를 가리키지 않는다.
- 동사를 빼먹지 않는다. "Phase 1 moves the converters and Phase 2 the runtime"은 Phase 2에 동사가 없다. 동사를 준다.
- 구조를 보여 주는 작은 단어를 남긴다. "Ensure that the switch is off"는 "that" 덕분에 한 가지로만 파싱되므로 "that"을 남긴다. 단어 수와 명확성을 맞바꾸지 않는다.
- 나열에서 오독을 막을 수 있으면 관사를 반복한다. 둘이 서로 다른 것이면 "the client and host"가 아니라 "the client and the host"다.
- 문장이 두 가지로 묶일 수 있으면 "and"나 "or"가 어느 부분을 잇는지 밝힌다. "Both...and", "either...or", "if...then"은 공짜로 쓰는 중의성 해소 장치다.
- 세미콜론 대신 마침표를 쓴다. em대시는 새 문장으로 바꾼다.
- 괄호 안의 글은 완전한 문법 단위로 쓰거나 독립된 문장으로 뺀다. 복수형을 "(s)"로 만들지 않는다.
- 슬래시를 쓰지 않는다. "a/b"나 "and/or" 대신 "a, b, or both"로 쓴다.
- 한 대상은 어디서나 한 이름으로 부른다. 같은 것을 "the gate", "the ratchet", "the budget check"로 부르는 문서는 세 가지를 가르친다. 바뀌지 않은 문장을 수정 사이에 고쳐 쓰는 것도 같은 비용을 치른다. 바뀌지 않은 것을 뒤흔들지 않는다.
- 관용구, 구어, 라틴어 약어, 은유를 뺀다. 비원어민 독자, 번역가, 에이전트 모두 평이한 구문을 가장 잘 파싱한다.

## 문체와 레포별 사항

- 이 스킬이 손대는 모든 문서에 **unslop** 스킬을 적용한다. 그 스킬이 슬롭 패턴 목록을 가지고 있다. AI 어휘, 군더더기, 얼버무림, 서식 티 같은 것이다.
- PR 설명과 커밋 메시지도 글이다. Diátaxis를 뺀 모든 계층이 적용된다. PR 본문은 리뷰어가 1분 안에 읽을 수 있는 브리핑이다. swarm 로그, SHA 목록, 지표 표를 붙여 넣지 않는다. 링크한다.
- 제품 UI 문자열은 문서가 아니다. 그런 문자열에는 제품의 카피 가이드라인을 쓴다.
- 코드 조각은 탭으로 들여쓴다. 실제 경로와 실제 심볼을 쓴다. 개수나 트리에 관한 주장은 그 주장이 들어가는 커밋 시점에 사실이어야 하고, 그것을 다시 만들어 내는 명령을 함께 적는다.

## 실제 예시

고치기 전:

> Configuration of the proto import ratchet budget script parameters is performed via budget.json. Note that it's important to remember that running with --write, which updates the committed budget to reflect the current count, should only be done when lowering it. If exceeded, CI fails.

고친 후:

> `budget.mjs` reads the committed budget from `budget.json` and counts the files that import protos. If the count exceeds the budget, CI fails. Run `budget.mjs --write` only to lower the budget.
