## 하는 일

`grill-with-docs`는 계획이나 설계를 두고 사용자와 [에이전트](https://www.aihero.dev/ai-coding-dictionary/agent)가 같은 이해에 이를 때까지 사용자를 인터뷰하고, 그러는 동안 용어와 어려운 결정을 저장소에 기록한다. [grill-me](https://aihero.dev/skills-grill-me)와 같은 인터뷰(질문 한 라운드, 답 기다리기, 다음 라운드)를 코드베이스를 대상으로 진행한다.

이 스킬은 **[상태를 남긴다](https://www.aihero.dev/ai-coding-dictionary/stateful)**. 다른 집요한 질문 스킬은 모두 [세션](https://www.aihero.dev/ai-coding-dictionary/session)의 결과를 사용자의 머릿속에만 남기고, 이 스킬은 디스크에 파일을 남긴다. 용어가 정해지면 마지막에 모아서 쓰지 않고 정해지는 그 순간 `GLOSSARY.md`에 기록한다. 결정이 세 조건을 모두 통과하면 ADR(아키텍처 결정 기록)로 기록한다. 차이는 이것이 전부이고, 사람들이 이 스킬에서 겪는 문제 대부분도 여기서 나온다. 산출물이 실제 저장소의 실제 파일이라서, 있을 거라 생각한 곳에 없을 수도 있고, 여러 사람이 함께 쓰면 내용이 서로 어긋날 수도 있다.

## 언제 쓰나

`/grill-with-docs`를 입력해서 실행한다. 에이전트는 이 스킬을 스스로 실행하지 않는다.

저장소에서 변경을 시작할 때, 계획이 아직 흐릿하고 대상을 부르는 말도 정해지지 않았을 때 쓴다. 세션 하나로 끝내는 작업에 쓰는 도구다. 집요한 질문 스킬 가운데 어느 것을 쓸지는 지금 다루는 대상에 따라 다르다.

| 지금 있는 것 | 쓸 스킬 |
| --- | --- |
| 작업 디렉터리 안에서 전혀 일하고 있지 않다 | [grill-me](https://aihero.dev/skills-grill-me) |
| 저장소가 있고, 세션 하나로 정할 수 있는 변경이 있다 | `grill-with-docs` |
| 세션 하나로 다루기에 너무 큰 작업이 있다(새로 시작하는 프로젝트, 큰 기능) | [wayfinder](https://aihero.dev/skills-wayfinder) |
| 도메인 문서가 전혀 없는 저장소가 있고, 딱히 염두에 둔 기능은 없다 | 변경이 아니라 저장소 자체를 대상으로 `grill-with-docs` |
| 다른 사람의 머릿속에 있는 지식이 있어야 내릴 수 있는 결정이 있다 | [to-questionnaire](https://aihero.dev/skills-to-questionnaire) |

wayfinder와 나누는 기준은 세션 수다. 세션 하나로 끝나는 계획에는 `/grill-with-docs`를, 여러 세션에 걸친 계획에는 `/wayfinder`를 쓴다.

## 사전 준비

이 스킬은 저장소에 파일을 쓰므로, 파일을 써도 안전한 곳에서 실행해야 한다. 정해진 용어는 루트의 `GLOSSARY.md` 용어집에 들어간다. 루트의 `GLOSSARY-MAP.md`가 저장소를 다중 컨텍스트로 표시하고 있으면 해당 컨텍스트의 `GLOSSARY.md`에 들어간다. 결정은 `docs/adr/`에 들어간다. 둘 다 필요해질 때 만든다. 첫 용어나 결정이 분명해지기 전에는 아무것도 생기지 않으므로 미리 만들어 둘 것은 없다.

이 스킬에는 다른 스킬도 필요하다. 이 스킬의 `SKILL.md`는 그 스킬들에 작업을 넘기는 한 줄뿐이기 때문이다. 인터뷰는 [grilling](https://aihero.dev/skills-grilling)이 맡고, 기록은 [domain-modeling](https://aihero.dev/skills-domain-modeling)이 맡는다. `grill-with-docs`만 설치하면 동작하지 않는 스킬을 갖게 된다.

## 남는 기록

세션에서 나오는 결과는 다음과 같고, 모두 똑같이 남지는 않는다.

| 정해진 것 | 기록되는 곳 |
| --- | --- |
| 용어: 무언가를 가리키는 프로젝트 고유의 말 | `GLOSSARY.md`. 정해지는 순간 대화 도중에 기록한다 |
| 되돌리기 어렵고, 맥락 없이 보면 의외이고, 실제 트레이드오프의 결과인 결정 | `docs/adr/` 아래의 ADR |
| 그 밖에 정한 모든 것 | 대화. 그 밖의 어디에도 남지 않는다 |

사람들이 예상하지 못해 곤란을 겪는 것은 세 번째 줄이다. `GLOSSARY.md`는 용어집이고 일부러 용어집으로만 유지한다. 구현 세부 사항도, [스펙](https://www.aihero.dev/ai-coding-dictionary/spec)도, 임시 메모도 넣지 않는다. ADR은 세 조건을 모두 동시에 충족해야 쓰므로 대부분의 결정은 해당하지 않고, 대부분의 세션은 ADR을 하나도 만들지 않는다. 용어집이 더 정확해지고 ADR은 하나도 없는 세션은 설계대로 동작한 것이다. 하지만 그러면 합의한 내용 대부분은 그 합의를 한 [컨텍스트 창](https://www.aihero.dev/ai-coding-dictionary/context-window) 안에만 있다. 그 대화를 [비우지](https://www.aihero.dev/ai-coding-dictionary/clearing) 말고 같은 대화를 그대로 [to-spec](https://aihero.dev/skills-to-spec)에 넘긴다.

핵심은 용어집이다. 이 스킬이 실제로 만드는 것은 공통 언어(ubiquitous language, 팀과 코드가 함께 쓰는 도메인 용어)다. 프로젝트 고유의 말을 한 번 합의해 두면, 사용자와 에이전트와 동료가 그 말을 매번 다시 정의하는 수고를 들이지 않아도 된다. 다만 이것이 에이전트의 성능을 높여 준다는 데 모두가 동의하지는 않는다는 점도 말해 둘 만하다. 가장 설득력 있는 공개 반론은, 용어를 쓰든 그 용어를 평이한 영어로 풀어 쓰든 [모델](https://www.aihero.dev/ai-coding-dictionary/model)의 결과는 같고, 용어가 실제로 하는 일은 그 용어를 공유하는 사람들 사이의 의사소통을 간결하게 만드는 것이라는 주장이다. 이렇게 보더라도 용어집은 여전히 가치가 있다. 가치가 생기는 곳이 달라질 뿐이다.

## 자주 묻는 질문

**이 스킬과 `/wayfinder` 가운데 무엇을 써야 하나요?**
범위에 따라 정한다. 세션 하나로 정할 수 있는 일에는 이 스킬을 쓴다. 작업이 세션 하나로 다루기에 너무 크면 [wayfinder](https://aihero.dev/skills-wayfinder)를 쓴다. wayfinder는 먼저 작업 전체를 결정 [티켓](https://www.aihero.dev/ai-coding-dictionary/ticket)들로 이루어진 계획 이슈(map, 결정 목록과 하위 티켓을 묶는 상위 이슈)로 만든다. wayfinder는 더 느리고 더 많은 것을 다루며, 범위가 잘 정해진 기능에 wayfinder를 쓰는 것이 흔한 실수다. wayfinder가 이 스킬을 대신하지는 않는다. 계획 이슈 가운데 집요한 질문 세션에 맞는 부분에서는 그 세션으로 들어갈 수 있다.

**실행은 됐는데 `GLOSSARY.md`도 ADR도 생기지 않았어요.**
알려진 원인이 있다. 흔한 원인은 기록할 만한 것이 없었던 경우다. ADR은 세 조건을 모두 통과해야 하고, 새로운 용어가 나오지 않은 변경을 다룬 세션에는 정말로 쓸 것이 없다. 실제 버그도 있다. 이 스킬이 다른 오케스트레이션 계층 안에서 실행되면(스펙 주도 개발 래퍼, 멀티 에이전트 프레임워크, 다른 사람의 파이프라인에서 이 스킬을 한 단계로 호출하는 규칙), 인터뷰는 그대로 진행되는데 파일을 쓰는 부분은 아무 알림 없이 실행되지 않는다는 보고가 있다. 이 버그는 이슈로 등록되어 있고 아직 고쳐지지 않았다. 그런 환경에서 쓴다면, 세션의 결과를 믿기 전에 작업 디렉터리를 확인한다.

**질문을 한꺼번에 다 하고, 추천 답도 주지 않고, `GLOSSARY.md`는 한 번도 언급하지 않았어요.**
이 스킬이 의존하는 스킬들을 불러오지 못한 것이다. `SKILL.md`가 작업을 넘기는 한 줄뿐이라서, [grilling](https://aihero.dev/skills-grilling)과 [domain-modeling](https://aihero.dev/skills-domain-modeling)을 불러오지 않은 에이전트는 집요한 질문이 무엇인지 짐작으로 진행하고, 질문이 구분 없이 한꺼번에 쏟아진다. 일부만 불러온 경우가 더 헷갈린다. `grilling`은 불러오고 `domain-modeling`은 불러오지 않으면, 인터뷰는 잘 진행되는데 기록이 남지 않는다. 이 문제는 모델과 [추론 강도](https://www.aihero.dev/ai-coding-dictionary/effort)에 따라 나타나는 정도가 다르고, 이 스킬에서 가장 많이 보고되는 문제다. 의심되면 어떤 스킬을 불러왔는지 에이전트에게 직접 묻는다.

**다른 결정들은 모두 어디로 갔나요?**
대화 안에만 있다. 이 스킬에 아직 남아 있는 불만 가운데 가장 실질적인 것이다. 용어집은 스펙이 아니고, 대부분의 답은 ADR로 남길 만하지 않으며, 정해진 답 하나하나를 스펙, 티켓, 테스트까지 이어 주는 기록이 없다. 정확한 답(순서 보장, 하지 말아야 할 것을 정한 요구사항, 숫자 기본값)은 뒤 단계에서 더 느슨한 문장으로 바뀌고, 결과물은 완성된 것처럼 보이지만 실제로 정한 내용이 빠져 있을 수 있다. 지금 할 수 있는 대처는 세션을 유지한 채 그대로 [to-spec](https://aihero.dev/skills-to-spec)에 넘기는 것, 그리고 스펙이 답을 담았으리라 가정하지 말고 스펙을 자기 답과 대조하며 다시 읽는 것이다.

**문서가 전혀 없는 기존 저장소에도 쓸 수 있나요?**
그렇다. ADR도, 공통 언어도, 설계 원칙도 없는 코드베이스에는 이 스킬이 맞다. 실행하고 "내 저장소 문서화하는 것 좀 도와줘"라고 말한다. 커뮤니티에서는 `GLOSSARY.md`를 새로 만들거나 고칠 때 이 스킬을 [improve-codebase-architecture](https://aihero.dev/skills-improve-codebase-architecture)와 함께 쓴다. 사용자가 방향을 잡아 줘야 한다. 스킬은 코드를 읽고 발견한 것을 사용자에게 묻는다. 코드베이스에 이미 있는 말 가운데 어느 것이 맞는 말인지 정하는 사람은 사용자다.

**세션이 끝나면 무엇을 해야 하나요?**
이 스킬의 마지막 메시지는 다음 할 일을 정해 주지 않는 편이고, 이것은 알려진 미흡한 점이다. 주 흐름에서의 답은 같은 대화에서 [to-spec](https://aihero.dev/skills-to-spec)으로 넘어가는 것이다. 바로 구현할 수 있을 만큼 변경이 작다면 대신 [implement](https://aihero.dev/skills-implement)로 바로 넘어간다.

**이름은 왜 이런가요?**
이 이름에 만족하는 사람이 없다. 동작을 더 정직하게 설명하는 `grill-domain-model`로 이름을 바꾸자는 제안이 열려 있다. 그 제안은 진전이 없다. 이름이 바뀌면 문서 페이지도 함께 옮겨지고 URL이 바뀐다.

## 잘 동작하고 있다는 신호

- `GLOSSARY.md`가 마지막에 한꺼번에 생기지 않고 세션 *도중에* 용어 하나씩 바뀐다.
- 용어집이 순수한 용어 목록(프로젝트 고유의 말과 간결하고 정확한 정의)으로 읽히고, 구현 세부 사항이나 스펙 같은 문장이 없다.
- 코드베이스에서 답을 찾을 수 있는 질문은 사용자에게 묻지 않고 코드베이스를 읽어 답한다.
- ADR은 적거나 하나도 없고, 나온 ADR은 처음부터 다시 따져야 한다면 곤란할 결정들이다.
- 사용자가 쓴 말이 기존 용어집의 정의와 다르면 그 말에 이의를 제기한다.

## 전체 흐름에서의 위치

`grill-with-docs`는 주 구현 흐름의 첫 단계다.

```txt
grill-with-docs → to-spec → to-tickets → implement → code-review → retro
```

무엇이든 스펙으로 적기 전에 쓴다. 이 스킬은 공동 이해와 정해진 용어를 만들고, [to-spec](https://aihero.dev/skills-to-spec)은 사용자를 다시 인터뷰하지 않고 그것을 스펙으로 정리한다. 가까운 관련 스킬은 [grill-me](https://aihero.dev/skills-grill-me)와 [domain-modeling](https://aihero.dev/skills-domain-modeling)이다. grill-me는 저장소도 파일도 없이 같은 인터뷰를 하고, domain-modeling은 이 스킬이 실행하는 용어집과 ADR 작성 규칙이다. 둘 다 [grilling](https://aihero.dev/skills-grilling) 기본 스킬 위에서 동작한다. 이 스킬보다 앞 단계에서는 [wayfinder](https://aihero.dev/skills-wayfinder)가 세션 하나로 다루기에 너무 큰 작업을 계획 이슈로 만들고, 계획 이슈의 일부를 이 스킬에 다시 넘길 수 있다. 어떤 스킬이나 흐름이 맞는지 모르겠으면 [ask-matt](https://aihero.dev/skills-ask-matt)가 알려 준다.
