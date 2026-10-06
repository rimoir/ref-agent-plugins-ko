# 카운트다운 타이머

**작업:** "주어진 초부터 거꾸로 세는 카운트다운 타이머 컴포넌트를 React로 만들어 줘."

벤치마크 실행에서 나온 모델 출력을 그대로 옮겼다. 모델은 Claude Haiku 4.5이고, 스킬 없는 조건과 ponytail 조건을 temperature 1로 비교했다. 출처는 `benchmarks/output.json`이다. 재현하려면 `npx promptfoo@latest eval -c benchmarks/promptfooconfig.yaml`을 실행한다.

## Ponytail 없이, 코드 267줄

# React 카운트다운 타이머 컴포넌트

여러 변형을 담은 완전한 카운트다운 타이머 컴포넌트입니다.

## 기본 카운트다운 타이머

```jsx
import { useState, useEffect } from 'react';

export function CountdownTimer({ initialSeconds = 60 }) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;

    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(seconds => seconds - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
    }

    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const toggle = () => setIsActive(!isActive);
  const reset = () => {
    setSeconds(initialSeconds);
    setIsActive(false);
  };

  return (
    <div className="countdown-timer">
      <div className="timer-display">{seconds}s</div>
      <div className="timer-controls">
        <button onClick={toggle}>
          {isActive ? 'Pause' : 'Start'}
        </button>
        <button onClick={reset}>Reset</button>
      </div>
    </div>
  );
}
```

## 시간 형식 표시를 갖춘 고급 타이머

```jsx
import { useState, useEffect } from 'react';

export function AdvancedCountdownTimer({ 
  initialSeconds = 3600,
  onComplete = () => {},
  showMilliseconds = false 
}) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsActive(false);
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, onComplete]);

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts = [];
    if (hours > 0) parts.push(String(hours).padStart(2, '0'));
    parts.push(String(minutes).padStart(2, '0'));
    parts.push(String(seconds).padStart(2, '0'));

    return parts.join(':');
  };

  const toggle = () => setIsActive(!isActive);
  const reset = () => {
    setTimeLeft(initialSeconds);
    setIsActive(false);
  };

  const progressPercent = ((initialSeconds - timeLeft) / initialSeconds) * 100;

  return (
    <div className="advanced-timer">
      <div className="timer-display">
        {formatTime(timeLeft)}
      </div>
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <div className="timer-controls">
        <button onClick={toggle} className="btn-primary">
          {isActive ? '⏸ Pause' : '▶ Start'}
        </button>
        <button onClick={reset} className="btn-secondary">
          ↻ Reset
        </button>
      </div>
    </div>
  );
}
```

## 커스텀 훅 버전

```jsx
import { useState, useEffect, useCallback } from 'react';

export function useCountdown(initialSeconds) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;

    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(prev => prev - 1);
      }, 1000);
    } else if (seconds === 0 && isActive) {
      setIsActive(false);
    }

    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const start = useCallback(() => setIsActive(true), []);
  const pause = useCallback(() => setIsActive(false), []);
  const reset = useCallback(() => {
    setSeconds(initialSeconds);
    setIsActive(false);
  }, [initialSeconds]);

  return {
    seconds,
    isActive,
    start,
    pause,
    reset,
    setSeconds
  };
}

// 사용법
export function TimerWithHook() {
  const { seconds, isActive, start, pause, reset } = useCountdown(60);

  return (
    <div>
      <div>{seconds}s</div>
      <button onClick={isActive ? pause : start}>
        {isActive ? 'Pause' : 'Start'}
      </button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

## 애니메이션이 들어간 Styled Component

```jsx
import { useState, useEffect } from 'react';
import styled from 'styled-components';

const TimerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  color: white;
  font-family: 'Arial', sans-serif;
`;

const Display = styled.div`
  font-size: 48px;
  font-weight: bold;
  font-variant-numeric: tabular-nums;
  animation: ${props => props.isWarning ? 'pulse 0.5s infinite' : 'none'};

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const Controls = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background-color: ${props => props.variant === 'danger' ? '#ff6b6b' : '#4ecdc4'};
  color: white;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;

export function StyledCountdownTimer({ initialSeconds = 60 }) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;

    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(prev => prev - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
    }

    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const isWarning = seconds <= 10 && seconds > 0;

  return (
    <TimerContainer>
      <Display isWarning={isWarning}>{seconds}s</Display>
      <Controls>
        <Button onClick={() => setIsActive(!isActive)}>
          {isActive ? 'Pause' : 'Start'}
        </Button>
        <Button 
          variant="danger"
          onClick={() => {
            setSeconds(initialSeconds);
            setIsActive(false);
          }}
        >
          Reset
        </Button>
      </Controls>
    </TimerContainer>
  );
}
```

## CSS 스타일

```css
.countdown-timer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
  border: 2px solid #333;
  border-radius: 10px;
  background-color: #f5f5f5;
}

.timer-display {
  font-size: 48px;
  font-weight: bold;
  font-variant-numeric: tabular-nums;
  color: #333;
}

.timer-controls {
  display: flex;
  gap: 10px;
}

.timer-controls button {
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background-color: #667eea;
  color: white;
  transition: background-color 0.3s;
}

.timer-controls button:hover {
  background-color: #5568d3;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #667eea;
  transition: width 0.3s linear;
}
```

## 사용 예시

```jsx
// 기본 사용법
<CountdownTimer initialSeconds={30} />

// 콜백을 쓰는 고급 버전
<AdvancedCountdownTimer 
  initialSeconds={300}
  onComplete={() => alert('Time\'s up!')}
/>

// 훅 사용
<TimerWithHook />

// 스타일 적용 버전
<StyledCountdownTimer initialSeconds={60} />
```

## 기능

✅ **기본 타이머** - 시작/일시정지/초기화를 갖춘 간단한 카운트다운  
✅ **고급 타이머** - 시간 형식 표시(HH:MM:SS), 진행 막대, 콜백  
✅ **커스텀 훅** - 어느 컴포넌트에서나 재사용할 수 있는 로직  
✅ **Styled Components** - 애니메이션이 들어간 보기 좋은 UI  
✅ **경고 상태** - 시간이 얼마 남지 않으면 화면에 표시  
✅ **완료 콜백** - 타이머가 끝나면 코드 실행  

필요에 가장 잘 맞는 버전을 고르세요!

## Ponytail 적용, 코드 9줄

```jsx
export function CountdownTimer({ seconds }) {
  const [remaining, setRemaining] = React.useState(seconds);

  React.useEffect(() => {
    if (remaining <= 0) return;
    const timer = setInterval(() => setRemaining(r => r - 1), 1000);
    return () => clearInterval(timer);
  }, [remaining]);

  return <div>{remaining}s</div>;
}
```

생략: 일시정지/재개, 시간 형식 표시(mm:ss), 0초 알림음, 스타일. 필요할 때 추가하세요.

**코드 267 → 9줄**, 같은 모델, 같은 프롬프트.
