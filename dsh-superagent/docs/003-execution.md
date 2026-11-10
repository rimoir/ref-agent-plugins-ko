# 003 실행

이 문서는 accept된 Ticket을 실행, 전달, 복구까지 따라간다. [001 도메인 모델](001-domain.md)과 [002 권한 부여](002-authorization.md)를 바탕으로 한다.

## Ticket 단계

open Ticket은 저마다 단계 하나를 갖고, 단계는 그 Ticket이 무엇을 기다리는지로 정해진다. 표를 위에서 아래로 읽고, 처음 맞는 행을 택한다.

| 단계 | 조건 | 패널 라벨 |
| --- | --- | --- |
| person / delivery | Executor Session에 Input을 전달하지 못했다. 2초 뒤 다시 시도하고, 그 뒤로는 1분까지 두 배씩 늘어나는 간격으로 시도한다. 성공, 새 Assignment, Ticket의 끝이 이 상태를 지운다 | Input undelivered |
| person / answer | Attention이 있다 | Awaiting answer |
| person / review | 최신 Report가 `ready`다 | Awaiting review |
| person / blocked, failed | 최신 Report가 `blocked`나 `failed`이고, 그 뒤로 사람의 메시지가 Ticket에 닿지 않았다 | Blocked · Failed |
| working / queued | Assignment가 없거나 pending이다 | Queued |
| idle | 최신 Report가 `waiting`이거나 Assignment가 끝났다 | Waiting for a Trigger |
| working | 그 밖의 모든 경우 | Working |

`person` 단계는 사람의 입력 없이는 Ticket이 이어 갈 수 없다는 뜻이다. 새 사람 메시지는 `blocked`나 `failed` Ticket을 Executor에게 풀어 주고, Ticket은 다음으로 맞는 단계로 간다. 보통 `working`이다.

`idle` Ticket은 남은 질문 없이 자기 턴을 마쳤다. 구독한 Thread의 Trigger가 그것을 이어 갈 수 있다.

## Executor

각 Ticket은 `worker-<ticket id>`라는 Executor Session과 Ticket의 짧은 이름을 딴 디렉터리를 받는다. 디렉터리는 설정한 실행 루트 아래에 만들어지고, 루트의 기본값은 `<stateDir>/work`다.

Executor Session은 운영자의 OS 사용자로 승인 없이 명령을 돌린다. `dsh-superagent-worker` 프리셋에는 작업에 필요한 도구가 들어 있고, 포그라운드 셸 명령은 5초 뒤 백그라운드 작업으로 옮긴다. 그래서 워커는 긴 명령이 끝나기를 기다리지 않고 다음 단계에서 새 메시지를 받을 수 있다.

메인 Session은 `dsh-superagent-router`를 쓴다. 셸과 작업 대기 제한은 똑같이 5초이고, 라우팅용으로 도구가 더 적다. Session은 만들 때 고른 프리셋을 유지한다. 워커의 subagent는 DeepSeek Harness의 `standard` 프리셋을 쓴다.

### 백그라운드 작업과 워커 슬롯

셸 작업이나 subagent가 아직 도는 채로 턴이 끝나면 Ticket은 워커 슬롯을 유지하고 working으로 남는다. waiting으로 보고되지 않고, 메인 Session은 waiting 보고를 받지 않는다. 끝난 작업이나 subagent가 같은 슬롯에서 결과와 함께 Executor를 깨운다. 백그라운드 작업 없이 턴이 끝나면 Executor는 평소대로 waiting을 보고한다.

턴마다 백그라운드 작업은 끝나는 데 최대 30분을 갖는다. 그 한도에 이르면 셸 작업을 죽이고 Ticket을 waiting으로 보고한다. 보고에는 Executor의 마지막 말과, 어떤 작업이 죽었고 어떤 subagent가 아직 살아 있는지가 들어간다. subagent는 계속 돌아도 된다. Executor는 죽은 작업의 결과를 다음 턴에 읽는다.

사람에게 넘기면 슬롯이 바로 풀리고 Report는 효력을 유지한다. `ready` Report나 질문 뒤에 그 사이 다른 Input이 오지 않았다면 이렇게 되고, `blocked`나 `failed` Report 뒤에는 언제나 이렇게 된다.

넘길 때 subagent는 멈춘다. 리뷰용으로 띄운 서버 같은 셸 작업은 Assignment가 끝날 때까지 계속 돌 수 있다. 이것들은 슬롯을 차지하지 않고 30분 제한도 받지 않으며, 뒤의 턴이 지나도 그렇다. 이것들이 끝나도 Executor를 깨우지 않는다. 결과는 Executor가 다음 턴에 읽는다.

사람도 Executor Session에 직접 써서 턴을 시작할 수 있다. 그 백그라운드 작업도 같은 규칙을 따른다.

Assignment가 끝나면 그 셸 작업은 Session을 깨우지 않고 죽는다. subagent는 풀려나고, 그것이 깨우는 완료 턴은 버려진다. 대신할 Assignment와 기다리던 Input은 그 종료가 끝난 뒤 시작한다.

DeepSeek Harness 프로세스 안에서 플러그인을 멈추거나 재시작할 때도 같은 종료 경로를 쓴다. 아직 Session 이력에 들어가지 않은 Input은 남겨 둔다. 종료는 워커마다 백그라운드 작업을 최대 10초 기다린다. 프로세스 재시작은 그 작업을 바로 끝낸다. 바쁜 중에 끊긴 Assignment는 복구 노트와 함께 다시 시작한다.

워커의 subagent는 중첩된 것까지 DeepSeek Harness의 `standard` 프리셋을 워커의 권한으로 쓴다. 워커에 허용된 작업 도구만 갖고, Ticket이 끝나면 그 도구도 잃는다. `standard`에서는 셸 명령이 60초 뒤 백그라운드로 옮겨진다. subagent의 작업은 subagent가 끝날 때 죽는다.

### Ticket 디렉터리 준비

첫 Assignment 전에 Ticket 디렉터리가 없으면 prepare 명령이 실행 루트에서 `sh`로 한 번 돈다. 끝나는 데 10분이 주어진다. prepare 명령이 없으면 워커는 빈 디렉터리에서 시작한다.

명령이 실패하면 Ticket이 실패하고 그 출력이 기록된다. retry나 Ticket의 Thread 하나에 온 사람의 메시지가 준비를 다시 시도한다. 흔한 명령은 `git worktree`로 체크아웃을 만든다. 브랜치의 마지막 경로 조각이 Ticket의 짧은 이름과 같으면 그 pull request는 Ticket에 속한다.

### 동시성

Ticket은 준비를 포함한 launch가 시작될 때부터, 또는 idle Executor를 깨우는 전달 때부터 워커 슬롯을 차지한다. 활성 턴 동안에도 계속 차지한다.

설정한 동시성 한도는 이 슬롯에 적용되고, 사람의 메시지나 상태 요청을 위한 여분 슬롯이 하나 더 있다. 그런 깨움은 보통 슬롯이 꽉 찼을 때 여분 슬롯을 쓸 수 있고, 새 launch보다 먼저 다음 빈 슬롯을 차지한다. 그래서 새 작업이 사람이 기존 Ticket을 이어 가는 것을 막을 수 없다.

CI 결과 같은 다른 Input은 보통 슬롯을 기다린다. launch는 슬롯이 빌 때까지 `working / queued`에서 기다린다. launch는 동시에 돌기 때문에 느린 prepare 명령은 자기 Ticket만 늦춘다.

### 실행 변수

prepare 명령과 Executor 지시는 같은 실행 변수를 받는다. 명령은 환경 변수를 읽고, Executor는 프롬프트에서 그 값과 설명을 읽는다. 어느 것에도 자격 증명은 없다.

| 변수 | 등록하는 쪽 | 값 |
| --- | --- | --- |
| `DSH_SUPERAGENT_DIR`, `DSH_SUPERAGENT_NAME`, `DSH_SUPERAGENT_TICKET` | Executor | Ticket의 디렉터리, 짧은 이름, id |
| `DSH_SUPERAGENT_BLOCKED_COMMANDS` | Executor | Executor가 돌리면 안 되는 명령 |
| `DSH_SUPERAGENT_GITHUB_REPOSITORY` | GitHub | Source가 지켜보는 저장소, `owner/name` |
| `DSH_SUPERAGENT_GITHUB_ACCOUNT`, `DSH_SUPERAGENT_GITHUB_COMMIT_EMAIL` | GitHub | 에이전트 계정과 그 커밋 이메일 |
| `DSH_SUPERAGENT_GITHUB_NUMBER`, `DSH_SUPERAGENT_GITHUB_PR_HEAD` | GitHub | Ticket을 시작한 Issue나 pull request, 그리고 pull request라면 그 head ref |
| `DSH_SUPERAGENT_FEISHU_BOT`, `DSH_SUPERAGENT_FEISHU_CHAT` | Feishu | 봇, 그리고 Ticket을 시작한 채팅 |

Ticket별 값은 그 디렉터리와 시작한 Trigger에서 온다. 다른 값은 현재 배포 설정에서 온다. 실행 환경 설정은 패널에서만 바꿀 수 있다. 메인 Session에 보낸 글로는 설정한 셸 명령을 바꿀 수 없다.

워커는 에이전트 계정의 `gh`로 GitHub에 닿고, 봇의 `lark-cli`로 Feishu에 닿는다. 막힌 명령은 이름으로 부르면 실패한다.

이 래퍼와 디렉터리는 기본값을 정할 뿐 보안 경계가 아니다. 워커는 여전히 절대 경로로 프로그램을 실행할 수 있다.

## 병합

auto-merge는 **Delivery requirements** 프롬프트가 정한다. 호스트에는 병합 전용 결정 로직이 없다.

기본적으로 Executor는 에이전트 계정으로 auto-merge를 절대 켜지 않는다. GitHub는 병합을 그것을 켠 사람의 것으로 기록하기 때문이다. Delivery requirements는 병합에 쓸 다른 계정의 CLI를 지정해야 한다. 지정이 없으면 사람이 pull request를 병합한다.

기본 지시는 Ticket을 위해 연 pull request가 준비됐고, 필요한 승인이 head 커밋을 덮고, 추가와 삭제를 합쳐 200줄보다 적을 때만 auto-merge를 허락한다. 다른 revision을 push하기 전에 Executor는 auto-merge를 거둔다.

승인처럼 본문 없는 리뷰도 Trigger로 도착하고, 리뷰를 기다리는 Executor를 깨울 수 있다. 이 지시는 GitHub의 병합 규칙이 아니라 에이전트를 다스린다. 승인을 강제하려면 branch protection에서 승인을 요구하고 낡은 승인을 무효화한다. 수동 병합을 요구하려면 병합 CLI를 빼거나 auto-merge 단락을 지운다.

## Ticket이 끝나는 방식

- **pull request 없이 준비됨:** `ready` Report가 Ticket을 완료로 끝낸다.
- **할 일 없음:** 재현되지 않거나 대체된 요청처럼 사람이 움직일 작업을 찾지 못한 Executor는 `dropped`를 보고한다. Ticket은 메시지 없이 끝난다. 맞은 규칙이 메시지를 요구하면 예외다. 나중에 그 Thread에 온 사람의 메시지가 Ticket을 재개한다.
### Pull request

Ticket은 Executor가 보고하면 자기가 시작된 pull request를 따라간다. 자기 브랜치에서 열린 pull request도 Executor가 보고하거나 GitHub Source가 찾으면 하나하나 따라간다. 다시 열린 pull request는 다시 따라간다.

Ticket이 연 pull request가 하나도 열려 있지 않으면 Ticket은 끝난 것이다. 연 것이 없다면 따라가는 pull request가 모두 닫혀야 한다. 그러면 마지막 관련 close의 결과로 끝나고 Subscription을 유지해서, 나중에 사람이 단 댓글이 그것을 재개할 수 있다.

재개, retry, 복구된 작업이 끝나지 않았으면 close가 Ticket을 끝내지 않는다. Executor가 자기가 맡은 follow-up에 확인 응답이나 답을 했지만, 그 메시지를 읽은 뒤로 progress가 아닌 Report를 내거나 턴을 끝내지 않았을 때도 기다린다. 같은 pull request 완료 규칙이 채워지면 뒤의 `ready` Report가 Ticket을 끝낸다.

채팅 Channel은 pull request 결과에 대한 마지막 알림을 한 번 받는다. GitHub는 이미 pull request 자체에 결과를 보여 준다. Ticket의 pull request Subscription을 끊으면 그 pull request 따라가기도 멈춘다.

그래서 "Awaiting review"는 pull request가 있는 `ready` Report를 뜻한다.

### follow-up과 맥락 Thread

Executor는 자기 Ticket의 Thread에 온 사람의 follow-up을 판단한다. 범위 안의 요청은 처리하고, 범위를 넘거나 다른 Ticket을 위한 요청은 돌려준다. 메시지를 맡은 Executor가 없어지면 그것은 메인 Session의 후보가 된다. 그 밖에 메인 Session은 사람의 요청에 따라 작업을 멈출 때만 follow-up에 손댈 수 있다.

Input은 Session이 그것을 단계로 받아들이고 그 뒤 보고하거나 턴을 끝내면 읽은 것으로 친다. Ticket이 끝나면, 읽지 않았고 확인 응답도, 답도, 돌려주기도 하지 않은 메시지는 [002 권한 부여](002-authorization.md)에서 설명한 대로 Eval로 돌아간다. 감사 인사처럼 읽고 아무것도 하지 않은 메시지는 돌아가지 않는다.

맥락용으로만 따라가는 Thread도 메시지를 전달하지만, Ticket에 사람 follow-up을 맡기지 않고 끝난 Ticket을 재개하지도 않는다. 그 메시지는 따로 판정될 수 있다.

Source는 살아 있는 Ticket이 구독하는 동안, 그리고 마지막 Trigger와 구독한 Ticket들의 끝 가운데 늦은 쪽부터 2주 동안 구독한 Thread를 폴링한다. 그 뒤로 메시지는 평소 수집 경로로만 온다. GitHub 알림이나 Feishu 실시간 이벤트다.

## 실패와 복구

### Executor가 막히거나 실패함

Executor Session이 `blocked`나 `failed`를 보고하거나, 시작하지 못하거나 오류를 내서 `failed`가 기록되면, Ticket은 자동 Input을 받지 않는다.

모델 제공자나 네트워크의 일시적 실패, 즉 HTTP 408, 429, 5xx나 거부되거나 리셋되거나 시간 초과된 연결은 먼저 다시 시도한다. 늘어나는 backoff로 세 번 시도한다. launch는 다시 돌고, 턴이 실패한 워커는 이어 가라는 말을 듣는다. 실패한 prepare 명령은 다시 시도하지 않는다.

실패한 뒤에는 CI와 봇 메시지가 Ticket에 기록되지만 전달되지 않고 Session을 깨우지도 않는다.

도구는 계속 쓸 수 있어서 사람이 Session에서 직접 이어 갈 수 있다.

실패한 launch는 저절로 다시 시도하지 않는다.

사람의 메시지, `blocked`도 `failed`도 아닌 뒤의 Report, retry가 이 보류를 끝낸다.

보류 여부는 저장된 Report와 Input으로 계산하므로 재시작해도 유지된다.
### Retry

open Ticket이 `person / delivery`, `person / blocked`, `person / failed`에 있는 동안 쓸 수 있다. 어느 경우든 해결책은 새 Assignment다. 새 Assignment는 워커를 다시 시작하고 기다리는 Input을 받는다.

blocked나 failed Ticket에 사람의 메시지가 닿으면 Executor가 그 메시지를 가진다. 그래서 Ticket은 working으로 보이거나, 실패한 launch가 다시 시작될 때는 queued로 보이고, retry를 제안하지 않는다. 그 메시지 전달이 실패했다면 예외다.

retry는 현재 Assignment를 끝내고 같은 Executor Session, 디렉터리, 브랜치, pull request에서 새 Assignment를 시작한다.

Executor 모델은 Session을 만들 때만 적용된다. 기존 Session은 자기 모델을 유지한다.
### 재시작

돌던 Assignment는 "host restarted"로 끝나고, 새 Assignment는 복구 노트와 함께 오래된 Ticket부터 시작한다. 복구 노트는 바깥에 대한 행동을 되풀이하기 전에 디렉터리, git 이력, GitHub를 확인하라고 Executor에게 말한다.

waiting, ready, blocked, failed인 Assignment는 그대로 둔다. 다만 그 Report 뒤에 Input이 닿았다면 그것도 다시 시작한다.

Session, 디렉터리, Subscription, 대기 중인 메시지, 아래의 저장된 작업은 재시작을 견딘다. 각 Executor Session이 어떤 메시지를 자기 이력에 받아들였는지의 기록도 견딘다. 단계는 메시지를 가져간 뒤 모델 호출 전에 그 기록을 남긴다. 재시작이 끊은 턴이 받아들인 메시지는 Report나 턴 끝이 뒤따르면 읽은 것으로 친다. 단계가 가져갔지만 이력에 들어가기 전에 취소나 오류로 끊긴 메시지는 읽지 않은 것으로 친다.

retry나 재시작은 대신하는 Assignment에 전달됐지만 Executor Session이 받아들이지 않은 메시지를 새 Assignment에 다시 준다. 취소나 끊긴 단계가 그런 메시지를 떨어뜨렸을 수 있다. 재시작이 남겨 뒀거나 충돌을 넘어 보존된 사본이 Session에 아직 기다리고 있으면 새 Assignment의 첫 메시지 전에 빼낸다. 그래서 새 전달이 유일한 사본이 된다.
### 저장된 작업

결정 뒤에 dsh-superagent가 하는 일, 예를 들어 후보, follow-up, 보고를 메인 Session에 중계하기, Assignment launch하기, Input 전달하기는 먼저 저장하고 나중에 한다.

Session에 닿을 수 없을 때처럼 중계나 전달이 실패하면 2초 뒤 다시 시도하고, 그 뒤로는 1분까지 두 배씩 늘어나는 간격으로 시도한다. launch가 실패하면 Ticket이 실패한다. 위에서 말한 일시적 실패는 예외다.

작업 종류마다 항목 하나가 연속 세 번 실패한 뒤에야 overview의 시스템 문제에 오류를 보고한다. 실패한 Input 전달은 대신 자기 Ticket에 보인다.

메인 Session으로 가는 중계는 순서를 지키고 알림도 그렇다. 하나가 실패하면 같은 종류의 뒤 항목이 막힌다.
### Source 실패

GitHub Source는 Issue, pull request, Thread를 각각 따로 읽는다. 실패한 읽기는 오류를 자기 Thread에 남기고, 다음 폴링 때 다시 읽고, Source 오류 횟수에 들어간다. Source는 기본적으로 연속 세 번 폴링이 실패하면 오류를 보고하고, 폴링 한 번이 성공하면 횟수가 초기화된다.

GitHub는 에이전트가 비공개 저장소 접근을 잃었을 때도 404로 답한다. 그래서 404는 다시 시도한다.

알림받은 Issue나 pull request의 읽기가 계속 실패하면 첫 읽기 실패 하루 뒤에 버린다. GitHub가 삭제됐다고 알려 오면 바로 버린다. 그 뒤로는 폴링을 실패시키지 않고, Thread는 오류를 유지하고, Source 상태가 그것을 밝힌다.

읽기 위치는 그대로 둔다. 그래서 뒤의 알림이나 그 Thread의 폴링이 실패한 읽기가 놓친 것을 읽는다.

Feishu 이벤트 소비자는 모든 실패를 보고하고, 구독한 토픽의 폴링은 실패를 각 Thread에 남긴다.

GitHub 목록이나 Feishu 페이지의 잘못된 항목은 건너뛰고, Source 상태가 그 수를 센다.
### Channel 실패

나가는 메시지는 저장되고 저장된 작업으로 보내진다. 5초에서 시작해 300초까지 두 배씩 늘어나는 backoff로 다시 시도한다.

한 대화로 가는 Ticket의 메시지는 줄 선 순서대로 나간다. 그래서 확인 응답이 뒤의 답이나 결과보다 먼저 나간다. 같은 Ticket이 같은 대화로 보낸 앞 메시지가 아직 나가지 않았으면 메시지는 기다린다. 앞 메시지가 연속 세 번 실패해 문제로 보이면 기다림이 끝난다.

다른 Ticket의 메시지와 Ticket 없는 메시지는 그것을 기다리지 않는다.

시도가 실패한 메시지는 나가거나 거둬질 때까지 시스템 문제다.

메시지는 Source가 그 대화를 더는 듣지 않거나, 그 대화가 절대 받을 수 없다고 Source가 답할 때만 버려진다. Source가 꺼져 있는 동안에는 기다린다.

GitHub에서는 삭제된 Issue나 잠긴 대화, Feishu에서는 회수된 메시지나 Feishu가 더는 찾지 못하는 메시지에 대해 Source가 그렇게 답한다.

더는 없는 리뷰 댓글에 대한 답글은 대신 pull request의 대화로 간다.

버려진 메시지는 언제, 왜 버려졌는지와 어느 Ticket을 위한 것이었는지를 담은 기록을 유지해서 다시 줄 서지 않는다. 버려진 확인 응답은 보냄이 아니라 버려짐으로 읽힌다.
### 처리 일시 중지

배정, 새 Eval, Eval 시간 초과, Input 전달, 답글을 멈춘다. 이미 진행 중인 launch는 처리가 재개될 때까지 기다린다.

Source는 Trigger를 계속 기록하고, 돌고 있는 Executor 턴은 끊기지 않는다.

끝난 Ticket에 온 사람의 메시지는 기다린다. 일시 중지 뒤 첫 처리에서, 그때의 Policy로 Mandate가 유지되면 Ticket이 재개된다.

진행 중인 Eval은 일시 중지 동안 만료되지 않는다. 기한이 일시 중지 길이만큼 늦춰진다.
### 잘못된 설정

저장된 Source 설정을 그 종류가 거부하면 그 Source 인스턴스는 꺼진다.
