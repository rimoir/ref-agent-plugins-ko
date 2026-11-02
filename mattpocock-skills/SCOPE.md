# 범위

이 저장소는 내가 매일 쓰는 스킬 모음이다. 큐레이션한 모음이라 아이디어는 환영하지만, 하나하나 아래 기준으로 판단한다. 이슈는 스킬 변경을 추적하는 곳이다. 질문과 토론은 [GitHub Discussions](https://github.com/mattpocock/skills/discussions)에서 한다.

## 기준

아이디어나 피드백 이슈는 두 조건을 **모두** 통과해야 열린 채로 남는다.

1. **실제로 관찰한 실패.** 실제 세션에서 잘못된 일을 설명한다. 무엇을 실행했는지, 스킬이 무엇을 했는지, 무엇을 기대했는지를 적는다. 가정에 기댄 개선("~하면 더 좋겠다")은 이 조건을 통과하지 못한다.
2. **철학에 맞음.** [`.out-of-scope/`](./.out-of-scope/)의 어떤 항목이나 과거에 거절한 내용과 겹치지 않고, 설정 옵션이나 특정 하네스용 분기나 한 사람의 워크플로에 맞춘 조정이 아니다. 그런 것은 자기 `CLAUDE.md` / `AGENTS.md`나 포크에 둔다(skills.sh는 수정할 수 있는 사본을 준다).

크기는 상관없다. 한 단어 수정도 전면 재작성도 같은 기준을 거친다. 반응 이모지와 +1 댓글은 기준에 들어가지 않는다.

## 버킷별

- **`engineering/`, `productivity/`, `in-progress/`**: 위 기준을 따른다.
- **`misc/`**: 동결했고 관리하지 않는다. 모든 이슈를 닫는다. [`frozen-misc-skills.md`](./.out-of-scope/frozen-misc-skills.md)를 본다.
- **새 스킬**: 제안과 기여를 받지 않는다. 기존 스킬을 조합해 얻을 수 있는 동작이면 새 스킬을 만들지 않는다. [`new-skills.md`](./.out-of-scope/new-skills.md)를 본다.

## 이미 정한 것

[`.out-of-scope/`](./.out-of-scope/)의 파일은 각각 거절한 개념 하나와 그 이유를 기록한다. 이슈를 올리기 전에 읽는다.

- [`frozen-misc-skills.md`](./.out-of-scope/frozen-misc-skills.md)
- [`harness-name-collisions.md`](./.out-of-scope/harness-name-collisions.md)
- [`mainstream-issue-trackers-only.md`](./.out-of-scope/mainstream-issue-trackers-only.md)
- [`native-question-tool.md`](./.out-of-scope/native-question-tool.md)
- [`new-skills.md`](./.out-of-scope/new-skills.md)
- [`question-limits.md`](./.out-of-scope/question-limits.md)
- [`setup-skill-verify-mode.md`](./.out-of-scope/setup-skill-verify-mode.md)
- [`subagent-recursion.md`](./.out-of-scope/subagent-recursion.md)

## 판단하기 어려운 이슈

기준으로 판단할 수 없는 이슈에는 질문을 한 번 하고 `needs-info` 라벨을 붙인다. 14일 동안 보고자의 답이 없으면 닫는다. 거절한 이슈는 "not planned"로 닫는다.
