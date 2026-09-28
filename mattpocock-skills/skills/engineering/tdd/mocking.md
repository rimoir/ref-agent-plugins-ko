# 언제 모킹하는가

**시스템 경계**에서만 모킹한다.

- 외부 API(결제, 이메일 등)
- 데이터베이스(경우에 따라서만. 되도록 테스트용 DB를 쓴다)
- 시간/무작위 값
- 파일 시스템(경우에 따라)

다음은 모킹하지 않는다.

- 직접 만든 클래스/모듈
- 내부 협력 객체
- 직접 제어할 수 있는 모든 것

## 모킹하기 쉬운 설계

시스템 경계에서는 모킹하기 쉬운 인터페이스를 설계한다.

**의존성 주입을 쓴다**

외부 의존성을 내부에서 생성하지 말고 인자로 넘겨받는다.

```typescript
// 모킹하기 쉽다
function processPayment(order, paymentClient) {
  return paymentClient.charge(order.total);
}

// 모킹하기 어렵다
function processPayment(order) {
  const client = new StripeClient(process.env.STRIPE_KEY);
  return client.charge(order.total);
}
```

**범용 fetch 함수보다 SDK 형태의 인터페이스를 쓴다**

조건 분기가 들어간 범용 함수 하나 대신 외부 작업마다 전용 함수를 만든다.

```typescript
// GOOD: 함수마다 따로 모킹할 수 있다
const api = {
  getUser: (id) => fetch(`/users/${id}`),
  getOrders: (userId) => fetch(`/users/${userId}/orders`),
  createOrder: (data) => fetch('/orders', { method: 'POST', body: data }),
};

// BAD: 모킹하려면 mock 안에 조건 분기가 필요하다
const api = {
  fetch: (endpoint, options) => fetch(endpoint, options),
};
```

SDK 방식의 이점은 다음과 같다.
- mock마다 정해진 형태 하나만 반환한다
- 테스트 준비 코드에 조건 분기가 없다
- 테스트가 어느 엔드포인트를 쓰는지 알아보기 쉽다
- 엔드포인트마다 타입 안전성을 얻는다
