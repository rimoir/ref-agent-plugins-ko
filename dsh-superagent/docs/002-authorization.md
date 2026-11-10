# 002 권한 부여

권한 부여는 누가 작업을 시작할 수 있고 그 작업이 무엇을 담을 수 있는지 정한다. 이 문서는 [001 도메인 모델](001-domain.md)을 바탕으로 한다.

허용 목록, 규칙, Mandate는 호스트가 강제한다. 메시지, 댓글, 인용한 문서는 결정의 입력일 뿐이고 그 권한을 바꿀 수 없다.

## Trigger의 두 경로

### Eval: 작업을 시작할지 정하기

Source는 메시지가 에이전트를 부르는지 기록한다. 봇이나 에이전트 계정을 멘션하면 `mention`, 다이렉트 메시지면 `direct`다. 게이트는 보낸 사람과 Source의 Policy를 확인한다.

- 허용된 사람이 에이전트를 부르면 explicit 요청이 된다.
- Ticket이 있는 Thread에서 사람이 이어 쓴 메시지는 아래 규칙을 따른다.
- 그 밖의 사람 메시지는 받은 범위의 입장 표를 쓴다.
- Source의 봇 목록에 있는 봇은 inferred 후보를 만들 수 있지만 explicit 요청은 만들 수 없다. 다른 봇은 들이지 않는다.

### Subscription: 기존 작업 이어 가기

구독한 Thread의 모든 메시지는 봇과 CI의 메시지까지 포함해 구독 중인 Ticket에 맥락으로 닿는다. 이 전달은 게이트를 건너뛰고 새 권한을 주지 않는다. 각 Ticket은 여전히 자기 Mandate의 제한을 받는다.

Ticket 자신의 Thread에 온 사람의 메시지는 그 Ticket의 Executor가 판단한다. 메인 Session이 메시지를 Ticket에 붙일 때도 같다. Executor가 메시지를 맡는 동안 그 메시지는 Eval을 거치지 않고 Decision도 받지 않는다. 각 Executor는 요청을 자기 Ticket의 범위 안에서 처리하거나, 다른 곳으로 라우팅되도록 돌려준다.

맡음은 Ticket이 살아 있는 동안 이어지고, 사람이 Subscription을 끊어도 이어진다. 사람이 멈추지 않았고 그 메시지가 재개를 기다리는 끝난 Ticket에도 적용된다.

메인 Session은 follow-up 알림을 받는다. Executor가 메시지를 맡는 동안 메인 Session은 그 사람의 요청에 따라 작업을 멈추는 것만 할 수 있다. accept, attach, ignore, requeue는 거부된다. stop도 아래에 설명한 follow-up 강도로 게이트를 거친다.

### follow-up 돌려주기와 놓아주기

메시지가 Ticket의 범위를 넘는 일을 부탁하거나 다른 Ticket에 속하면 Executor는 그것을 한 번 돌려준다. Ticket은 Subscription을 유지한다. 붙은 Thread가 관련 없으면 Executor는 거기서 맡은 메시지를 돌려준다.

메시지는 그것을 맡은 Ticket이 하나도 남지 않았을 때만 새 Eval로 간다. 그 후보에는 Executor들의 이유가 들어간다. 게이트는 그것을 그 Thread의 평범한 메시지로 판단하고, 메인 Session은 accept하거나, 다른 곳에 붙이거나, ignore할 수 있다. 봇 메시지나 사람이 이미 Eval로 보낸 메시지처럼 Ticket이 맡지 않은 메시지를 돌려주면 아무것도 줄 세우지 않는다.

Ticket이 끝나면 Executor가 읽지 않았거나 맡지 않은 follow-up을 놓아준다. Executor에 한 번도 전달되지 않은 메시지, 그리고 마지막 보고나 턴 끝 뒤에 전달된 메시지가 여기에 든다. 단 Executor가 확인 응답도, 답도, 돌려주기도 하지 않았어야 한다. 놓아준 메시지는 다른 Ticket이 맡지 않으면 각각 Eval로 간다. stop은 멈춘 Ticket의 작업만 끝낸다.

멈춘 Ticket은 다른 Ticket이 돌려주지 않는 한 자기 stop 메시지를 다시 Eval로 보내지 않는다. 그것을 멈춘 메인 Session은 메시지의 나머지를 새 작업으로 accept할 수 있다.

사람은 패널에서 맡긴 follow-up을 Eval로 보낼 수 있다. 메인 Session이 그것을 다시 살아 있는 Ticket에 붙이면 Executor가 다시 받는다. 메시지를 덮는 유효한 판단이 없을 때도 패널은 재판정을 제안한다.

### 맥락용 Subscription

Executor는 다른 Issue나 pull request처럼 관련된 Thread를 맥락용으로 따라갈 수 있다. 그 메시지는 Ticket에 닿지만 권한도 follow-up 강도도 주지 않는다. 메인 Session이 그 Thread의 메시지를 붙이지 않는 한, 거기 온 사람의 메시지는 끝난 Ticket을 재개하지 않는다. 다른 작업에 관해 메인 Session이 보내는 노트도 맥락일 뿐이다.

어느 Ticket에도 닿지 않은 사람 메시지는 Eval 경로를 탄다. 사람이 Ticket을 멈춘 Thread도 여기에 든다. 봇 메시지는 구독 중인 Ticket으로 전달되는 것과 따로 이 경로를 탄다.

## 강도

| 강도 | 경우 |
| --- | --- |
| explicit | 목록에 있는 사람이 에이전트를 부르거나 이미 Ticket이 있는 Thread에서 이어 쓴다. 입장 표의 칸이 explicit 요청으로 설정돼 있다 |
| inferred | 목록에 없는 사람이 Ticket이 있는 Thread에서 이어 쓴다(그 사람의 입장 표 칸이 explicit이면 예외). 입장 표의 칸이 inferred 후보로 설정돼 있다. Source의 봇 목록에 있는 봇이 에이전트를 부르거나, Source가 모든 메시지를 받는 곳에 메시지를 올린다 |
| not admitted | 그 밖의 봇 메시지, 입장 표가 ignore하는 모든 것, accept 모드가 `off`일 때의 모든 inferred 경우 |

목록에 없는 사람이라도 입장 칸이 explicit이면 Ticket이 있는 Thread에서도 그것이 앞서고 모든 accept 모드에서 통한다. 그렇지 않으면 그 사람의 follow-up은 inferred이고 `off` 모드에서는 들이지 않는다. 맥락용으로만 따라가는 Thread의 메시지는 follow-up 강도 대신 입장 표를 쓴다.

## 입장

각 Source의 Policy에는 입장 표가 있다. 표의 행은 받는 범위다.

- **Feishu:** 설정한 각 채팅, 봇이 멘션을 받는 다른 채팅, 다이렉트 메시지. 다른 채팅은 Feishu 카드에서 **其他群**을 **仅 @**로 설정했을 때만 받는다.
- **GitHub:** 새 Issue, 새 pull request, 댓글, 기본 브랜치의 CI.

행 하나에는 칸이 최대 세 개 있다. 각 칸은 메시지가 explicit 요청이 될지, inferred 후보가 될지, 아무것도 아닐지 정한다.

| 칸 | 선택지 | 기본값 |
| --- | --- | --- |
| 목록에 있음, 에이전트를 부르지 않음 | inferred, ignore | inferred |
| 목록에 없음, 에이전트를 부름 | explicit, inferred, ignore | ignore |
| 목록에 없음, 에이전트를 부르지 않음 | inferred, ignore | ignore |

부르지 않은 메시지의 칸은 Source가 모든 메시지를 받는 곳에서만 쓸 수 있다. **全部消息**로 설정한 Feishu 채팅이나 receive-all 스위치를 켠 GitHub 범위가 그렇다. CI 결과에는 보낸 사람이 없어서 그 행에는 마지막 칸만 있다. 봇 메시지는 이 칸 대신 봇 목록을 쓴다.

목록에 없고 부른 경우의 칸을 explicit으로 두면 그 범위의 누구나 에이전트를 멘션해 작업을 부탁할 수 있다. 전용 지원 채팅에 쓸모 있을 수 있다. inferred 후보는 여전히 accept 모드에 달려 있다. follow-up은 보통 이 표를 건너뛰지만, explicit 칸은 그래도 explicit 강도를 준다.

입장 표는 Policy 버전의 일부다. 칸을 약하게 바꿔도 그 칸으로 accept된 open Ticket이 바로 멈추지는 않는다. 다만 재개 전에 다시 검증할 때 Mandate가 철회될 수 있다.

### 봇과 자동 리뷰어

호스트는 GitHub App, `[bot]`으로 끝나는 로그인, Feishu 봇을 봇으로 알아본다. Source는 `dependabot[bot]`처럼 메시지가 inferred 후보가 될 수 있는 봇을 나열할 수 있다. 그 봇은 에이전트를 부르거나 모든 메시지를 받는 범위에 글을 올려야 한다. explicit 요청을 하거나 Ticket을 멈출 수는 없다.

평범한 계정을 쓰는 자동 리뷰어는 호스트에게 사람으로 보인다. 그 댓글은 구독 중인 Ticket에 닿고 follow-up 알림을 만든다. 팀 프롬프트 글이 그런 계정을 자동 리뷰어라고 밝혀야 한다.

## 후보 라우팅

메인 Session은 `orchestrator_route`로 explicit 후보를 라우팅한다. 호출 한 번에 accept, attach, stop, ignore 결정을 여럿 담을 수 있다. 항목마다 따로 처리하므로 거부된 항목이나 빠진 필드가 다른 항목을 막지 않는다.

inferred 후보는 보통 판정을 끝까지 거쳐야 한다. 지름길이 하나 있다. 그냥 잡담이나 관련 없는 논의처럼 카드가 켜진 규칙 어디에도 걸리지 않는 게 분명하면 메인 Session이 바로 ignore할 수 있다. 이것을 규칙 판정과 구분하려고 Decision에 `ignoredFromCard`를 기록한다. 메인 Session은 켜진 규칙을 자기 Policy 프롬프트 섹션에서 읽는다.

inferred 후보를 accept하려면 언제나 판정이 필요하다. 바로 accept하면 게이트가 explicit으로 들이지 않은 Trigger는 거부된다.

## accept 모드와 규칙

accept 모드는 Policy의 일부다.

| 모드 | 효과 |
| --- | --- |
| `off` | inferred인 것은 후보가 되지 않는다. 부르지 않은 메시지, 봇의 메시지, 목록에 없는 사람의 follow-up이 그렇다 |
| `observe` (기본값) | inferred 후보를 판정한다. 긍정 판정은 "would accept" 표시를 단 ignore로 기록되고 아무것도 accept되지 않는다 |
| `auto` | inferred 후보의 긍정 판정이 그것을 accept한다 |

explicit 요청은 모든 모드에서 통한다. `observe`로 시작하고, 기록된 Decision을 검토한 뒤 `auto`로 바꾼다. 판정마다 켜진 규칙을 맞든 안 맞든 정확히 한 번씩 판단한다. 능동 accept에는 맞는 규칙이 하나 이상 있어야 한다.

각 규칙은 능동 작업의 한 종류를 설명한다. Ticket의 Mandate는 맞은 규칙을 기록하고, 그 Executor는 규칙의 이름과 지시를 받는다.

그 Ticket에서는 규칙의 절차와 소통 요구가 기본값보다 앞선다. 침묵 규칙은 확인 응답을 막을 수 있고, 리뷰 규칙은 병합 전에 필요한 리뷰어와 승인을 지정할 수 있다. 모든 Ticket에 적용할 요구는 대신 팀 프롬프트 섹션에 둔다.

## Policy 버전

규칙, accept 모드, 각 Source의 Policy가 Policy 버전을 이룬다. 모든 Mandate는 자기가 accept된 버전을 기록한다.

버전이 바뀌면 돌고 있는 Eval을 버리고 그 Trigger를 다시 줄 세운다. 영향을 받는 살아 있는 Ticket마다 policy-changed Input도 보낸다. 그 Input은 다음 가운데 무엇인지 설명한다.

- 맞은 규칙이 바뀌었다(새 글 포함). 또는 더는 적용되지 않는다.
- 요청자가 더는 작업을 시작할 수 없다.
- 예를 들어 모드가 `auto`에서 바뀌어 능동 작업을 더는 accept하지 않는다.

영향받지 않은 Ticket은 알림을 받지 않는다. 변경은 살아 있는 Ticket의 Mandate를 바로 철회하지 않는다.

Source 설정은 Policy와 따로다. 무엇이 시스템에 들어오는지 정한다. 어느 채팅을 읽는지, 한 범위가 모든 메시지를 받는지 멘션만 받는지가 그것이다. Mandate는 자기 Source와 받은 범위를 기록한다. 재개하려면 Source가 여전히 그 Thread를 듣고 있어야 하지만, 거기서 여전히 모든 메시지를 받을 필요는 없다.

답글은 Source가 꺼져 있는 동안 기다린다. Source가 목적지를 더는 듣지 않으면 버려진다.

Executor가 자기 결과로 무엇을 해도 되는지에 관한 조건, 예를 들어 언제 병합해도 되는지는 누가 작업을 허락할 수 있는지를 정하지 않는다. 그것은 Policy가 아니라 에이전트 지시의 일부다.

## 재개와 멈춤

끝난 Ticket은 Mandate를 유지한다. 자기 Thread 하나에 온 사람의 메시지는 누가 보냈든 새 Eval이나 Decision 없이 같은 작업을 재개할 수 있다. 봇과 CI는 끝난 Ticket을 깨우지 않는다. 요청이 범위에 맞는지는 Executor가 정하고, 맞지 않으면 그 회차를 끝낸다.

Mandate를 바꾸는 작업은 셋뿐이다. accept가 만들고, 사람의 stop이 거두고, 실패한 재검증이 철회한다. 사람이 멈춘 Ticket은 끝난 채로 남고 더는 아무것도 받지 않는다. 거기서 부탁한 작업에는 새 accept가 필요하다.

### 재개 전 재검증

Source가 여전히 원래 Thread를 듣고 있어야 한다. 나머지 검사는 Mandate의 근거에 따라 다르다.

- explicit follow-up Mandate는 통과한다.
- inferred Mandate는 `auto` 모드와 맞은 규칙이 여전히 켜져 있어야 한다.
- 입장 칸으로 들어온 Mandate는 오늘의 표와 보낸 사람 소속에서도 적어도 원래 강도를 받아야 한다. 그래서 목록에서 보낸 사람을 빼면 목록에 있는 사람 칸으로 accept된 Mandate가 철회될 수 있다.
- 봇의 Mandate는 그 봇이 Source의 봇 목록에 남아 있어야 한다. inferred인 표 Mandate와 봇 Mandate는 `auto` 모드와 켜진 맞은 규칙도 필요하다.
- 그 밖의 Mandate는 보낸 사람이 Source의 허용 목록에 남아 있어야 한다.

재검증에 실패하면 Ticket은 끝난 채로 남고 기다리던 메시지를 하나도 받지 않는다. 각 메시지는 어느 Ticket에도 닿지 않은 것으로 다룬다. 다른 Ticket이 맡지 않으면 Eval로 간다. 메인 Session은 그것이 워커에 닿았다는 말을 듣지 않는다. 처리 일시 중지 뒤에도 마찬가지다. Ticket에 붙이기는 거부되고, 더 작업하려면 새 accept가 필요하다.

- **Thread에서 사람이 "멈춰"라고 하는 것은 평범한 Trigger다.** stop은 Eval이 정한다. 사람이 멈추라고 했다고 Executor가 선언할 수는 없다.
- **패널의 Stop은 명령이다.** Ticket에 바로 작용하고 수동 stop으로 기록된다.
- **대기 조건은 Source의 몫이다.** "N시간 동안 담당자 없음" 같은 조건은 스스로 기다렸다가 다시 확인하는 Source가 맡는다. Eval은 절대 기다리지 않는다.

## Eval이 끝나지 않을 때

제한 시간은 후보가 메인 Session에 닿을 때 시작한다. 전달을 기다린 시간은 세지 않고, 전달되지 않은 후보는 만료되지 않는다.

만료된 Eval은 다시 시도하려고 Trigger를 줄 세운다. 연속 두 번 재시도한 뒤 세 번째 만료는 `unavailable`을 기록한다. 판정 실패도 `unavailable`을 기록하고, 뒤에 온 Trigger가 새 Eval을 시작할 수 있다. Policy가 바뀌거나 낡은 Policy로 결정하면 `unavailable`을 기록하고 그 묶음을 현재 버전으로 바로 다시 줄 세운다.

`evals` 상태 항목은 지난 한 시간 동안 해결되지 않은 unavailable Decision을 보고한다. `scripts/dsh-superagent status`가 그 오류를 포함한다.

패널은 unavailable Decision이 24시간이 안 됐고, 여전히 그 Thread의 최신 Decision이고, 무시 처리되지 않았고, Thread가 줄 서 있거나 판정 중이 아닐 때만 사람의 주의를 요청한다. 사람은 Trigger를 다시 판정하거나 문제를 무시 처리할 수 있다.
