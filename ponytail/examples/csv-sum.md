# CSV 합계

**과제:** "sales.csv를 읽어서 'amount' 열을 합산하는 Python 코드를 작성해 줘."

벤치마크 실행에서 나온 모델 출력을 그대로 실었다. 모델은 Claude Haiku 4.5이고, 스킬을 쓰지 않은 조건과 ponytail을 켠 조건을 비교했다. temperature는 1이고 출처는 `benchmarks/output.json`이다. 재현하려면 `npx promptfoo@latest eval -c benchmarks/promptfooconfig.yaml`을 실행한다.

## Ponytail 없이, 코드 20줄

# sales.csv를 읽어 'amount' 열을 합산하는 Python 코드

```python
import pandas as pd

# CSV 파일을 읽는다
df = pd.read_csv('sales.csv')

# 'amount' 열을 합산한다
total_amount = df['amount'].sum()

# 결과를 출력한다
print(f"Total amount: ${total_amount:,.2f}")
```

## 다른 방법:

**CSV 모듈 사용(pandas 없이):**
```python
import csv

total_amount = 0

with open('sales.csv', 'r') as file:
    reader = csv.DictReader(file)
    for row in reader:
        total_amount += float(row['amount'])

print(f"Total amount: ${total_amount:,.2f}")
```

**오류 처리를 넣은 pandas 사용:**
```python
import pandas as pd

try:
    df = pd.read_csv('sales.csv')
    total_amount = df['amount'].sum()
    print(f"Total amount: ${total_amount:,.2f}")
except FileNotFoundError:
    print("Error: sales.csv not found")
except KeyError:
    print("Error: 'amount' column not found")
```

**pandas 방법을 권장합니다.** 이유는 다음과 같습니다.
- 더 간결하고 읽기 쉬움
- 데이터 타입을 자동으로 처리함
- 오류 처리 기능이 내장됨
- 큰 파일도 효율적으로 처리함

## Ponytail 적용, 코드 3줄

```python
import csv

total = sum(float(row['amount']) for row in csv.DictReader(open('sales.csv')))
print(total)
```

생략: pandas, 오류 처리, 파일 닫기. CSV가 크거나, 형식이 깨졌거나, 더 많은 분석이 필요할 때 추가하세요.

**코드 20줄 → 3줄**, 같은 모델, 같은 프롬프트.
