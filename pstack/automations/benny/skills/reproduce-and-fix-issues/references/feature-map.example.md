# 기능 맵 예시

Benny가 재현할 수 있는 사용자 대면 기능을 모두 맵에 적는다. 앱을 조작하기 전에 관련 섹션을 읽는다. 이 맵은 사용자 관점으로 유지한다. 내부 구조와 현재 코드 경로는 여기에 박아 두지 말고 런타임에 알아낸다.

이 파일을 `.cursor/automations/benny/` 바깥, 예를 들어 `.cursor/benny/feature-map.md`로 복사하고 `control.feature_map_path`를 그 사본으로 설정한다. 팩 갱신이 이 사본을 덮어써서는 안 된다.

## 기능별 템플릿

### `<feature name>`

`<one-line user-visible purpose>`

#### 사용자가 도달하는 방법

- 클릭 경로: `<screen> -> <menu, tab, or panel> -> <control>`
- 키보드 단축키: `<shortcut or none>`

#### 제어 어댑터가 조작하는 방법

- `<adapter action>`에 `<inputs>`를 주면 `<visible result>`가 나와야 한다.
- 초기화: `<how the adapter returns to a fresh state>`.

#### 안정적인 셀렉터

- `<role and accessible name>`
- `<ARIA relationship>`
- `<data-component or purpose-named data attribute>`

생성된 CSS나 StyleX 클래스, 동적 해시, 자식 인덱스, 깨지기 쉬운 DOM 위치는 절대 쓰지 않는다.

#### 실행해 볼 상태

- 기본, hover, focus-visible, active, disabled
- 로딩, 비어 있음, 오류
- 선택됨, 열림, 펼쳐짐
- `<relevant feature-specific variants>`

해당하지 않는 상태는 표시해 둔다.

#### 전제 조건과 준비

- 인증: `<account state>`
- 데이터: `<fixture>`
- 권한: `<role>`
- 플래그: `<flag or none>`
- 서비스: `<required availability>`

#### 증거와 교차 확인

- 스크린샷: `<app identity, feature, and discriminating state>`
- 영상: `<entry path, interaction, and final state>`
- 교차 확인: `<read-only state or value that confirms the UI>`

#### 주의할 점

- `<known dead end or wrong surface>`
- `<safe environment translation>`

## 가상 예시

아래 기능은 가상의 할 일 앱에 속한다. 예시일 뿐 Benny에 필수인 기능이 아니다.

### 로그인

사용자가 할 일 앱에 들어가게 한다.

#### 사용자가 도달하는 방법

- 앱을 열고 `Sign in`을 고른다. 단축키 없음.

#### 제어 어댑터가 조작하는 방법

- `open_app`, `click Sign in`, `fill credentials`, `click Continue`를 하면 항목 목록이 열려야 한다.
- 로그아웃하고 일회용 세션을 지워 초기화한다.

#### 안정적인 셀렉터

- 버튼 `Sign in`, 텍스트 상자 `Email`과 `Password`, `data-component="sign-in-form"`

#### 실행해 볼 상태

- 기본, focus-visible, 제출 중, disabled, 로딩, 오류

#### 전제 조건과 준비

- 일회용 계정과 사용 가능한 인증 서비스

#### 증거와 교차 확인

- 랜딩 페이지부터 항목 목록까지 녹화한다. 읽기 전용 세션 상태를 확인한다.

#### 주의할 점

- 마케팅 페이지는 잘못된 화면이다. 인증 서비스가 없으면 차단 사유다.

### 항목 목록과 상세

사용자가 항목을 둘러보고 하나를 열게 한다.

#### 사용자가 도달하는 방법

- `Items` 탭을 연 뒤 행 하나를 고른다.

#### 제어 어댑터가 조작하는 방법

- `select_tab Items`와 `click <fixture item>`을 하면 그 상세가 열려야 한다.
- 상세를 닫고 선택을 지워 초기화한다.

#### 안정적인 셀렉터

- `Items`라는 이름의 탭과 목록, fixture 이름이 붙은 행, `data-component="item-detail"`

#### 실행해 볼 상태

- 로딩, 비어 있음, 오류, 선택됨, 열림, 펼쳐짐

#### 전제 조건과 준비

- 이름이 붙은 fixture 항목, 읽기 권한, 사용 가능한 항목 서비스

#### 증거와 교차 확인

- 선택과 그에 맞는 상세 제목을 보여 준다. 선택된 항목 ID를 확인한다.

#### 주의할 점

- 검색 결과는 비슷해 보여도 다른 경로를 쓸 수 있다.

### 항목 편집기

사용자가 항목을 만들거나 편집하게 한다.

#### 사용자가 도달하는 방법

- 상세에서 `Edit`를, 또는 목록에서 `New item`을 고른다.

#### 제어 어댑터가 조작하는 방법

- `click Edit`, `fill <field>`, `click Save`를 하면 상세가 업데이트돼야 한다.
- fixture를 복원해 초기화한다.

#### 안정적인 셀렉터

- 버튼 `Edit`, `New item`, `Save`, 폼 `Item editor`, 라벨과 연결된 필드

#### 실행해 볼 상태

- 기본, focus-visible, 변경됨(dirty), 검증 중, disabled, 저장 중, 오류, 성공

#### 전제 조건과 준비

- 편집 가능한 fixture, 쓰기 권한, 사용 가능한 저장 서비스

#### 증거와 교차 확인

- 필드 변경부터 업데이트된 상세까지 보여 준다. 저장된 항목 값을 읽기 전용으로 확인한다.

#### 주의할 점

- 폼 상태를 주입하지 않는다. 읽기 전용 상세 필드는 편집기가 아니다.

### 설정

사용자가 개인 환경설정을 바꾸게 한다.

#### 사용자가 도달하는 방법

- 프로필 메뉴를 연 뒤 `Settings`를 고른다.

#### 제어 어댑터가 조작하는 방법

- `open_menu Profile`, `click Settings`, `toggle <preference>`를 하면 컨트롤이 업데이트돼야 한다.
- 시작 시점의 환경설정을 복원해 초기화한다.

#### 안정적인 셀렉터

- 버튼 `Profile`, 메뉴 항목 `Settings`, 영역 `Settings`, 목적을 드러내는 이름의 환경설정 속성

#### 실행해 볼 상태

- 닫힘, 열림, 선택됨, focus-visible, disabled, 로딩, 오류

#### 전제 조건과 준비

- 로그인된 테스트 계정, 알려진 환경설정, 사용 가능한 환경설정 서비스

#### 증거와 교차 확인

- 메뉴 경로와 최종 컨트롤 상태를 보여 준다. 환경설정 값을 읽기 전용으로 확인한다.

#### 주의할 점

- 운영체제 설정은 다른 화면이다.

## 완성도 체크리스트

- 재현 가능한 사용자 대면 기능마다 섹션이 있다.
- 섹션마다 사용자 경로, 어댑터 액션, 초기화를 밝힌다.
- 셀렉터는 role, 이름, ARIA, 안정적인 컴포넌트 마커, 목적을 드러내는 이름의 속성을 쓴다.
- 생성된 클래스나 DOM 위치를 쓰는 셀렉터가 없다.
- 관련된 상호작용, 로딩, 비어 있음, 오류, 선택됨, 펼쳐짐 상태를 다룬다.
- 인증, fixture, 권한, 플래그, 서비스를 명시한다.
- 스크린샷, 영상, 그 밑의 교차 확인 요구 사항을 명시한다.
- 잘못된 화면, 막다른 길, 안전한 환경 변환을 나열한다.
- 구현 세부는 런타임에 알아낼 대상으로 남겨 둔다.
