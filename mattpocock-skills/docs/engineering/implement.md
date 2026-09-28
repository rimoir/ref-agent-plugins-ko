## 하는 일

`implement`는 이미 결정된 작업을 구현한다. [티켓](https://www.aihero.dev/ai-coding-dictionary/ticket), [스펙](https://www.aihero.dev/ai-coding-dictionary/spec), 또는 방금 대화에서 합의한 계획을 넘겨주면, 코드를 쓰고, 교체 지점(seam, 그 자리의 코드를 고치지 않고 동작을 바꿔 끼울 수 있는 위치이자 모듈 인터페이스가 놓이는 곳)에서 [tdd](https://aihero.dev/skills-tdd)를 진행하고, 작업하면서 타입 검사를 하고, 마지막에 [code-review](https://aihero.dev/skills-code-review)를 실행한 뒤 현재 브랜치에 커밋한다.

계획을 다시 논의하지 않는다. 인터뷰도, 확인 질문 라운드도, 다른 방식 제안도 없다. 앞 단계에서 정한 것이 곧 입력이고, 이 스킬이 하는 일은 그것을 커밋으로 만드는 것뿐이다. 새 [에이전트](https://www.aihero.dev/ai-coding-dictionary/agent)에게 "이거 만들어 줘"라고 입력하는 것과 다른 점이 바로 이것이다. 그런 에이전트는 만들면서 작업 설계를 서슴없이 바꾼다.

## 언제 쓰나

`/implement`를 입력해서 실행한다. 에이전트는 이 스킬을 스스로 실행하지 않는다. `disable-model-invocation: true`가 설정된 채로 배포되므로 다른 스킬도 이 스킬을 호출할 수 없다. [ask-matt](https://aihero.dev/skills-ask-matt)이나 [to-tickets](https://aihero.dev/skills-to-tickets)가 "그다음 티켓마다 `/implement`"라고 하는 곳은 모두 사용자에게 하는 지시이지, 에이전트가 시키지 않아도 하는 일이 아니다.

작업이 지금 어디에 있는지를 보고 이 스킬이 맞는지 정한다.

| 작업이 있는 곳 | 쓸 것 |
| --- | --- |
| 트래커의 티켓 | `/implement #42`. [세션](https://www.aihero.dev/ai-coding-dictionary/session) 하나에 티켓 하나를 맡기고, 티켓 사이에는 [컨텍스트를 비운다](https://www.aihero.dev/ai-coding-dictionary/clearing) |
| 아직 나누지 않은 스펙이고, 구현이 여러 세션에 걸친다 | 먼저 [to-tickets](https://aihero.dev/skills-to-tickets), 그다음 티켓마다 `/implement` |
| 스펙이고, 구현 규모가 작다 | 스펙을 넘겨 바로 `/implement` |
| 방금 나눈 대화에만 있고, 여전히 작다 | 같은 창에서 바로 `/implement` |
| 아직 어디에도 적혀 있지 않다 | [grill-with-docs](https://aihero.dev/skills-grill-with-docs), 코드베이스가 없으면 [grill-me](https://aihero.dev/skills-grill-me) |
| 스펙 없이 테스트 먼저 만들고 싶은 구체적인 동작 하나 | 바로 [tdd](https://aihero.dev/skills-tdd) |
| 이미 구현했고 검토받고 싶다 | 바로 [code-review](https://aihero.dev/skills-code-review) |

같은 세션에서 쓰는 경우를 따로 말하는 이유는 스킬 첫 줄이 이 경우를 다루지 않기 때문이다. `SKILL.md`에는 "스펙이나 티켓"이라고 되어 있어서, [모델](https://www.aihero.dev/ai-coding-dictionary/model)은 있지도 않은 파일을 찾으러 나서기 쉽다. 계획이 대화에만 있다면 스킬을 호출할 때 그렇다고 말한다.

## 사전 준비

`implement`는 지금 있는 브랜치에 커밋한다. 브랜치를 새로 만들지 않고, 묻지도 않는다. 시작하기 전에 작업을 올릴 브랜치에 있는지 확인한다.

티켓이 [to-tickets](https://aihero.dev/skills-to-tickets)에서 나왔다면, 그 티켓이 있는 트래커는 [setup-matt-pocock-skills](https://aihero.dev/skills-setup-matt-pocock-skills)로 설정한 것이다. `code-review`는 마무리 단계에서 같은 설정을 읽어 원래 스펙을 찾는다.

## 한 번 실행하면 하는 일

한 번 실행하면 다음 순서로 진행한다.

1. 티켓이나 스펙을 읽고 교체 지점을 파악한다.
2. 미리 합의한 교체 지점에서 [tdd](https://aihero.dev/skills-tdd)를 진행한다. 실패 → 통과 슬라이스를 한 번에 하나씩 처리한다.
3. 타입 검사를 자주 하고, 진행하면서 단일 테스트 파일을 실행한다.
4. 마지막에 전체 테스트 스위트를 한 번 실행한다.
5. [code-review](https://aihero.dev/skills-code-review)를 실행한 뒤 현재 브랜치에 커밋한다.

한 번 실행에 티켓 하나를 처리한다. [to-tickets](https://aihero.dev/skills-to-tickets)가 만드는 티켓은 새 [컨텍스트 창](https://www.aihero.dev/ai-coding-dictionary/context-window) 하나에 들어가는 크기의 종단 간 최소 구현(tracer bullet, 모든 계층을 끝까지 얇게 관통해 바로 확인할 수 있는 작은 구현) 수직 슬라이스다. 그래서 의도한 작업 순서는 컨텍스트를 비우고, 티켓 하나를 구현하고, 커밋하고, 다시 비우는 것이다. 티켓마다 필요한 내용이 그 안에 다 들어 있으므로 앞 티켓의 컨텍스트는 버려도 된다.

## 미리 합의한 교체 지점

이 스킬의 바탕이 되는 개념은 **교체 지점**(seam)이다. 안쪽을 건드리지 않고 동작을 관찰하는 공개된 위치를 말한다. 테스트는 교체 지점에 둔다. 코드를 쓰기 전에 합의한 교체 지점에서 작업해야 테스트가 오래 유지된다. 그 아래의 구현을 다시 써도 테스트는 바뀌지 않기 때문이다.

"미리 합의한"이라는 말은 실제로 중요한 조건이고, 이 스킬에서 가장 약한 부분이기도 하다. `implement` 안에는 교체 지점을 합의하는 단계가 없다. 교체 지점을 묻는 스킬은 `tdd`이고, `tdd`는 확인받지 않은 교체 지점에는 테스트를 쓰지 않는다. 그래서 실제로 합의는 앞 단계의 스펙에서 이루어지거나, 실행을 시작하고 처음 주고받는 대화에서 이루어진다. 어디에서도 합의하지 않으면 이 전제 조건은 전혀 작동하지 않고, 실행은 드러나지 않게 "그냥 코드를 쓰는" 일이 된다. 스펙에 교체 지점을 적어 두면 이런 일을 막을 수 있다.

## 자주 묻는 질문

**실행은 끝났는데 티켓이 아직 열려 있고 인수 기준도 체크되지 않았어요.**

그게 맞고, 예상된 동작이다. `implement`에는 완료 처리 단계가 없다. 커밋에서 끝나고 작업 항목은 전혀 건드리지 않는다. GitHub Issues와 로컬 마크다운 트래커 양쪽에서 확인했으므로 트래커 연동 문제가 아니다. `code-review`가 찾아낸 문제를 처리하지도 않고, 원래 이슈의 `- [ ]` 체크박스에 표시하지도 않는다. 티켓을 닫고 인수 기준을 맞춰 보는 일은 직접 한다. 의존 관계로 이어진 티켓들에서 이 문제가 가장 크다. `to-tickets`는 진행 가능 목록(frontier)을 선행 티켓이 모두 닫힌 티켓으로 정의하기 때문이다. 아무것도 닫히지 않으면 어떤 티켓도 막힘이 풀린 것으로 보이지 않는다.

**티켓 전체를 한꺼번에 넘기거나 여러 개를 병렬로 실행할 수 있나요?**

안 된다. 한 번 호출에 티켓 하나다. 티켓 대기열 전체를 한꺼번에 배정하는 기능과 [서브에이전트](https://www.aihero.dev/ai-coding-dictionary/subagent)로 나눠 실행하는 기능은 여러 번 요청되었지만 둘 다 없다. 체크아웃 하나에서 `/implement` 세션 여러 개를 나란히 실행하는 것은 지원되지 않는 정도를 넘어 더 나쁘다. 한 현장 보고에 따르면 이슈 세 개를 처리한 한나절 동안, 한 세션의 `git commit --amend`가 다른 세션의 커밋에 적용되었고, `refs/stash`에서 stash 하나가 사라졌고, 커밋이 엉뚱한 브랜치에 올라갔다. 세션들은 작업 디렉터리 하나, 인덱스 하나, HEAD 하나를 함께 쓴다. 커뮤니티에서 쓰는 우회 방법은 Git 워크트리다. 단 `refs/stash`는 워크트리끼리도 공유되므로 워크트리만으로는 stash 문제가 해결되지 않는다. 지금 병렬로 실행하고 싶다면 직접 구성해야 한다.

**커밋하는 대신 풀 리퀘스트를 열 수 있나요?**

기본 기능으로는 없다. 현재 브랜치에 바로 커밋하는데, 이것이 너무 성급하다고 느끼는 사람이 여럿 있다. 코드가 동작하는지 확인할 기회를 갖기 전에 코드가 들어가기 때문이다. 설정 플래그도 없고 PR 모드도 없다. 사람들은 호출할 때 지시하거나("브랜치에 커밋하고 PR을 열어 줘") 로컬에 있는 스킬 사본을 고쳐서 이 동작을 바꾼다.

**`code-review`가 변경 사항을 볼 수 없다고 해요.**

`code-review`는 `git diff <fixed-point>...HEAD`를 리뷰하므로 스테이징된 변경과 작업 트리의 변경은 포함하지 않는다. `implement`는 커밋하기 전에 code-review를 실행하므로, 중간 커밋이 이미 있지 않다면 그 diff에는 리뷰할 것이 없다. 여러 사람이 보고했고 두 스킬 모두 아직 고쳐지지 않았다. 먼저 커밋한 다음, 브랜치를 만든 지점을 기준으로 리뷰한다.

이와 별개로, 일부러 실행 안에서 리뷰하지 않으려는 사람도 있다. 방금 코드를 쓴 에이전트가 그 코드를 리뷰하면 자기 해법 쪽으로 치우치기 때문이다. 새 세션에서 기준점을 두고 [code-review](https://aihero.dev/skills-code-review)를 실행하는 것도 정당한 대안이다. code-review가 두 축을 서로 다른 서브에이전트에서 실행하는 이유도 같다.

**티켓 하나에 토큰을 150k나 썼어요. 제가 잘못 쓰고 있는 건가요?**

스킬을 잘못 썼다기보다는 티켓이 너무 클 가능성이 크다. 한 번 실행하면 코드베이스 탐색, 교체 지점마다 실패 → 통과 루프, 전체 테스트 스위트, 리뷰를 모두 하므로, 간단하지 않은 티켓이 100k [토큰](https://www.aihero.dev/ai-coding-dictionary/token)을 넘는 것은 정상이지 무언가 고장 났다는 신호가 아니다. 조절할 곳은 앞 단계다. [to-tickets](https://aihero.dev/skills-to-tickets)에서 티켓 크기를 알맞게 정해 티켓마다 새 컨텍스트 창 하나에 들어가게 한다. 티켓 하나가 계속 한도를 넘으면 [추론 강도](https://www.aihero.dev/ai-coding-dictionary/effort) 수준을 올리지 말고 티켓을 나눈다.

**새 세션에서 `/implement #2`를 실행했더니 전혀 관계없는 작업을 했어요.**

`#2`는 에이전트가 볼 수 있는 번호 목록이라면 무엇에든 맞춰 해석된다. 새 세션에서는 설정된 트래커가 아니라 할 일 파일, 체크리스트, 다른 작업 목록일 수 있다. 에이전트는 확실하지 않을 때 멈추지 않고 확신을 가지고 해석하므로, 작업이 시작되기 전까지는 실수가 드러나지 않는다. 이슈 URL이나 `owner/repo#2` 같은 전체 참조를 넘기고, 시작하기 전에 제목을 다시 말해 확인하게 한다.

## 잘 동작하고 있다는 신호

- 세션이 무엇을 만들지 묻는 대신, 티켓이나 스펙을 읽고 무엇을 만들지 다시 정리하면서 시작한다.
- diff에 테스트가 나타나는 것만이 아니라, 실행 기록에서 실제 `/tdd` 호출을 볼 수 있다.
- 실행 중에 타입 검사와 단일 테스트 파일 실행이 반복되고, 전체 테스트 스위트는 끝 무렵에 한 번 실행된다.
- 계속하라고 재촉하지 않아도 실행이 현재 브랜치 커밋까지 간다.
- diff는 티켓 하나만큼의 변경이다. 여러 티켓을 한꺼번에 담은 것이 아니라 모든 계층을 관통하는 수직 슬라이스 하나다.

## 전체 흐름에서의 위치

`implement`는 주 흐름에서 끝에서 두 번째인 구현 단계다.

```txt
grill-with-docs → to-spec → to-tickets → implement → code-review
```

관련 스킬은 [to-tickets](https://aihero.dev/skills-to-tickets), [tdd](https://aihero.dev/skills-tdd), [code-review](https://aihero.dev/skills-code-review)다. to-tickets는 implement가 받아서 쓰는 티켓을 만들고, 티켓 순서를 정하는 차단 관계를 적는다. implement는 교체 지점마다 안에서 tdd를 진행하고, 커밋하기 전에 code-review를 실행한다. implement는 계획 스킬들의 다음 단계에 있고 그 결과를 믿는다. 넘겨받은 작업의 형태를 다시 검증하지 않으므로, 구조가 잘못된 계획 이슈(map, 결정 목록과 하위 티켓을 묶는 상위 이슈)나 계층별로 나뉜 티켓도 적힌 그대로 구현한다.

이렇게 앞 단계를 믿기 때문에 [wayfinder](https://aihero.dev/skills-wayfinder)는 계획 이슈를 곧바로 `implement`로 넘기지 않고 [to-spec](https://aihero.dev/skills-to-spec)에서 주 흐름에 합류한다. 작업 규모가 실제로 작다고 드러났을 때만 계획 이슈에서 바로 `implement`로 간다.

지금 어느 흐름에 있는지 모를 때는 스킬 전체의 안내 스킬(router, 다른 스킬과 각각 쓸 때를 알려 주는 스킬)인 [ask-matt](https://aihero.dev/skills-ask-matt)을 쓴다.
