# 008 쿡북

이 쿡북은 dsh-superagent를 확장하는 방법을 보여 준다. [001 Domain model](001-domain.md)과 [002 Authorization](002-authorization.md)의 용어, [007 Architecture](007-architecture.md)의 구성 요소를 쓴다.

## Source 추가하기

이 레시피는 `webhook`이라는 Source kind를 구현한다. 지어낸 CLI `hookq`로 가상의 메시지 큐를 읽고 메시지를 Trigger로 바꾼다. 그 밖의 인터페이스는 모두 dsh-superagent의 것이다.

구현이 맡는 일은 네 가지다. 이벤트를 변환하고, 수신과 권한 규칙을 정하고, 답장과 맥락을 제공하고, 폴링 루프를 유지한다. 번호 붙은 단계가 이 조각들을 차례로 만든다.

예시는 다음 CLI 계약을 가정한다.

- `hookq pull --after <n> --json`은 위치 `n` 뒤의 메시지를 오래된 순으로 출력한다: `{"me": "<the agent's id on the queue>", "items": […], "next": <position>}`. 항목에는 `id`, `conversation`, `thread`(그 스레드를 시작한 메시지의 id, 시작 메시지 자신에는 없음), `id`와 `bot`을 가진 `sender`, `mentions_me`, `text`, `at`, `url`이 있다.
- `hookq reply --conversation <id> --to <message id> --key <key> --text <text>`는 메시지 아래에 답장을 단다. 키 하나에 한 번만 단다. 삭제된 대화에서는 표준 오류에 `{"error": {"code": 410, "message": "…"}}`를 내고 실패한다.
- `hookq thread --conversation <id> --root <message id> --json`은 스레드의 한 페이지를 오래된 순으로 출력한다: `{"items": […], "next": "<cursor>"}`. 다음 페이지는 `--after <cursor>`로 읽고, 마지막 페이지에는 `next`가 없다.

kind와 플러그인 엔트리는 `src/sources/github.ts`를 본떠 `src/sources/webhook.ts`에 둔다. Source가 커지면 Feishu Source처럼 변환, Channel, 폴링 코드를 별도 모듈로 나눈다.

### 1. 이벤트를 도메인에 대응시키기

코드를 쓰기 전에 안정적인 대응을 정한다. Trigger id, Thread id, Channel 주소는 저장되므로 나중에 바꾸면 기존 기록과 연결이 끊길 수 있다.

| 개념 | webhook 큐에서 |
| --- | --- |
| Trigger | 메시지 하나 |
| Thread | 한 대화 안의 메시지와 그 답장들: `<conversation>:<id of the first message>` |
| Actor | 허용 목록이 부르는 대로의, 큐에서의 발신자 id |
| Channel 주소 | 답장이 달릴 대화와 메시지 |
| 수신 범위 | 대화 하나. admission 표에 자기 행이 있다 |

### 2. 설정: schema, fields, facts, health

모듈은 아래 단계에서 쓰는 것을 import한다.

```ts
import type { Context } from '@deepseek-ai/cordis'
import { setTimeout as delay } from 'node:timers/promises'
import { z } from 'zod'
import { key, threadKey, type OutboundMessage, type Trigger } from '../core/index.ts'
import { CliError } from '../infra/commands.ts'
import { KV } from '../kv.ts'
import { health, sourceContext, type SourceContext } from './host.ts'
import type { SourceKind } from './kind.ts'
```

```ts
const ConfigSchema = z.object({
  conversations: z.array(z.object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    listen: z.enum(['mentions', 'all']),
  }).strict()).default([]),
  pollSeconds: z.number().int().min(10).max(3600).default(30),
}).strict()
export type WebhookConfig = z.infer<typeof ConfigSchema>

export const webhookKind: SourceKind<WebhookConfig> = {
  kind: 'webhook',
  title: { zh: 'Webhook 队列', en: 'Webhook queue' },
  description: { zh: '接收 webhook 队列里下列对话的消息。', en: 'Receives the messages of these conversations from the webhook queue.' },
  schema: ConfigSchema,
  fields: [
    { key: 'conversations', type: 'rows', label: { zh: '接收的对话', en: 'Conversations' }, columns: [
      { key: 'id', type: 'text', label: { zh: '对话', en: 'Conversation' }, pattern: '[a-z0-9-]+' },
      { key: 'listen', type: 'select', label: { zh: '接收', en: 'Receive' }, options: [
        { value: 'mentions', label: { zh: '仅 @', en: '@ only' } }, { value: 'all', label: { zh: '全部消息', en: 'All' } }] },
    ] },
    { key: 'pollSeconds', type: 'number', advanced: true, min: 10, max: 3600,
      label: { zh: '轮询间隔 / 秒', en: 'Polling interval / seconds' } },
  ],
  health: ['webhook'],
  // find, scope, channel, threadContext, policy, environment는 다음 단계에서 이어진다.
}
```

- `kind`는 바뀌지 않는 Source id다. Trigger의 `source`, Thread 키 접두어, `source:webhook` 설정 블록, Source Policy에 나타난다.
- `schema`는 저장된 설정을 검증하고 기본값을 채운다. 운영자가 인스턴스를 저장하기 전에는 레지스트리가 이 기본값으로 켜진 인스턴스를 만든다. 그러니 기본값은 아무것도 받지 않게 한다. 이 예시의 기본값은 대화가 하나도 없는 것이다.
- `fields`는 패널 코드를 따로 쓰지 않고 Source 설정 폼을 만든다. `rows` 필드는 첫 열을 키로 하는 항목들을 편집하고, `advanced`는 덜 쓰는 설정을 숨긴다. Source가 id를 표시 이름으로 풀 수 있으면 `refreshLabels`를 구현한다. 그 이름은 `KV.sources.labels(kind)` 아래에 저장한다. 그러면 `choose`와 `refresh`가 있는 열이 그 이름을 보여 줄 수 있다.
- 선택 항목인 `facts(deployment)`는 CLI 뒤의 계정처럼 설정 과정이 알아낸 값을 보여 준다. 지금 설정 과정은 `SETUP_FIELDS`에 나열된 GitHub와 Feishu 필드만 확인하므로 이 예시는 facts를 주지 않는다.
- `health`는 Source의 상태 항목을 선언한다. 처음 값은 `starting`이다. 등록할 때 각 이름을 차지하고 `runtime`, `reply`, `worker`, effect kind 같은 항목과 겹치면 거부한다. kind 이름을 쓰고, `sync:<id>`는 Policy 동기화용으로 남겨 둔다. `error`를 알리면 상태 스크립트가 2로 끝나고 매시간 점검이 운영자에게 알리므로 사람이 손써야 할 수 있을 때만 알린다.

### 3. 메시지를 Trigger로 변환하기

변환하기 전에 CLI 응답을 검증한다.

```ts
/** `hookq pull`과 `hookq thread`가 출력하는 메시지 하나. */
const MessageSchema = z.looseObject({
  id: z.string().min(1), conversation: z.string().min(1), thread: z.string().optional(),
  sender: z.looseObject({ id: z.string(), bot: z.boolean().default(false) }), mentions_me: z.boolean().default(false),
  text: z.string(), at: z.string(), url: z.string().optional(),
})
type QueueMessage = z.infer<typeof MessageSchema>
/** `hookq pull`의 응답(항목을 하나씩 읽는다)과 `hookq thread`의 응답. */
const PageSchema = z.looseObject({ me: z.string(), items: z.array(z.unknown()), next: z.number().int() })
const ThreadPageSchema = z.looseObject({ items: z.array(MessageSchema), next: z.string().optional() })
```

```ts
/** 큐 메시지 하나의 Trigger. 에이전트 자신의 메시지는 Trigger를 만들지 않는다. */
export function webhookTrigger(message: QueueMessage, me: string): Trigger | undefined {
  if (message.sender.id === me) return undefined
  const thread = `${message.conversation}:${message.thread ?? message.id}`
  return {
    id: key('webhook', message.id),
    source: 'webhook',
    threads: [{ source: 'webhook', id: thread }],
    actor: { source: 'webhook', id: message.sender.id },
    human: !message.sender.bot,
    ...(message.mentions_me ? { addressed: 'mention' as const } : {}),
    at: message.at,
    text: message.text,
    channel: { source: 'webhook', thread: `webhook:${thread}`,
      address: { conversation: message.conversation, message: message.id, ...(message.url ? { url: message.url } : {}) } },
    ...(message.url ? { url: message.url } : {}),
    meta: { conversation: message.conversation, messageId: message.id, root: message.thread ?? message.id },
  }
}
```

- **안정적인 id.** Trigger id는 `key`로 큐 id에서 만든다. `Engine.receive`는 이미 저장된 id에 `duplicate`를 돌려주고, 중복 수락은 Ticket을 하나만 만든다. 그래서 메시지를 다시 읽어도 안전하다. 편집을 새 이벤트로 다루려면 GitHub가 댓글의 `updated_at`을 쓰듯 id에 편집 버전을 넣는다.
- **Thread.** 첫 Thread가 주 Thread이고 Eval을 가진다. 추가 Thread는 Correlation 맥락을 더한다. id는 Source가 정하고, 전체 키는 `webhook:<id>`다.
- **발신자.** `actor`에는 Source 고유의 id를 쓴다. 봇과 CI에는 `human: false`를 둔다. 목록에 있는 봇은 추론 후보만 될 수 있다. CI처럼 actor id가 비어 있으면 목록에 없고 부르지도 않은 발신자의 admission 칸을 쓴다. `addressed`는 메시지가 실제로 에이전트를 부를 때만 `mention`이나 `direct`로 둔다. 그러면 허용된 사람의 메시지가 explicit 강도를 얻는다. 에이전트 자신의 메시지에는 절대 Trigger를 만들지 않는다.
- **답장 대상과 메타데이터.** `channel`은 답장이 갈 곳을, `url`은 원본 메시지 링크를 나타낸다. `channel.thread`는 순서대로 전달할 메시지를 묶는다. 한 Ticket의 나중 메시지는 앞선 메시지 뒤에서 기다리고, 앞선 메시지가 세 번 실패하면 더 기다리지 않는다. 다른 Ticket은 기다리지 않는다. 수신한 대화와 Thread 루트처럼 Source 고유의 필드는 `meta`에 둔다. `meta`와 `text`는 모두 믿을 수 없는 데이터이며 권한 근거가 아니다.

에이전트는 `orchestrator_read trigger/<id>`와 `thread/<key>`로 새 kind를 읽을 수 있다. 이 둘은 메시지 본문, 처리 결과, 이웃 Trigger를 보여 준다. 새 kind는 내장 스킬, 원래 서비스 기록용 리소스, pull request 연결을 저절로 얻지 않는다.

텍스트 검색은 코드를 더 쓰지 않아도 된다. 사람들이 메시지 id, URL, `#12` 같은 Source 고유의 참조를 쓴다면 `find(query)`를 구현한다. 그 참조가 가리키는 Thread 키와 검색어를 돌려준다.

```ts
  find: query => ({ threads: [], terms: [...new Set(query.match(/\bm[0-9]+\b/g) ?? [])] }),
```

여기서는 쿼리 안의 큐 메시지 id(예: `m42`)로 Trigger를 검색한다.

### 4. Source가 받는 것: scope

```ts
  scope({ meta }, config) {
    const conversation = config.conversations.find(item => item.id === meta.conversation)
    if (!conversation) return { listened: false, reason: 'conversation_not_listed' }
    return { listened: true, observed: conversation.listen === 'all', row: conversation.id }
  },
```

Engine은 들어오는 Trigger마다 `SourceRegistry`를 거쳐 `scope`를 부른다. 범위 밖 메시지는 이유와 함께 filtered로 저장되고 Thread를 만들지 않는다. 폴링 루프에서 조용히 버리지 말고 `receive`로 넘긴다. 그래야 패널이 걸러진 이유를 설명할 수 있다.

`observed: true`는 Source가 그 범위에서 에이전트를 부르지 않은 메시지도 받는다는 뜻이다. 그러면 그 메시지에 admission 표의 결정을 적용할 수 있다. `row`는 해당 admission 행을 가리킨다.

재검증은 Mandate에 저장된 메타데이터로 `scope`를 부른다. 그러니 `scope`는 `meta`와 설정에만 의존하게 한다. 재개에는 `observed`가 아니라 `listened`가 필요하다. `scope`가 없으면 kind는 자기가 만든 Trigger를 모두 받지만 아무것도 observe하지 않는다.

### 5. 답장: Channel

```ts
  channel: {
    allowed: (address, config) => config.conversations.some(item => item.id === address.conversation),
    send: sendWebhook,
    link: address => ({ url: address.url ?? '',
      label: { zh: `Webhook 对话 ${address.conversation}`, en: `Webhook conversation ${address.conversation}` } }),
  },
```

```ts
export async function sendWebhook(host: Pick<SourceContext, 'commands'>, message: OutboundMessage): Promise<'sent' | 'gone'> {
  const { conversation, message: to } = message.channel.address
  if (!conversation || !to) throw new Error('Missing webhook reply target')
  try {
    await host.commands.run('hookq', ['reply', '--conversation', conversation, '--to', to, '--key', message.id,
      '--text', message.text])
    return 'sent'
  } catch (error) {
    if (error instanceof CliError && error.code === 410) return 'gone'
    throw error
  }
}
```

- **멱등 전송.** Outbox가 `SourceRegistry.send`를 부르고, 이것이 `channel.send`를 호출한다. Source 플러그인이 내려가 있는 동안 메시지는 기다린다. 원격 서비스가 받은 뒤에 전송이 실패할 수도 있으므로 재시도가 메시지를 중복시키면 안 된다. `message.id`를 멱등 키로 쓴다. `hookq`는 `--key`를 지원하고, GitHub는 숨은 댓글 표식을 저장하고, Feishu는 멱등 키를 받는다.
- **영구 실패와 재시도할 실패.** 성공하면 `sent`를, 예시의 410처럼 전달이 영영 불가능할 때만 `gone`을 돌려준다. gone 메시지는 dropped로 남고 다시 큐에 들어가지 않는다. `GET sources`와 Source 페이지에 나타난다. 그 밖의 실패에는 예외를 던진다. 그러면 Outbox가 5초 뒤 다시 시도하고 간격을 두 배씩 늘려 300초까지 간다. `CliError.code`는 CLI 출력이 알린 코드다.
- **허용된 대상.** `allowed(address, config)`는 저장된 주소와 현재 설정만 확인한다. 필요한 사실은 모두 주소에 넣는다. 예를 들어 Feishu는 채팅이 다이렉트인지 기록한다. 더는 수신하지 않는 대상의 메시지는 버리고, Source가 꺼져 있으면 메시지를 기다리게 둔다. `allowed`가 없으면 Source가 켜져 있는 동안 모든 주소를 허용한다.
- **링크.** `link(address, links)`는 패널이 `SourceRegistry.link`로 보여 줄 URL과 라벨을 돌려준다.

### 6. 평가용 Thread 맥락

```ts
  threadContext: {
    messageId: trigger => String(trigger.meta.messageId ?? ''),
    // 큐 스레드는 평평하다. GitHub처럼 루트와 답장이 가리키는 메시지가 첫 페이지에 있다.
    read: async (commands, trigger, _part, cursor) => {
      const page = ThreadPageSchema.parse(JSON.parse(await commands.run('hookq', ['thread', '--conversation',
        String(trigger.meta.conversation), '--root', String(trigger.meta.root), '--json', ...(cursor ? ['--after', cursor] : [])])))
      const messages = page.items.map(item => ({ id: item.id, from: item.sender.id, at: item.at, text: item.text,
        ...(item.sender.bot ? { bot: true as const } : {}), ...(item.url ? { url: item.url } : {}) }))
      return { messages, ...(page.next ? { next: page.next } : {}), body: { messages } }
    },
  },
```

먼저 나서는 평가에는 Trigger 주변의 대화가 필요하다. `orchestrator_eval`은 처음 구간을 읽고, `orchestrator_eval_read`는 페이지, 루트, 부모 메시지로 넓혀 읽는다. 이 읽기를 제공하려면 선택 인터페이스 `threadContext`를 구현한다.

- `read(commands, trigger, part, cursor, config)`는 `ContextPart`를 돌려준다. 그 `messages`는 `ContextMessage` 형식이다. `{id, from, at, text}`에 해당하는 `bot`, `deleted`, `reply_to`, `url`, `path`, `line` 필드를 더한다. 마지막 페이지에서는 `next`를 뺀다. `body`는 평가하는 Session에게 보여 줄 내용이고 여기서는 같은 메시지다. 선택 항목 `status`는 Feishu의 `chat_neighbours` 같은 특수한 결과를 나타낼 수 있다. `part`는 `thread`, `root`, `parent` 중 하나다.
- `messageId(trigger)`는 그중 Trigger 자신의 메시지를 찾는다.
- `images(text)`와 `image(…)`는 Feishu처럼 메시지에 이미지가 실리는 kind를 위한 것이다. 예시에서는 뺀다.

`threadContext`가 없는 kind는 평가에 Thread 맥락을 주지 않는다. Trigger 자신의 본문은 여전히 읽을 수 있다.

메시지가 앞선 메시지에 답하는 구조라면 `repliesTo(trigger)`를 추가한다. 이 함수는 해당 Trigger id를 돌려주고, 그러면 후속 알림과 워커 Input이 저장된 답장 대상 메시지를 보여 줄 수 있다. 예를 들어 `hookq`가 `reply_to`를 주고 변환 단계가 그것을 `meta.replyTo`로 저장한다면 다음과 같다.

```ts
  repliesTo: trigger => typeof trigger.meta.replyTo === 'string' ? key('webhook', trigger.meta.replyTo) : undefined,
```

### 7. 누가 요청할 수 있는가: Policy 중 Source의 부분

```ts
  policy: {
    schema: z.object({ allowed: z.array(z.object({ id: z.string().min(1), name: z.string().trim().max(100).optional() }).strict())
      .default([]) }).strict(),
    fields: [{ key: 'allowed', type: 'rows', label: { zh: '能发起工作的发送者', en: 'Senders who may originate work' }, columns: [
      { key: 'id', type: 'text', label: { zh: '发送者', en: 'Sender' } },
      { key: 'name', type: 'text', label: { zh: '名字', en: 'Name' }, optional: true }] }],
    explicit: { zh: '名单里的人在消息里 @ 智能体。', en: 'Someone on the list mentions the agent in a message.' },
    rows: stored => ConfigSchema.parse(stored).conversations.map(conversation => {
      const all = conversation.listen === 'all'
      return { id: conversation.id, label: conversation.id, note: all ? { zh: '全部消息', en: 'All' } : { zh: '仅 @', en: '@ only' },
        cells: { listedUnaddressed: all, unlistedAddressed: true, unlistedUnaddressed: all } }
    }),
  },
```

- `schema`는 `allowed` 발신자 id를 포함해 Source Policy를 검증한다. id 비교는 대소문자를 가리지 않는다. admission 표는 따로 검증하고 모든 kind가 함께 쓴다. 이 Policy 부분은 `policy.sources.webhook`에 저장되고 Policy 버전에 반영된다.
- `fields`는 **Eval → On each Source** 아래의 폼을 만들고 `allowed`부터 보여 준다. `explicit`는 에이전트를 부르는 방법을 설명한다. 선택 항목 `unnamed: {person, bot}`는 Feishu의 `ou_…`처럼 읽을 수 없는 id에 표시 라벨을 준다. 큐 id는 읽을 수 있는 이름이라 이 예시는 생략한다.
- `rows(config)`는 admission 범위와 쓸 수 있는 칸을 나열한다. 각 행 id는 `scope`가 돌려주는 `row`와 같아야 한다. 부르지 않은 메시지의 칸은 Source가 그 메시지를 observe하는 곳에서만 쓸 수 있다. `rows`가 없는 kind는 기본 칸을 쓴다.
- 선택 항목 `bots`는 추론 후보가 될 수 있는 봇을 `allowed`와 같은 항목 형식으로 나열한다. 없으면 어떤 봇도 받아들이지 않는다.
- 선택 항목 `sync: {label, ready(part), run(host, part, signal)}`는 시작할 때와 **Sync now**를 누를 때 멤버를 새로 고친다. Feishu는 채팅 멤버를 쓴다. 실패는 `sync:<id>` 아래에 나타나고, 1분 뒤 다시 시도하며 성공할 때까지 간격을 두 배씩 늘려 한 시간까지 간다.

### 8. Executor용 변수

```ts
  environment: {
    variables: [{ key: 'DSH_SUPERAGENT_WEBHOOK_CONVERSATION', description: {
      zh: '接下工单的 webhook 对话；工单不是从这个来源来的时为空',
      en: 'The webhook conversation that started the ticket; empty when the ticket did not start on this Source' } }],
    values: ({ trigger }) => ({
      DSH_SUPERAGENT_WEBHOOK_CONVERSATION: trigger?.source === 'webhook' ? String(trigger.meta.conversation ?? '') : '' }),
  },
```

Execution 설정은 Source가 꺼져 있어도 선언된 `variables`를 prepare 명령 옆에 보여 준다. 켜져 있는 동안 `values`가 배포, 설정, 출발 Trigger로 Ticket별 값을 채운다.

prepare 명령은 환경 변수를 읽고, 워커는 지시문에서 그 값을 읽는다. `DSH_SUPERAGENT_<KIND>_…` 접두어를 쓰고, 다른 Source에서 온 Ticket에는 빈 값을 돌려주고, 자격 증명은 절대 넣지 않는다.

### 9. 플러그인 엔트리와 루프

```ts
export const name = 'dsh-superagent-webhook'
export const inject = ['orchestrator']
export function apply(ctx: Context): void {
  ctx.effect(() => ctx.orchestrator.sources.register(webhookKind), 'webhook: source kind')
  ctx.effect(() => {
    const source = sourceContext(ctx.orchestrator, webhookKind)
    const controller = new AbortController()
    // DSH는 처리되지 않은 rejection이 나면 프로세스를 끝내므로, 루프를 빠져나온 실패는 Source의 상태로 바꾼다.
    const running = watch(source, controller.signal)
      .catch((error: unknown) => { source.report('webhook', { state: 'error', detail: String(error) }) })
    return async () => { controller.abort(); await running }
  })
}
```

플러그인은 `orchestrator`를 주입받는다. 첫 effect는 kind를 등록하고 해제될 때 등록을 푼다. 두 번째 effect는 `SourceContext`로 폴링 루프를 돌린다. 해제하면 루프를 중단시키고 끝날 때까지 기다린다. 애플리케이션이 멈추거나 재시작할 때도 마찬가지다.

```ts
async function watch(ctx: SourceContext, signal: AbortSignal): Promise<void> {
  await ctx.ready
  // 설정 과정은 계정을 확인하면 dsh-superagent를 재시작한다. 그때까지 Source는 아무것도 읽지 않는다.
  if (!ctx.configured()) { ctx.report('webhook', health('paused', 'setupPending')); return }
  let failures = 0
  while (!signal.aborted) {
    const config = ctx.config<WebhookConfig>('webhook')
    if (!config) ctx.report('webhook', health('paused', 'sourceOff'))
    else {
      const at = new Date().toISOString()
      try {
        const { read, unreadable } = await pollQueue(ctx, signal)
        failures = 0
        ctx.report('webhook', { state: 'ready', detail: `${read} messages, ${unreadable} unreadable`, at })
      } catch (error) {
        failures += 1
        // 네트워크 실패 한 번은 다음 회차에 다시 시도한다. 세 번 연속이면 사람이 봐야 한다.
        if (!signal.aborted && failures >= 3) {
          ctx.report('webhook', health('error', 'pollFailures', { count: String(failures), error: String(error) }))
        }
      }
    }
    await delay((config?.pollSeconds ?? 30) * 1000, undefined, { signal }).catch(() => {})
  }
}

/** 커서 뒤의 큐를 읽고 메시지를 하나씩 받아들인 뒤 커서를 그 뒤로 옮긴다. */
export async function pollQueue(ctx: SourceContext, signal: AbortSignal): Promise<{ read: number; unreadable: number }> {
  const after = ctx.state.get(KV.webhook.cursor) ?? 0
  const output = await ctx.commands.withSignal(signal).run('hookq', ['pull', '--after', String(after), '--json'])
  const page = PageSchema.parse(JSON.parse(output))
  let unreadable = 0
  for (const item of page.items) {
    if (signal.aborted) throw new Error('The webhook Source stopped during the read')
    const message = MessageSchema.safeParse(item)
    if (!message.success) { unreadable++; continue }
    const trigger = webhookTrigger(message.data, page.me)
    if (!trigger) continue
    await ctx.receive(trigger)
    const conversation = { label: { zh: '对话', en: 'Conversation' }, value: message.data.conversation }
    for (const ref of trigger.threads) ctx.threads.describe(threadKey(ref), { facts: { conversation } })
  }
  ctx.state.set(KV.webhook.cursor, page.next)
  return { read: page.items.length, unreadable }
}
```


- **설정과 스위치.** `ctx.ready`를 기다리고, `ctx.configured()`가 false인 동안에는 아무것도 읽지 않는다. `ctx.config(kind)`는 회차마다 읽는다. Source가 꺼져 있으면 undefined다.
- **커서.** 읽은 위치는 `KV`(`src/kv.ts`)의 타입 있는 항목으로 `ctx.state`에 저장한다. 예: `webhook: {cursor: record<number>('webhook-cursor')}`. `tests/store.spec.ts`는 키 리터럴이 그 레지스트리에만 나오도록 요구한다. 외부 패키지는 export된 `record`와 `family`로 키를 정의할 수 있다. `undefined`를 넣으면 기록이 지워지고, `ctx.atomic`은 쓰기를 트랜잭션 하나로 묶는다.

  커서는 그 범위의 Trigger를 모두 저장한 뒤에만 옮긴다. 중간에 끊긴 회차는 커서를 그대로 두고, 안정적인 id 덕에 다시 읽어도 안전하다. 타임스탬프 커서라면 `src/sources/poll.ts`의 `cursorAt(started)`가 원격 쓰기가 늦을 것을 감안해 5초를 뺀다.
- **Thread 메타데이터.** Trigger를 받은 뒤 `ctx.threads.describe(key, {label, url, facts})`를 불러 표시 정보를 채운다. `ctx.threads.patch(key, meta)`는 `threads.patchMeta`에 위임해 Source 소유 키를 정하고, 값이 `undefined`면 지운다. 둘 다 없는 Thread는 무시한다. 걸러진 Trigger의 Thread도 여기에 든다.
- **항목별 오류.** 형식이 잘못된 항목은 세고 넘어간다. 묶음 전체를 실패시키지 않는다. `src/infra/commands.ts`의 `validItems(item, list, tally)`가 이 방식을 돕는다. Thread를 따로따로 폴링한다면 `src/sources/poll.ts`의 `pollThreads`를 쓴다. 이 함수는 실패를 하나하나 `pollError`로 기록한다. 그 `polled` 조건은 살아 있는 구독과, 마지막 Trigger와 Ticket 종료 중 나중 것 이후 2주 구간을 유지한다.
- **상태.** `ctx.report`로는 선언한 항목만 쓴다. `health(state, code, values)`가 `setupPending`, `sourceOff`, `pollFailures` 같은 고정 메시지를 준다. `error`를 알리기 전에 연속 실패를 센다.
- **중단.** 신호를 `ctx.commands.withSignal(signal)`과 `delay`에 넘기고 항목 사이마다 확인한다. 그래야 중지나 재시작이 루프를 바로 끝낸다.

이 예시는 Source가 먼저 보내는 알림을 보내지 않는다. 그런 알림이 필요한 Source는 `ctx.notify`를 부르고, Outbox가 다른 답장처럼 전달한다.

Thread를 Ticket 완료에 연결하지도 않는다. GitHub pull request처럼 Source의 Thread 생애가 작업 완료 여부를 정할 때만 `ctx.tickets.bindThread`와 `threadClosed`를 쓴다. Ticket이 언제 끝나는지는 여전히 Engine이 정한다.

### 10. 플러그인 등록하기

모듈을 `tsdown.config.ts`의 독립 엔트리로 빌드한다.

```ts
entry: { index: 'src/index.ts', 'github-watch': 'src/sources/github.ts', 'feishu-watch': 'src/sources/feishu.ts',
  'webhook-watch': 'src/sources/webhook.ts' },
```

그다음 `package.json`의 `exports`에 `"./webhook-watch": "./lib/webhook-watch.js"`를 넣어 빌드한 파일을 내보내고, Feishu처럼 꺼진 상태로 번들의 `cordis.patch.yml` `insert` 목록에 플러그인을 추가한다.

```yaml
    - id: dsh-superagent-webhook
      name: dsh-superagent/webhook-watch
      disabled: true
```

프로필의 `cordis.patch.yml`에서 `id: dsh-superagent-webhook`에 `disabled: false`를 두어 플러그인을 켠다. 빌드하고 재시작한다. 새 Source가 Sources 설정과 **Eval → On each Source** 아래에 나타난다.

[007 Architecture](007-architecture.md)의 모듈 표와 테스트 표에 모듈과 spec을 추가한다. `tests/docs.spec.ts`가 두 색인이 빠짐없는지 검사한다.

### 11. 테스트

`tests/sources.spec.ts`의 방식대로 `tests/webhook.spec.ts`를 만든다. 임시 디렉터리의 실제 Store, `HealthBoard`를 가진 `SourceRegistry`, 대역 포트를 단 Engine, `sourceContextOf`로 만든 `SourceContext`를 쓴다.

CLI 호출은 `Commands.run`을 spy해서 흉내 낸다. `withSignal`도 spy한다. 원래는 새 `Commands` 인스턴스를 돌려주기 때문이다.

```ts
function host(overrides: Partial<SourceContextDeps> = {}) {
  const store = new Store(join(mkdtempSync(join(tmpdir(), 'webhook-')), 'db.sqlite'))
  store.saveSettings(SettingsSchema.parse({
    sources: { webhook: { enabled: true, config: { conversations: [{ id: 'ops', listen: 'mentions' }] } } },
    policy: { sources: { webhook: { allowed: [{ id: 'alice' }] } } },
  }))
  // 레지스트리가 board에서 kind의 상태 항목을 차지하고, 테스트는 거기서 읽는다.
  const board = new HealthBoard()
  const sources = new SourceRegistry(() => store.settings(), board)
  sources.register(webhookKind)
  const engine = new Engine({ repo: store, scope: sources, policy: () => settingsPolicy(store.settings(), sources),
    assessor: { request: vi.fn() }, executor: { start: vi.fn(), deliver: vi.fn(), stop: vi.fn() },
    outbox: { send: vi.fn(), status: () => undefined, withdraw: vi.fn() } })
  const commands = new Commands(() => testDeployment(), {}, new AbortController().signal)
  const receive = vi.fn((trigger: Trigger) => { const result = engine.receive(trigger); engine.evaluateDue(); return result })
  // Source 자신의 알림은 outbox로 간다. 여기서 outbox는 영수증만 남기고 아무것도 보내지 않는다.
  const deps: SourceContextDeps = { store, engine, outbox: { send: message => { store.receipts.add(message) } }, commands, sources,
    deployment: testDeployment(), ready: Promise.resolve(), configured: () => true, receive, ...overrides }
  return { ...deps, store, engine, commands, receive, health: board.all, ctx: sourceContextOf(deps, webhookKind) }
}
/** `hookq`가 응답하는 큐. */
function queue(h: ReturnType<typeof host>, answer: () => unknown) {
  vi.spyOn(h.commands, 'withSignal').mockReturnValue(h.commands)
  return vi.spyOn(h.commands, 'run').mockImplementation(async () => JSON.stringify(answer()))
}

it('takes in what the queue holds after the cursor, once, and moves the cursor after it', async () => {
  const h = host()
  queue(h, () => ({ me: 'agent', items: [message('m1'), { id: 'broken' }, message('m2', { conversation: 'elsewhere' })], next: 3 }))
  expect(await pollQueue(h.ctx, new AbortController().signal)).toEqual({ read: 3, unreadable: 1 })
  expect(await h.receive.mock.results[0]!.value).toBe('stored')
  expect(await h.receive.mock.results[1]!.value).toBe('filtered')
  expect(h.store.get(KV.webhook.cursor)).toBe(3)
  // 에이전트를 멘션한 허용 발신자는 explicit 요청을 만든다.
  expect(h.engine.candidate(key('webhook', 'm1'))?.strength).toBe('explicit')
  await pollQueue(h.ctx, new AbortController().signal)
  expect(await h.receive.mock.results[2]!.value).toBe('duplicate')
  h.store.close()
})
```

`message(id, fields)`는 큐 항목을 만든다. 적어도 다음을 다룬다.

- 변환: 안정적인 id, Thread, actor, `human`과 `addressed`, 에이전트 자신의 메시지에는 Trigger 없음
- 한 회차: Trigger가 한 번만 저장되고, 범위 밖 하나는 `filtered`가 되고, 커서가 그 뒤로 옮겨지고, 허용 발신자의 멘션이 `explicit`로 평가됨
- 중간에 끊긴 회차는 커서를 그대로 둠
- `send`: `sent`, 410일 때만 `gone`, 그 밖의 실패에는 예외. CLI 오류는 `commandError`로 만든다
- Thread 맥락: 한 페이지의 메시지와 다음 페이지 커서. `tests/registry.spec.ts`가 `SourceRegistry.threadContext`로 kind의 Thread를 읽는 방식대로 한다
- 플러그인: `apply`가 kind를 등록하고 설정을 기다리는 동안 `setupPending`을 알림, disposer가 kind 등록을 풂, 루프를 빠져나온 실패가 처리되지 않은 rejection이 아니라 Source의 상태가 됨
- Policy 중 Source의 부분과 admission 행. `tests/registry.spec.ts`와 `tests/policy.spec.ts`가 Feishu Source를 검사하는 방식대로 한다

### 점검 목록

1. Trigger, Thread, actor, Channel 주소, 수신 범위를 대응시킨다.
2. kind를 쓴다. `schema`, `fields`, `health`, 그리고 설정 과정이 알아내는 값이 있으면 `facts`를 쓴다.
3. 이벤트를 안정적인 id의 Trigger로 바꾸고 에이전트 자신의 것은 버린다.
4. Source가 무엇을 받을지 `scope`에서 `meta`만으로 정한다.
5. Channel을 준다. 그 `send`는 메시지마다 한 번만 올리고, 대화가 영영 받을 수 없을 때만 `gone`을 답한다.
6. Thread를 읽을 수 있다면 평가에 Thread 맥락을 준다.
7. `allowed`와 admission 행을 가진 Policy 부분을 준다.
8. 실행 환경 변수를 등록한다.
9. 플러그인 엔트리와 루프를 쓴다. 루프는 설정을 기다리고, 스위치를 따르고, `receive` 뒤에 커서를 옮기고, 오류를 항목별로 다루고, 상태를 알리고, 중단 신호에 멈춘다. 커서 이름은 `KV`에 둔다.
10. 빌드 엔트리, export, `cordis.patch.yml` insert를 추가하고 007의 표에 모듈과 spec을 올린다.
11. `tests/sources.spec.ts`가 다른 Source를 테스트하는 방식대로 테스트한다.
