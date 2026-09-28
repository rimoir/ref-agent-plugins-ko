# 좋은 테스트와 나쁜 테스트

## 좋은 테스트

**통합 테스트 방식**: 내부 부품의 mock이 아니라 실제 인터페이스를 거쳐 테스트한다.

```typescript
// GOOD: 관찰할 수 있는 동작을 테스트한다
test("user can checkout with valid cart", async () => {
  const cart = createCart();
  cart.add(product);
  const result = await checkout(cart, paymentMethod);
  expect(result.status).toBe("confirmed");
});
```

특징:

- 사용자나 호출자가 신경 쓰는 동작을 테스트한다
- 공개 API만 쓴다
- 내부 리팩터링을 해도 깨지지 않는다
- 어떻게(HOW)가 아니라 무엇(WHAT)을 설명한다
- 테스트 하나에 논리적 단언 하나

## 나쁜 테스트

**구현 세부 테스트**: 내부 구조에 묶여 있다.

```typescript
// BAD: 구현 세부를 테스트한다
test("checkout calls paymentService.process", async () => {
  const mockPayment = jest.mock(paymentService);
  await checkout(cart, payment);
  expect(mockPayment.process).toHaveBeenCalledWith(cart.total);
});
```

경고 신호:

- 내부 협력 객체를 모킹한다
- private 메서드를 테스트한다
- 호출 횟수나 순서를 단언한다
- 동작은 그대로인데 리팩터링하면 테스트가 깨진다
- 테스트 이름이 무엇(WHAT)이 아니라 어떻게(HOW)를 설명한다
- 인터페이스가 아니라 외부 수단으로 검증한다

```typescript
// BAD: 인터페이스를 우회해 검증한다
test("createUser saves to database", async () => {
  await createUser({ name: "Alice" });
  const row = await db.query("SELECT * FROM users WHERE name = ?", ["Alice"]);
  expect(row).toBeDefined();
});

// GOOD: 인터페이스를 거쳐 검증한다
test("createUser makes user retrievable", async () => {
  const user = await createUser({ name: "Alice" });
  const retrieved = await getUser(user.id);
  expect(retrieved.name).toBe("Alice");
});
```

**동어반복 테스트**: 기대값이 구현을 되풀이하므로 테스트가 구조상 항상 통과한다.

```typescript
// BAD: 코드가 계산하는 방식 그대로 기대값을 다시 계산한다
test("calculateTotal sums line items", () => {
  const items = [{ price: 10 }, { price: 5 }];
  const expected = items.reduce((sum, i) => sum + i.price, 0);
  expect(calculateTotal(items)).toBe(expected);
});

// GOOD: 기대값이 코드와 독립된, 이미 아는 리터럴이다
test("calculateTotal sums line items", () => {
  expect(calculateTotal([{ price: 10 }, { price: 5 }])).toBe(15);
});
```
