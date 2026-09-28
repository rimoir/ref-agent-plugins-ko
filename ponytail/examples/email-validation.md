# 이메일 검증

**작업:** "이메일 주소를 검증하는 Python 함수를 작성해 줘."

벤치마크 실행에서 나온 모델 출력을 그대로 옮겼다. 모델은 Claude Haiku 4.5이고, 스킬 없는 조건과 ponytail 조건을 temperature 1로 비교했다. 출처는 `benchmarks/output.json`이다. 재현하려면 `npx promptfoo@latest eval -c benchmarks/promptfooconfig.yaml`을 실행한다.

## Ponytail 없이, 코드 75줄

# 이메일 검증 함수

이메일 주소를 검증하는 실용적인 Python 함수입니다.

```python
import re

def validate_email(email: str) -> bool:
    """
    Validates an email address using a regular expression.
    
    Args:
        email (str): The email address to validate
        
    Returns:
        bool: True if valid, False otherwise
    """
    # Regular expression pattern for email validation
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    return re.match(pattern, email) is not None


# Test cases
if __name__ == "__main__":
    test_emails = [
        "user@example.com",           # Valid
        "john.doe@company.co.uk",     # Valid
        "test+tag@domain.org",        # Valid
        "invalid.email@",             # Invalid
        "missing@domain",             # Invalid
        "@nodomain.com",              # Invalid
        "spaces in@email.com",        # Invalid
        "user@domain..com",           # Invalid (double dot)
    ]
    
    for email in test_emails:
        result = validate_email(email)
        print(f"{email:<30} -> {result}")
```

## 더 견고한 버전 (추가 검사 포함)

```python
import re

def validate_email_advanced(email: str) -> tuple[bool, str]:
    """
    Advanced email validation with detailed feedback.
    
    Args:
        email (str): The email address to validate
        
    Returns:
        tuple: (is_valid, message)
    """
    # Basic checks
    if not email or not isinstance(email, str):
        return False, "Email must be a non-empty string"
    
    email = email.strip()
    
    if len(email) > 254:
        return False, "Email is too long (max 254 characters)"
    
    # Regular expression pattern
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    if not re.match(pattern, email):
        return False, "Email format is invalid"
    
    # Additional checks
    local_part, domain = email.rsplit('@', 1)
    
    if len(local_part) > 64:
        return False, "Local part is too long (max 64 characters)"
    
    if local_part.startswith('.') or local_part.endswith('.'):
        return False, "Local part cannot start or end with a dot"
    
    if '..' in email:
        return False, "Email cannot contain consecutive dots"
    
    return True, "Email is valid"


# Test the advanced version
if __name__ == "__main__":
    test_emails = [
        "user@example.com",
        "invalid..email@domain.com",
        ".invalid@domain.com",
        "user@domain",
    ]
    
    for email in test_emails:
        is_valid, message = validate_email_advanced(email)
        print(f"{email:<35} -> {is_valid:5} ({message})")
```

## 서드파티 라이브러리 사용 (운영 환경 권장)

```python
from email_validator import validate_email, EmailNotValidError

def validate_email_production(email: str) -> bool:
    """
    Validates email using the email_validator library.
    More reliable for production use.
    
    Install with: pip install email-validator
    """
    try:
        # Validate and normalize the email
        valid = validate_email(email)
        return True
    except EmailNotValidError:
        return False


# Usage
if __name__ == "__main__":
    print(validate_email_production("user@example.com"))  # True
    print(validate_email_production("invalid@"))          # False
```

## 비교

| 방식 | 장점 | 단점 |
|--------|------|------|
| **정규식 (간단)** | 빠름, 의존성 없음 | 검증 범위가 좁음 |
| **정규식 (고급)** | 더 꼼꼼함 | 여전히 RFC를 따르지 않음 |
| **email-validator** | RFC 준수, 믿을 수 있음 | 외부 의존성 |

**추천**: 운영 환경 애플리케이션에는 `email-validator` 라이브러리를 쓰세요. RFC 5321/5322 표준을 제대로 처리합니다. 간단한 스크립트이거나 의존성을 피하고 싶을 때는 간단한 정규식 버전을 쓰세요.

## Ponytail 적용, 코드 3줄

```python
import re

def is_valid_email(email: str) -> bool:
    return bool(re.match(r'^[^@]+@[^@]+\.[^@]+$', email))
```

생략: RFC 5322 파서, DNS MX 조회, 확인 메일. `user+tag@sub.domain.co.uk`를 실제로 거부해야 하거나 오타를 잡아야 할 때 추가하세요. 그전까지는 이 코드가 "앗, 잘못 입력했다" 같은 경우의 99%를 잡아냅니다.

**코드 75 → 3줄**, 같은 모델, 같은 프롬프트.
