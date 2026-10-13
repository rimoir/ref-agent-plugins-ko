# run1-toml: 보존한 실행 산출물

키트의 첫 dogfood에서 보존한 실행 산출물이다. toml 0.10.2(PyPI, MIT, uiri와 기여자들 작. 분석만 하고 vendoring하지 않음)를 마이그레이션했다. 실행할 수 있는 데모가 아니다.
패리티 하네스(`py_side.py` / `node_side.mjs`)가 로컬 클론을 보게 하려면 `TOML_SRC`(Python 소스 체크아웃)와 `TOML_TS_DIST`(빌드한 TypeScript dist)를 설정한다.
이 산출물의 근거 기록은 [../../RUN-NOTES.md](../../RUN-NOTES.md)를 본다.
