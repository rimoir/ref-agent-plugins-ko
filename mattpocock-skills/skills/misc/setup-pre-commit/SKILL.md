---
name: setup-pre-commit
description: "현재 저장소에 lint-staged(Prettier), 타입 검사, 테스트를 실행하는 Husky pre-commit 훅을 설정한다. 사용자가 pre-commit 훅을 추가하거나, Husky를 설정하거나, lint-staged를 구성하거나, 커밋할 때 포맷팅, 타입 검사, 테스트를 실행하게 하고 싶을 때 쓴다."
---

# Pre-Commit 훅 설정

## 설정하는 것

- **Husky** pre-commit 훅
- 스테이징된 모든 파일에 Prettier를 실행하는 **lint-staged**
- **Prettier** 설정(없는 경우)
- pre-commit 훅 안의 **typecheck**와 **test** 스크립트

## 단계

### 1. 패키지 매니저 확인

`package-lock.json`(npm), `pnpm-lock.yaml`(pnpm), `yarn.lock`(yarn), `bun.lockb`(bun)가 있는지 본다. 있는 것을 쓴다. 분명하지 않으면 npm을 쓴다.

### 2. 의존성 설치

devDependencies로 설치한다.

```
husky lint-staged prettier
```

### 3. Husky 초기화

```bash
npx husky init
```

이 명령은 `.husky/` 디렉터리를 만들고 package.json에 `prepare: "husky"`를 추가한다.

### 4. `.husky/pre-commit` 만들기

이 파일을 쓴다(Husky v9 이상에서는 shebang이 필요 없다).

```
npx lint-staged
npm run typecheck
npm run test
```

**맞춰 고치기**: `npm`을 확인한 패키지 매니저로 바꾼다. package.json에 `typecheck`나 `test` 스크립트가 없으면 그 줄을 빼고 사용자에게 알린다.

### 5. `.lintstagedrc` 만들기

```json
{
  "*": "prettier --ignore-unknown --write"
}
```

### 6. `.prettierrc` 만들기(없는 경우)

Prettier 설정이 하나도 없을 때만 만든다. 아래 기본값을 쓴다.

```json
{
  "useTabs": false,
  "tabWidth": 2,
  "printWidth": 80,
  "singleQuote": false,
  "trailingComma": "es5",
  "semi": true,
  "arrowParens": "always"
}
```

### 7. 확인

- [ ] `.husky/pre-commit`이 있고 실행 권한이 있다.
- [ ] `.lintstagedrc`가 있다.
- [ ] package.json의 `prepare` 스크립트가 `"husky"`다.
- [ ] `prettier` 설정이 있다.
- [ ] `npx lint-staged`를 실행해 동작하는지 확인한다.

### 8. 커밋

바뀌거나 새로 만든 파일을 모두 스테이징하고 `Add pre-commit hooks (husky + lint-staged + prettier)` 메시지로 커밋한다.

이 커밋은 새 pre-commit 훅을 거치므로, 모든 설정이 동작하는지 빠르게 확인하는 테스트가 된다.

## 참고

- Husky v9 이상은 훅 파일에 shebang이 필요 없다.
- `prettier --ignore-unknown`은 Prettier가 해석하지 못하는 파일(이미지 등)을 건너뛴다.
- pre-commit은 lint-staged(빠르고 스테이징된 파일만 다룬다)를 먼저 실행하고, 그다음 전체 타입 검사와 테스트를 실행한다.
