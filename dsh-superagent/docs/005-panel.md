# 005 패널

에이전트를 감독하려면 DeepSeek Harness Web 사이드바에서 **Superagent**를 연다. 패널은 사람이 필요한 작업을 먼저 두고, 그다음 시스템 상태와 이력을 둔다. 이 문서는 [000 철학](000-philosophy.md)부터 [004 프롬프트](004-prompts.md)까지를 바탕으로 한다.

## 세 가지 질문

패널을 열면 세 질문에 이 순서로 답한다.

1. 지금 내가 할 일이 있나?
2. 시스템이 건강하고 맞는 일을 하고 있나?
3. 작업 하나가 Trigger에서 Eval을 거쳐 Ticket까지 어떤 이력을 거쳤나?

## 탭

탭은 작업 흐름을 따른다. **Overview**, **Source**, **Trigger**, **Eval**, **Execution**, **Settings**다. 저장소와 계정 설정이 성공하기 전까지 Overview는 빠진 것을 보여 주고 해당 설정으로 링크한다.

| 탭 | 보여 주는 것 |
| --- | --- |
| Overview | 조치가 필요한 Ticket, 시스템 문제, 지난 24시간의 활동 수, Executor 부하. 블록마다 자세한 페이지로 링크한다 |
| Source | Source 상태, 설정 문제, 0이 아닌 수. 걸러진 Trigger와 버려진 메시지는 Overview와 같은 24시간 범위를 덮는다 |
| Trigger | Subscribed, Evaluating, New Triggers in 24 h, All Threads로 거른 Thread. Thread마다 최신순 Trigger, Decision, Subscription을 보여 준다 |
| Eval | 이유와 맞은 규칙이 붙은 Decision |
| Execution | Executor 상태, Pause processing, 그리고 Open, Pending, Working, Waiting for a Trigger, Ended로 거른 Ticket. Ticket 상세는 조치, 권한, 기다리는 Input, Subscription, Assignment를 보여 준다 |
| Settings | Sources, Eval, Execution, Prompts, Deployment. 묶음마다 저장 이력이 있다 |

### 개별 기록 읽기

버려진 메시지는 자기 Ticket으로, Ticket이 없으면 자기 Thread로 링크한다. Source 페이지는 그 대화가 사라졌는지, Source가 그것을 더는 듣지 않는지 설명한다.

아직 Executor가 맡고 있는 사람의 follow-up은 Eval 없이 **Delivered to Ticket**으로 표시된다. Thread는 돌려준 이유와 맥락용 Subscription도 보여 준다. **Evaluate again**은 그 follow-up을 Eval로 보내거나, 유효한 판단이 없는 Trigger를 다시 시도한다. Source가 거른 Trigger, unavailable Eval, stop이 아닌 Decision도 Executor 확인 응답도 없는 전달된 메시지가 그렇다.

Ticket 상세는 시작한 Trigger, Decision과 이유, 범위, Policy 버전을 보여 준다. Assignment와 부차적인 상세는 당장의 조치 아래에 접혀 있다. **Retry**는 Input 전달이 실패했거나, blocked나 failed Report 뒤에 Ticket이 사람을 기다릴 때 쓸 수 있다. 끝난 Ticket은 **Pull request merged**나 **Stopped by a person** 같은 결과를 보여 준다.

## 설정 묶음

- **Sources:** Source마다 카드 하나. 스위치, 필드, 검증한 계정 사실이 있다. GitHub는 새 Issue, pull request, 댓글, 기본 브랜치 CI의 receive-all 스위치도 준다. 폴링과 읽기 한도는 Advanced 아래에 있다.
- **Eval:** Policy 버전과 규칙, 그 뒤로 **On each Source**와 Eval 설정. Source 탭마다 허용 목록, 멤버 동기화, 입장 표, 봇 목록이 있다. 동기화는 시작할 때와 **Sync now**를 누를 때 돈다. 입장 표는 받는 범위, 보낸 사람의 소속, 메시지가 에이전트를 부르는지를 구분한다. Eval 설정에서는 accept 모드, timeout, 판정 모델을 고른다.
- **Execution:** 워커 모델, 동시성, 디렉터리 루트, prepare 명령, 막힌 명령. 쓸 수 있는 변수를 누르면 prepare 명령에 넣어 준다.
- **Prompts:** **Edit**은 팀 섹션, 내장 부분, 스킬을 고친다. **Full prompt**는 조립된 글을 보여 주고 저장된 글이나 기본값과 비교한다. **History**는 버전을 나열한다. 고친 내장 부분은 changed로 표시되고 초기화할 수 있다. 템플릿은 필요한 placeholder를 나열한다.

  덮어쓴 기본값을 바꾸는 업그레이드는 그 부분에 **Default updated**(默认内容已更新) 표시를 한다. 패널은 팀의 글 위에서 옛 기본값과 새 기본값을 비교한다. 옛 기본값이 기록되지 않았으면 대신 팀의 글과 새 기본값을 비교한다. **Keep my text**나 **Use the new default**를 고른다. 제거된 부분의 덮어쓰기는 탭 막대 아래에 나열되고 다음 저장 때 빠진다.
- **Deployment:** **Check again**이 붙은 시작 문제, 상태 디렉터리, 머신 한도. 저장한 한도는 재시작 없이 적용된다. DeepSeek Harness Plugin Manager도 같은 페이지를 보여 준다.

## 검색

헤더 검색은 글, id, Feishu 메시지 id, GitHub 댓글 URL 같은 저장된 링크로 Trigger를 찾는다. 원래 메시지에 없던 Feishu 링크는 현재 프로세스가 사는 동안 호스트가 그것을 읽은 뒤에야 검색된다.

검색은 `#12`나 GitHub URL 같은 참조로 Thread를 찾고, 제목이나 맞는 Thread로 Ticket을 찾기도 한다.

## 원칙

1. **중요한 것에 집중한다.** 모든 요소는 세 질문 가운데 하나에 답하고, 그러지 못하면 없앤다. 숫자는 감독자가 할 일을 바꿀 때만 나온다.
2. **정확한 정의.** 범주는 확인할 수 있는 정의를 갖고, 서로 겹치지 않고, 모든 경우를 덮는다. Ticket 단계가 그렇다. 라벨은 내부 상태 코드가 아니라 그 행이 누구를 기다리고 무엇이 필요한지 말한다.
3. **개념 하나에 자리 하나.** Source 상태는 Source에, Thread와 Trigger는 Trigger에, Decision은 Eval에, Ticket은 Execution에 둔다. 설정은 그것이 정하는 개념으로 묶는다. Overview는 이 페이지들을 요약하고 링크할 뿐 또 하나의 상세 화면이 되지 않는다.
4. **도메인 구조.** 패널은 도메인 용어를 쓴다. 내부 식별자는 접힌 상세에만 나오고, 풀 수 있으면 식별자 대신 이름을 쓴다.
5. **정직한 상태.** 수는 그것이 링크하는 목록의 길이와 같고, 어떤 상태도 다른 사실과 모순되지 않는다.
6. **기본은 조용하게.** 건강한 상태는 자리를 더 차지하지 않는다. 문제는 조치할 수 있어야 한다. 한 번 난 네트워크 오류로는 부족하다. 사람이 필요한 행은 조치를 바로 제공한다. 페이지 설명은 한 문장으로 두고 더 자세한 것은 (?) 툴팁에 넣는다. 파괴적인 조치는 확인을 받는다.
7. **일관된 컨트롤.** DeepSeek Harness 디자인 토큰과 컨트롤 동작을 쓴다. 같은 정보는 패널 어디서나 같아 보여야 한다. 설정 블록마다 저장 막대는 하나이고, 변경이 있거나, 저장이 돌거나, 저장이 실패했을 때만 보인다.
