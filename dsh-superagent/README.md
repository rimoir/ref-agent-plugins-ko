# dsh-superagent

> **참고용 연구 프로토타입이며 DeepSeek의 공식 제품이 아니다.** 이 코드는 우리 팀의 일상 개발 작업에서 자라났고, 엔지니어링의 상당 부분을 코딩 에이전트가 맡았다. 프로덕션용 소프트웨어가 아니라 연구 코드로 다뤄야 한다. 아직 버그가 있을 수 있고, 코딩 스타일과 엔지니어링 관행이 고르지 않을 수 있다. 자기 환경에서 쓰기 전에 검토하고 맞게 고친다.
>
> 공개하려고 손봤기 때문에 내부 버전이나 *Exploring Super-agent Design: Towards a More Autonomous Agent System*에서 설명한 구현과 똑같지 않다. 글에서 다룬 설계 가운데 일부는 앞으로의 개발 방향이며 이 프로토타입에는 구현돼 있지 않다.

dsh-superagent는 GitHub 저장소 하나를 맡는 능동형 코딩 에이전트이고, [DeepSeek Harness](https://www.deepseek.com/en/harness/)용 번들로 묶여 있다. GitHub를 듣고, 원하면 Feishu도 듣는다. 허용된 사람이 에이전트에게 일을 부탁하면 에이전트는 work item을 열고, 자기 에이전트 세션과 디렉터리에서 작업한 뒤, 원래 대화에 답한다. 예를 들면 pull request로 답한다. 웹 패널은 사람이 봐야 할 것을 보여 준다.

이것은 에이전트와 일하는 방식이기도 하다. **사람의 주의는 되도록 적게 쓰고, 가치는 되도록 많이 준다.** 팀 전체를 대신해 움직일 수 있는 에이전트는 팀 전체의 주의를 낭비할 수도 있다. 그래서 요청받았을 때나 팀이 쓴 규칙이 허락할 때만 움직이고, 누군가 행동해야 하거나 결과를 쓸 수 있을 때만 말한다. [docs/000-philosophy.md](docs/000-philosophy.md)가 이 원칙과 운영자에게 요구하는 것을 설명한다.

## 설치

설치는 단계가 많아서 에이전트가 함께 진행한다. 코딩 에이전트에게 이렇게 부탁한다.

> 이 저장소의 SETUP.md를 읽고 나랑 같이 dsh-superagent를 설치해 줘.

에이전트는 한 번에 짧은 질문 하나씩 묻고, 전체 계획을 한 번 보여 준 뒤, 모든 것을 설치하고 설정한다. 에이전트가 따르는 절차는 [SETUP.md](SETUP.md)다.

## 문서

번호 붙은 문서를 순서대로 읽는다. 각 문서는 앞의 문서만 바탕으로 한다.

- [000 철학](docs/000-philosophy.md)
- [001 도메인 모델](docs/001-domain.md)
- [002 권한 부여](docs/002-authorization.md)
- [003 실행](docs/003-execution.md)
- [004 프롬프트](docs/004-prompts.md)
- [005 패널](docs/005-panel.md)
- [006 배포](docs/006-deployment.md): 수동 설치, 설정, 업그레이드, 문제 해결
- [007 아키텍처](docs/007-architecture.md)
- [008 쿡북](docs/008-cookbook.md): Source 추가하기

## 개발

`pnpm check`가 타입 검사, 테스트, 빌드를 돌린다.

## 라이선스

[MIT](LICENSE)

이 폴더는 [deepseek-ai/dsh-superagent-prototype](https://github.com/deepseek-ai/dsh-superagent-prototype)을 한국어로 번역한 것이다. 마크다운 문서를 옮겼고 코드, 스크립트, 테스트는 원문 그대로다.
