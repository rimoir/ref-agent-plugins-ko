# ponytail-mcp

Ponytail의 게으른 시니어 개발자 지침을 제공하는 MCP 서버다. Claude 훅과 Pi 확장이
쓰는 것과 같은 규칙 묶음을 내보내므로 어느 호스트에서든 똑같은 규칙이 나온다.

항상 켜져 있는 어댑터를 대신하지는 않는다. Ponytail은 보통 매 턴 시스템 컨텍스트에
들어간다. MCP 프롬프트는 사용자가 직접 호출해야 하고, 여러 호스트에서 공통으로 쓸 수 있는
"매 턴 이 내용을 넣어라" 기능이 MCP에는 없다. 그래서 이 서버는 지침을 넣을 수 있는 곳이
프롬프트 메뉴뿐이거나 도구로 컨텍스트를 가져오는 MCP 호스트에 알맞은 선택지다. 이슈 #70을 참고한다.

## 제공하는 것

- 프롬프트 `ponytail`: 규칙 묶음을 사용자 메시지로 돌려준다. 선택 인자 `mode`에는
  `lite`, `full`, `ultra` 중 하나를 넣는다. 생략하면 설정된 기본값을 쓴다.
- 도구 `ponytail_instructions`: 같은 텍스트에 `structuredContent`
  (`{ mode, instructions }`)를 더해 돌려준다. 도구나 코드 실행으로 컨텍스트를 가져오는
  호스트용이다. 읽기 전용이다.

모드를 정할 때 `hooks/ponytail-config.js`를 그대로 쓰므로 `PONYTAIL_DEFAULT_MODE`와
`~/.config/ponytail/config.json`이 다른 곳과 똑같이 동작한다.

## 실행

```bash
cd ponytail-mcp
npm install
node index.js        # stdio로 MCP 통신
```

MCP 호스트가 이 명령을 실행하도록 설정한다. 클라이언트 설정 예시:

```json
{ "mcpServers": { "ponytail": { "command": "node", "args": ["ponytail-mcp/index.js"] } } }
```

## 테스트

```bash
npm test
```

모드 결정과 지침 텍스트를 검사한다. `index.js`의 MCP 연결 코드는 일부러 최소한으로
작성했다. 프롬프트와 도구를 `buildInstructions`에 연결하기만 한다.
