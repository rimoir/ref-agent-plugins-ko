# 따라 쓸 만한 프롬프트

실제 경로, 스킬, 완료 검사로 바꿔 쓴다. 격식 없는 말투로도 된다.

## 이해하기

- `/poteto-mode read <thread>. restate the underlying issue in your own words, in plain english.`
- `/in-your-own-words <long or messy ask>`
- `/sharpen <the prompt you're about to send>`
- `/poteto-mode investigate why <symptom>. give me what we know, what data you used, and your best hypotheses. don't change any code yet.`
- `use /how to understand <subsystem>. then use /why to find out why it broke recently.`
- `/recall my work on <topic> from last week, then read <issue>.`
- `/teach me why you implemented it this way and not <other way>. what did you trade off?`
- `/poteto-mode take over this branch. read the decision log, find what's done, and continue. don't redo finished work.`

## 만들기

- 버그: `/poteto-mode <symptom>. repro first, then fix and verify.`
- 앱의 버그: `/poteto-mode repro this with /verify-<app>. if it repros on main, fix it and show me a video as proof.`
- 싼 테스트가 있는 버그: `/poteto-mode repro <bug> first. if there's a cheap test path, /tdd it. then fix and rerun.`
- 기능: `/poteto-mode add <behavior>. <current output> stays byte-identical. verify both.`
- 리팩터링: `/poteto-mode move <code> into one module, zero behavior change. record the current output first and prove it's unchanged after.`
- 성능: `/poteto-mode <operation> takes <time> on <fixture>. trace it, fix the measured cause, show me before and after.`

## 설계와 계획

- `/poteto-mode prototype a few options for <feature>. take screenshots or videos for me to compare.`
- `/poteto-mode we need <feature>. /architect it first, and answer open questions with prototypes. let me review before proceeding.`
- `/poteto-mode write a tutorial for how i would use <new package> first. then /teach me why it beats the current one.`
- `ask /arena for a second opinion on this thread and our approach.`
- `/poteto-mode turn this design into a plan. small verifiable PRs, each with its own verification steps.`
- `/poteto-mode plan the migration of <library> to <target>. small verifiable PRs. the result must match the original exactly, bugs included.`

## 리뷰와 출시

- `/interrogate the whole branch, but skeptically. don't change anything yet. no nitpicks unless it's a real bug or regression.` Dropped 목록도 읽는다.
- `/create-formal-verification-skill prove <property> holds in <module>, even when <steps> interleave or retry.` 그 코드에 머지나 리팩터링이 있은 뒤에는 `/maintain-formal-verification-skill`.
- `/swarm check every package under <dir> against its check script. one worker per package. one report.`
- `/poteto-mode open the pr. small ordered commits, evidence in the description.`
- `/poteto-mode babysit this pr. get it green.` 상태만 볼 때: `/poteto-mode check on pr <number>. anything outstanding?`
- `/poteto-mode land the stack.`

## 자리 비우기와 돌아오기

- `/poteto-mode im going to bed. <goal> in a fresh worktree off <base>. done means <checks>. keep a decision log. don't ask me before committing. /loop until done. if you're truly stuck after a few hours, stop and write up why.`
- `/show-me-your-work catch me up on what you did last night.` Attention 절부터 읽는다.
- `/ketchup`은 마지막 메시지 이후 이 채팅에서 바뀐 것을 따라잡게 하고, 내 결정을 기다리는 일을 모두 나열한다.
- `/poteto-mode full autopilot on this queue. each item is independent.`
- `/poteto-mode autopilot these changes, but don't merge. i'll land them.`
- `/reflect capture what we learned so the next run doesn't repeat it.` 앞으로의 결정을 바꾸는 수정만 승인한다.
- `/bro`는 마지막 답을 쉬운 말로 다시 말해 준다.
