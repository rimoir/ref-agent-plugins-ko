# 무한 스크롤

**과제:** "사용자가 맨 아래까지 스크롤하면 항목을 더 불러와 줘."

## Ponytail 없이

```bash
npm install react-infinite-scroll-component
```

```jsx
import InfiniteScroll from "react-infinite-scroll-component";

export function Feed({ items, fetchMore, hasMore }) {
  return (
    <InfiniteScroll
      dataLength={items.length}
      next={fetchMore}
      hasMore={hasMore}
      loader={<Spinner />}
      endMessage={<p>No more items</p>}
      scrollThreshold={0.9}
    >
      {items.map(item => <Card key={item.id} item={item} />)}
    </InfiniteScroll>
  );
}
```

스크롤 위치를 감시하다가 콜백을 호출하는 일 하나에 의존성을 추가한다.

## Ponytail 적용

```jsx
// ponytail: IntersectionObserver does this, no scroll listener needed
import { useEffect, useRef } from "react";

export function Feed({ items, fetchMore, hasMore }) {
  const sentinel = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMore) fetchMore();
    });
    if (sentinel.current) observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [hasMore, fetchMore]);

  return (
    <>
      {items.map(item => <Card key={item.id} item={item} />)}
      <div ref={sentinel} />
    </>
  );
}
```

**의존성 1개 → 의존성 0개.** `IntersectionObserver`는 감시용 요소(sentinel)가 뷰포트에 들어올 때만 콜백을 호출한다. scroll 이벤트도, 스로틀링도, 화면 끊김도 없다. 모든 브라우저에 들어 있다. 이 라이브러리가 감싸는 것이 바로 이 API다.
