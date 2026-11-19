### Autopilot-stack

Autopilot-full 플레이북을 돌리되 머지하지 않는다.

1. **5단계 대신 검증에서 멈춘다.** 각 PR이 현재 head에서 검증되고 green이면 멈추고 PR들을 운영자에게 넘긴다. 넘긴 뒤에는 운영자가 진행하라고 하기 전까지 아무도 push하지 않는다. 루프 틱 프롬프트마다 이 파일을 지정하므로 틱마다 머지 금지 규칙을 본다.
2. **PR은 다른 PR을 기반으로 삼을 때만 쌓는다.** 3단계의 유일한 예외다. `playbooks/opening-a-pr.md`에 따라 그 PR의 base를 trunk 대신 다른 PR의 브랜치로 둔다. 2단계의 trunk 위 rebase 대신 각 PR은 부모 PR의 브랜치 위로 rebase하고, 스택 루트는 trunk 위로 rebase한다. 아래 PR에 새 head가 생기면 그 위 PR들을 다시 쌓고, restack 뒤에도 `git patch-id`가 그대로인 PR은 판정을 유지한다.

**답변:** 머지된 것 대신 각 PR과 그 판정을 나열한다.
