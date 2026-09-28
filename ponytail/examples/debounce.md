# 디바운스

**작업:** "바닐라 JavaScript로 만든 검색 입력창에 디바운스를 넣어 줘. 지금은 키를 누를 때마다 API를 호출해."

벤치마크 실행에서 나온 모델 출력을 그대로 옮겼다. 모델은 Claude Haiku 4.5이고, 스킬 없는 조건과 ponytail 조건을 temperature 1로 비교했다. 출처는 `benchmarks/output.json`이다. 재현하려면 `npx promptfoo@latest eval -c benchmarks/promptfooconfig.yaml`을 실행한다.

## Ponytail 없이, 코드 116줄

# 검색 입력 디바운스

과도한 API 호출을 막는 실용적인 구현입니다.

## 기본 디바운스 함수

```javascript
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Usage
const searchInput = document.getElementById('search');
const resultsContainer = document.getElementById('results');

const handleSearch = async (query) => {
  if (!query.trim()) {
    resultsContainer.innerHTML = '';
    return;
  }
  
  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    displayResults(data);
  } catch (error) {
    console.error('Search failed:', error);
  }
};

// Debounce the search function (300ms delay)
const debouncedSearch = debounce(handleSearch, 300);

searchInput.addEventListener('input', (e) => {
  debouncedSearch(e.target.value);
});
```

## 로딩 상태를 추가한 개선 버전

```javascript
const searchInput = document.getElementById('search');
const resultsContainer = document.getElementById('results');
const loadingIndicator = document.getElementById('loading');

const handleSearch = async (query) => {
  if (!query.trim()) {
    resultsContainer.innerHTML = '';
    loadingIndicator.style.display = 'none';
    return;
  }
  
  loadingIndicator.style.display = 'block';
  
  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Search failed');
    
    const data = await response.json();
    displayResults(data);
  } catch (error) {
    resultsContainer.innerHTML = '<p class="error">Search failed. Try again.</p>';
    console.error('Search error:', error);
  } finally {
    loadingIndicator.style.display = 'none';
  }
};

const debouncedSearch = debounce(handleSearch, 300);

searchInput.addEventListener('input', (e) => {
  debouncedSearch(e.target.value);
});

function displayResults(data) {
  resultsContainer.innerHTML = data
    .map(item => `<div class="result">${item.title}</div>`)
    .join('');
}
```

## 고급: 취소와 즉시 실행 옵션을 갖춘 디바운스

```javascript
function debounce(func, delay, options = {}) {
  let timeoutId;
  let lastArgs;
  
  const debounced = function (...args) {
    lastArgs = args;
    clearTimeout(timeoutId);
    
    if (options.immediate && !timeoutId) {
      func(...args);
    }
    
    timeoutId = setTimeout(() => {
      if (!options.immediate) {
        func(...lastArgs);
      }
      timeoutId = null;
    }, delay);
  };
  
  // Allow manual cancellation
  debounced.cancel = () => clearTimeout(timeoutId);
  
  return debounced;
}

// Usage with options
const debouncedSearch = debounce(handleSearch, 300, { immediate: false });

// Cancel pending search if needed
searchInput.addEventListener('blur', () => {
  debouncedSearch.cancel();
});
```

## HTML 예제

```html
<div class="search-container">
  <input 
    type="text" 
    id="search" 
    placeholder="Search..."
    autocomplete="off"
  >
  <div id="loading" style="display: none;">Loading...</div>
  <div id="results"></div>
</div>

<style>
  .search-container {
    max-width: 500px;
    margin: 20px auto;
  }
  
  #search {
    width: 100%;
    padding: 10px;
    font-size: 16px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  #results {
    margin-top: 10px;
  }
  
  .result {
    padding: 10px;
    border-bottom: 1px solid #eee;
    cursor: pointer;
  }
  
  .result:hover {
    background-color: #f5f5f5;
  }
  
  .error {
    color: red;
    padding: 10px;
  }
</style>
```

## 주요 이점

| 기능 | 이점 |
|---------|---------|
| **디바운스** | 검색 한 번에 드는 API 호출을 100회 이상에서 1~2회로 줄임 |
| **300ms 지연** | 반응 속도와 성능 사이의 균형을 맞춤 |
| **로딩 상태** | 사용자에게 진행 상황을 보여 줌 |
| **오류 처리** | 실패해도 문제없이 처리함 |
| **취소 메서드** | 필요할 때 정리할 수 있음 |

**키 입력에 따른 일반적인 호출 감소:** 10글자 입력 = API 호출 10회 → 디바운스 적용 시 API 호출 1~2회 ✅

## Ponytail 적용, 코드 10줄

```javascript
const searchInput = document.querySelector('input[type="search"]');
let debounceTimer;

searchInput.addEventListener('input', (e) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    fetch(`/api/search?q=${encodeURIComponent(e.target.value)}`)
      .then(r => r.json())
      .then(data => console.log(data)); // replace with your render
  }, 300);
});
```

생략: 디바운스 유틸리티 함수, 클래스 래퍼, 설정 객체. `setTimeout` + `clearTimeout`이 곧 디바운스입니다. 입력창 3개 이상에 필요해지면 그때 유틸리티를 추가하세요.

**코드 116 → 10줄**, 같은 모델, 같은 프롬프트.
