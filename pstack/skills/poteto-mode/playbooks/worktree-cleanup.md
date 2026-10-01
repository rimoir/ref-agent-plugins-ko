### Worktree and simulator cleanup

**너는 디스크와 안전 관문을 소유한다.** 머지됐거나 버려진 git worktree와 낡은 iOS 시뮬레이터를 정리해 공간을 되찾는다. 삭제는 되돌릴 수 없으므로, 모든 단계는 사용 중이거나 커밋되지 않은 작업을 품은 것을 지우지 않도록 막는다.

1. 스냅숏과 감사. `df -h /`를 기록한 뒤 `scripts/worktree-audit.sh`를 실행한다(principle-build-the-lever). 이 스크립트는 경로를 손으로 치지 않고 `git worktree list`에서 읽는다. 손으로 친 `myrepo-worktrees/x`는 `.cursor/worktrees/myrepo/x`에 사는 worktree를 놓치기 때문이다(principle-encode-lessons-in-structure). 각 worktree를 크기, 나이, 머지 상태, 커밋되지 않은 작업, PR 상태, 그것을 건드린 가장 최근 채팅으로 분류하고 버킷을 제안한다. 트랜스크립트 스캔은 느리므로 백그라운드로 돌린다.
2. 버킷은 조언이지 허가가 아니다. 고정된 채팅과 활성 채팅이 진짜 기준이다(principle-prove-it-works). 그 목록을 사용자나 사이드바에서 받아 모든 후보와 대조한다. 이 도구가 사용자가 고정해 둔 worktree를 `safe`로 표시한 적이 있으므로, 고정 목록이 이긴다.
3. 지우기 전에 사용 여부를 확인한다. `verify-recent-chat` 행마다, 또는 미심쩍은 것마다 subagent를 띄워 트랜스크립트를 읽게 하고, 그 채팅이 고정됐거나 진행 중인지와 어떤 worktree를 건드리는지 보고받는다(principle-guard-the-context-window, 트랜스크립트는 대량이다). 고정된 채팅은 백그라운드 subagent로 형제 worktree에 arena와 재현 트리를 만들며, 그 이름이 사이드바에 한 번도 뜨지 않아도 사용 중이다.
4. 되돌릴 수 없는 손실 앞에서 멈춘다. `wip:N`은 추적되는 파일의 커밋되지 않은 수정 N건이다. 깨끗한 worktree를 지우는 것은 브랜치에서 복구할 수 있지만 커밋되지 않은 작업은 사라지므로, diff를 보여 주고 먼저 결정을 받는다. `scratch:N`은 추적되지 않는 버릴 파일이라 지워도 되지만 파일 이름은 밝힌다. Autonomy에 따라 깨끗하고, 머지됐고, 사용 중이 아닌 것은 진행한다. `wip`와 사용 중인 것은 멈춘다.
5. 확인된 목록을 정리한다. 경로마다 `git worktree remove --force <path>`를 실행한다. 무시된 빌드 산출물 때문에 디렉터리가 남으면 `rm -rf`로 지우고 `git worktree prune`을 실행한다. 브랜치 ref는 남으므로 커밋은 잃지 않는다. `df -h /`와 목록 재조회로 확인한다.
6. 시뮬레이터와 그 밖의 공간 회수. 보통 시뮬레이터가 그다음으로 큰 수확이다. `xcrun simctl --set testing delete all`(XCTestDevices 복제본), `xcrun simctl delete unavailable`, 그리고 오래된 런타임은 `xcrun simctl runtime list`로 본 뒤 `runtime delete <id>`. 필요하면 더 있다. Xcode `DerivedData`와 `iOS DeviceSupport`, `~/Library/Application Support/Cursor`(`state.vscdb.backup`, 그리고 워크스페이스로 열었던 폴더 이름을 딴 `<root>`가 부풀어 오르는 `snapshots/roots/<root>`), 패키지 캐시(pnpm, uv, brew, yarn). 사용자가 남기라고 하지 않은 캐시만 지운다.

이 플레이북은 실수를 잡아 줄 코드 리뷰 없이 사용자 상태를 지우는 유일한 플레이북이므로, 위 관문들이 곧 리뷰다.

**응답:** 정리 전후의 `df -h /`와 되찾은 공간, 정리한 worktree, 남겨 둔 것마다 한 줄 이유(어느 채팅이 사용 중인지, 또는 커밋되지 않은 작업).
