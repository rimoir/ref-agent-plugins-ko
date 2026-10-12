---
name: unslop
description: "모든 글에서 AI 티를 걷어 낸다."
disable-model-invocation: true
---

# Unslop

텍스트를 편집해 AI 패턴을 없앤다. 아래 패턴을 훑은 뒤 다시 쓴다. 의미는 보존하고 의도한 어조에 맞춘다.

## 찾아서 고칠 패턴

규칙 번호는 다른 스킬이 인용하는 고정 ID다. 규칙을 지우면 번호가 빈 채로 남는다.

### 내용

3. **피상적인 -ing 구.** "highlighting...", "ensuring...", "reflecting...", "showcasing...", "fostering...". 지우거나 실제 출처로 내용을 채운다.
5. **모호한 출처 표시.** "Experts believe", "Industry reports suggest", "Some critics argue". 출처를 밝히거나 지운다.

### 언어

7. **AI 어휘.** Additionally, crucial, delve, enduring, enhance, fostering, garner, interplay, intricate, landscape(추상적 의미), pivotal, showcase, tapestry(추상적 의미), testament, underscore, vibrant. 평이한 단어로 바꾼다.
8. **"is"를 거창하게 말하기.** "serves as", "stands as", "boasts", "features". "is"나 "has"라고 쓴다.
9. **"Not just X, but Y."** 대신 요점을 바로 말한다.
10. **셋의 법칙.** 생각을 억지로 세 개씩 묶지 않는다. 자연스러운 개수를 쓴다.
11. **동의어 돌려쓰기.** 한 문단에 protagonist, main character, central figure, hero를 다 쓴다. 하나를 골라 반복한다.
12. **가짜 범위.** X와 Y가 의미 있는 척도 위에 있지 않은데 "from X to Y"라고 쓴다. 주제를 그냥 나열한다.

### 문체

13. **em대시 남용.** em대시는 아예 쓰지 않는다. 마침표나 쉼표만 쓴다(괄호, en대시, 대시 대용 하이픈도 쓰지 않는다). 생각을 떼어야 하면 문장을 끝내거나 쉼표를 쓴다.
14. **콜론 남용.** 목록이나 예시 앞의 콜론은 괜찮지만 문장 중간의 연결어로는 쓰지 않는다. "If you're coming from traditional automation: instead of registering event handlers, you describe conditions"에서 콜론은 아무것도 보태지 않는다. 비교 구도 없이 요점이 홀로 서도록 다시 쓴다. "Describing when the scheduler should fire works best as plain English." 의미는 같고 목발 같은 구두점이 없다.
15. **굵은 글씨 남용.** 고유명사나 약어마다 굵게 하지 않는다.
16. **인라인 헤더 목록.** 티가 나는 형태는 굵은 라벨과 콜론이 그 줄 내용을 되풀이하는 것이다. "**Performance:** Performance improved...". 이런 것은 산문으로 바꾼다. 마침표로 끝나고, 항목 이름을 대고, 뒤에 실제로 새로운 내용이 오는 굵은 도입구("**Schema in TypeScript.** Tables live in one file.")는 괜찮고 티가 아니다.
17. **Title Case 헤딩.** 문장형 대소문자(sentence case)를 쓴다.
18. **장식용 이모지.** 헤딩과 글머리표에서 뺀다.
19. **둥근 따옴표.** 곧은 따옴표를 쓴다.

### 소통 흔적

20. **챗봇 문구.** "I hope this helps!", "Let me know if...", "Of course!", "Certainly!", "Found the smoking gun!" 지운다.
22. **아첨하는 어조.** "Great question! You're absolutely right!" 바로 답한다.

### 군더더기

23. **군더더기 구.** "In order to"는 "To"로. "Due to the fact that"은 "Because"로. "It is important to note that"은 지운다.
24. **과도한 얼버무리기.** "could potentially possibly be argued that it might"는 "may"로.
25. **뻔한 결론.** "The future looks bright." 구체적인 계획이나 사실을 말한다.

### 전문용어

26. **추상적 은유 명사.** Substrate(base), wedge, wedge in(add), vector(way, method), locus, vantage, nexus, 명사로 쓴 primitive, 은유로 쓴 harness, "API surface"처럼 쓴 surface, bedrock, 은유로 쓴 scaffolding, modality, paradigm, gold-plating(more than the job needs), 은유로 쓴 ratchet(그 메커니즘의 실제 이름, 또는 a limit that only tightens), 코드를 옮길 때 쓴 evacuate(move out), endgame(the last phase), north star, flywheel. 기술적으로 읽히지만 대개 더 평이하고 구체적인 단어가 있다. 구체적인 단어를 고른다.

### 평이한 말

27. **느낌이 아니라 하는 일을 말한다.** "the database stays close at hand", "SQL you can read", "types that follow your schema"는 느낌을 말한다. 고친 문장은 메커니즘이나 숫자를 댄다. "`.toSQL()` returns the exact string sent to the database", "a column rename fails the build". 그 문장이 독자에게 무엇을 하라거나 알라고 하는지 묻고, 그것을 쓴다. 구체적인 지시, 사실, 숫자로 다시 말할 수 없으면 지운다. 한 가지 더 확인한다. 그 문장이 다른 프로젝트 문서에 그대로 들어갈 수 있다면 이 프로젝트에 대해 아무것도 말하지 않는 것이다. 지운다.
28. **빽빽한 문장은 줄이거나 나눈다.** 독자가 문장을 해석하려고 되돌아가야 하면 둘로 나누거나 절을 뺀다. 한 문장에 생각 하나.
29. **능동태.** 능동태를 우선한다. "is/are/was/were + 과거분사"를 잡아내 행위자를 밝힌다. "queries are validated"는 "the compiler validates queries"로, "the file is parsed by the loader"는 "the loader parses the file"로. 수동태는 행위자를 모르거나 행위자가 정말 중요하지 않을 때만 괜찮다.
30. **부사를 빼거나 더 강한 동사를 쓴다.** "runs quickly"는 "is fast"나 숫자로, "significantly improves"는 측정한 차이로. 약한 동사를 부사가 떠받치고 있다면 동사가 틀린 것이다.
31. **평이한 단어를 우선한다.** "utilize"와 "leverage"는 "use"로, "facilitate"는 "help"로, "numerous"는 "many"로, "in the event that"은 "if"로. 더 화려한 동의어가 더 분명한 경우는 드물다.
32. **꾸민 문체.** 글자 그대로의 표현이 있는데 은유나 수사를 쓴다. 경구("wire it or delete it"), 효과를 노린 수사적 토막글, 의인화한 코드("the plan holds it"), 비유적 동사("rides along", "stands on"), 상투적인 틀 짜기 문구. "A dial worth turning"은 "a parameter worth varying"으로. 뜻하는 바를 말한다. 은유 명사는 규칙 26이 다룬다.
33. **과도한 압축.** 관사를 빼거나, 동사 없는 토막글, 기호식 표현, 약어로 독자가 읽는 대신 해독하게 만든다. "Parser rejects bad date → exit 2, no write"는 "The parser rejects a bad date, exits with code 2, and writes nothing."으로. 관사와 동사를 갖춘 온전한 문장을 쓰고, 화살표와 약어는 풀어 쓴다.
