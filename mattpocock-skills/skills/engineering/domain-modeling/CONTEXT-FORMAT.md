# CONTEXT.md 형식

## 구조

```md
# {컨텍스트 이름}

{이 컨텍스트가 무엇이고 왜 있는지 한두 문장으로 설명한다.}

## 용어

**Order**:
{이 용어를 한두 문장으로 설명한다}
_Avoid_: Purchase, transaction

**Invoice**:
배송 후 고객에게 보내는 결제 요청.
_Avoid_: Bill, payment request

**Customer**:
주문을 하는 개인이나 조직.
_Avoid_: Client, buyer, account
```

## 규칙

- **하나를 고른다.** 같은 개념을 가리키는 단어가 여러 개면 가장 좋은 하나를 고르고 나머지는 `_Avoid_` 아래에 나열한다.
- **정의를 짧게 쓴다.** 최대 한두 문장이다. 그것이 무엇을 하는지가 아니라 무엇*인지*를 정의한다.
- **이 프로젝트의 컨텍스트에만 있는 용어만 넣는다.** 일반적인 프로그래밍 개념(타임아웃, 오류 타입, 유틸리티 패턴)은 프로젝트에서 아무리 많이 쓰더라도 넣지 않는다. 용어를 추가하기 전에 이것이 이 컨텍스트에만 있는 개념인지, 일반적인 프로그래밍 개념인지 따져 본다. 앞의 경우만 넣는다.
- 용어들이 자연스럽게 무리를 이루면 **하위 제목 아래로 묶는다.** 모든 용어가 하나로 묶이는 영역에 속하면 목록을 나누지 않아도 된다.

## 단일 컨텍스트 저장소와 다중 컨텍스트 저장소

**단일 컨텍스트(대부분의 저장소):** 저장소 루트에 `CONTEXT.md` 하나를 둔다.

**다중 컨텍스트:** 저장소 루트의 `CONTEXT-MAP.md`에 컨텍스트 목록, 각 컨텍스트의 위치, 컨텍스트 사이의 관계를 적는다.

```md
# 컨텍스트 맵

## 컨텍스트

- [Ordering](./src/ordering/CONTEXT.md): 고객 주문을 받고 추적한다
- [Billing](./src/billing/CONTEXT.md): 청구서를 만들고 결제를 처리한다
- [Fulfillment](./src/fulfillment/CONTEXT.md): 창고 피킹과 배송을 관리한다

## 관계

- **Ordering → Fulfillment**: Ordering이 `OrderPlaced` 이벤트를 내보내고, Fulfillment가 이 이벤트를 받아 피킹을 시작한다
- **Fulfillment → Billing**: Fulfillment가 `ShipmentDispatched` 이벤트를 내보내고, Billing이 이 이벤트를 받아 청구서를 만든다
- **Ordering ↔ Billing**: `CustomerId`와 `Money` 타입을 공유한다
```

이 스킬은 어떤 구조인지 다음과 같이 판단한다.

- `CONTEXT-MAP.md`가 있으면 그 파일을 읽어 컨텍스트를 찾는다.
- 루트에 `CONTEXT.md`만 있으면 단일 컨텍스트다.
- 둘 다 없으면 첫 용어가 정해질 때 루트에 `CONTEXT.md`를 만든다.

컨텍스트가 여러 개면 지금 주제가 어느 컨텍스트에 해당하는지 판단한다. 분명하지 않으면 사용자에게 묻는다.
