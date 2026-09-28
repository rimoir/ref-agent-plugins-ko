# 요청 속도 제한

**작업:** "사용자가 요청을 연달아 마구 보내지 못하게 내 FastAPI 엔드포인트에 요청 속도 제한을 추가해 줘."

벤치마크 실행에서 나온 모델 출력을 그대로 옮겼다. 모델은 Claude Haiku 4.5이고, 스킬 없는 조건과 ponytail 조건을 temperature 1로 비교했다. 출처는 `benchmarks/output.json`이다. 재현하려면 `npx promptfoo@latest eval -c benchmarks/promptfooconfig.yaml`을 실행한다.

## Ponytail 없이, 코드 128줄

# FastAPI의 요청 속도 제한

가장 간단한 방법부터 가장 견고한 방법까지 여러 방식을 소개합니다.

## 1. **`slowapi` 사용 (권장 - 가장 쉬움)**

```bash
pip install slowapi
```

```python
from fastapi import FastAPI, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi.responses import JSONResponse

app = FastAPI()

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, lambda request, exc: JSONResponse(
    status_code=429,
    content={"detail": "Rate limit exceeded"}
))

@app.get("/api/data")
@limiter.limit("5/minute")
async def get_data(request: Request):
    return {"message": "Success"}
```

**요청 속도 제한 형식:**
- `"5/minute"` - 분당 요청 5회
- `"100/hour"` - 시간당 요청 100회
- `"1000/day"` - 하루 요청 1000회

---

## 2. **`limits` 라이브러리 사용 (더 세밀한 제어)**

```bash
pip install limits
```

```python
from fastapi import FastAPI, HTTPException, Request
from limits import parse
from limits.storage import MemoryStorage
from limits.strategies import MovingWindowRateLimiter

app = FastAPI()

storage = MemoryStorage()
limiter = MovingWindowRateLimiter(storage)
rate_limit = parse("5/minute")

@app.get("/api/data")
async def get_data(request: Request):
    client_id = request.client.host
    
    if not limiter.hit(rate_limit, client_id):
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    
    return {"message": "Success"}
```

---

## 3. **직접 만든 미들웨어 (완전한 제어)**

```python
from fastapi import FastAPI, HTTPException, Request
from datetime import datetime, timedelta
from collections import defaultdict
import asyncio

app = FastAPI()

# Store request timestamps per IP
request_history = defaultdict(list)
RATE_LIMIT = 5  # requests
TIME_WINDOW = 60  # seconds

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host
    now = datetime.now()
    
    # Clean old requests outside time window
    request_history[client_ip] = [
        req_time for req_time in request_history[client_ip]
        if now - req_time < timedelta(seconds=TIME_WINDOW)
    ]
    
    # Check if limit exceeded
    if len(request_history[client_ip]) >= RATE_LIMIT:
        return JSONResponse(
            status_code=429,
            content={"detail": "Rate limit exceeded"}
        )
    
    # Record this request
    request_history[client_ip].append(now)
    
    return await call_next(request)

@app.get("/api/data")
async def get_data():
    return {"message": "Success"}
```

---

## 4. **사용자별 요청 속도 제한 (인증 포함)**

```python
from fastapi import FastAPI, Depends, HTTPException
from slowapi import Limiter
from slowapi.util import get_remote_address

app = FastAPI()
limiter = Limiter(key_func=get_remote_address)

def get_user_id(token: str = Header(None)) -> str:
    # Your auth logic here
    return token or "anonymous"

@app.get("/api/data")
@limiter.limit("10/minute")
async def get_data(request: Request, user_id: str = Depends(get_user_id)):
    return {"message": f"Success for {user_id}"}
```

---

## 5. **Redis 기반 요청 속도 제한 (운영 환경)**

```bash
pip install slowapi redis
```

```python
from fastapi import FastAPI, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.storage import RedisStorage
from redis import Redis
from fastapi.responses import JSONResponse

redis_client = Redis.from_url("redis://localhost:6379")
storage = RedisStorage(redis_client)
limiter = Limiter(key_func=get_remote_address, storage=storage)

app = FastAPI()
app.state.limiter = limiter

app.add_exception_handler(
    RateLimitExceeded,
    lambda request, exc: JSONResponse(
        status_code=429,
        content={"detail": "Rate limit exceeded"}
    )
)

@app.get("/api/data")
@limiter.limit("5/minute")
async def get_data(request: Request):
    return {"message": "Success"}
```

---

## 6. **여러 엔드포인트를 다루는 전체 예제**

```python
from fastapi import FastAPI, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi.responses import JSONResponse

app = FastAPI()
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={
            "detail": "Too many requests",
            "retry_after": exc.detail
        }
    )

# Strict limit
@app.post("/api/login")
@limiter.limit("3/minute")
async def login(request: Request):
    return {"token": "xxx"}

# Moderate limit
@app.get("/api/data")
@limiter.limit("30/minute")
async def get_data(request: Request):
    return {"data": []}

# Generous limit
@app.get("/api/public")
@limiter.limit("100/minute")
async def get_public(request: Request):
    return {"public": "data"}
```

---

## 비교표

| 방식 | 장점 | 단점 | 적합한 경우 |
|--------|------|------|----------|
| **slowapi** | 쉬움, 데코레이터 방식 | 메모리 저장만 지원 | 개발, 작은 앱 |
| **limits** | 유연함, 여러 백엔드 지원 | 설정이 더 많음 | 직접 만든 로직 |
| **미들웨어** | 완전한 제어, 의존성 없음 | 정리를 직접 해야 함 | 학습, 단순한 경우 |
| **Redis** | 분산 처리, 확장 가능 | Redis 필요 | 운영 환경, 다중 서버 |

---

## 요청 속도 제한 테스트

```python
import httpx

async def test_rate_limit():
    async with httpx.AsyncClient(app=app, base_url="http://test") as client:
        for i in range(6):
            response = await client.get("/api/data")
            print(f"Request {i+1}: {response.status_code}")
            # First 5 should be 200, 6th should be 429
```

**추천:** 대부분은 `slowapi`를 쓰세요. 가장 널리 쓰이고 구현하기도 가장 쉽습니다! 🚀

## Ponytail 적용, 코드 10줄

```python
from fastapi import FastAPI, HTTPException
from slowapi import Limiter
from slowapi.util import get_remote_address

app = FastAPI()
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.get("/api/endpoint")
@limiter.limit("10/minute")
async def my_endpoint(request):
    return {"status": "ok"}
```

생략: 직접 만든 요청 속도 제한 로직, Redis, 슬라이딩 윈도. `slowapi`가 처리합니다. 추가가 필요한 경우: 여러 서버에 걸친 분산 요청 속도 제한이 필요하면 `Limiter`를 Redis 백엔드로 바꾸고, 사용자별 제한이 필요하면 `key_func=lambda r: r.headers.get("authorization")`를 추가하세요.

**코드 128 → 10줄**, 같은 모델, 같은 프롬프트.
