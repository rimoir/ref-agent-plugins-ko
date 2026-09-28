#!/usr/bin/env node
// Generate the OpenClaw / ClawHub skill package (.openclaw/skills/) from the
// canonical skills/. OpenClaw skills are SKILL.md (frontmatter + body), the same
// format ponytail already uses, with one difference: `description` must be a
// single line under 160 chars. The canonical descriptions are long (tuned for
// Claude's skill picker), so each ships a short one here. The body is copied
// verbatim from skills/<name>/SKILL.md so the ruleset never drifts; only the
// frontmatter is rewritten.
//
// Run:  node scripts/build-openclaw-skills.js
// tests/openclaw-skills.test.js fails if the committed copies are stale.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const HOMEPAGE = 'https://github.com/DietrichGebert/ponytail';

const DESCRIPTIONS = {
  'ponytail': '모든 코딩 작업(작성, 리팩터링, 수정, 리뷰)에 쓰는 게으른 시니어 개발자 모드다. YAGNI와 표준 라이브러리를 우선하고 요청하지 않은 추상화는 만들지 않는다. 코딩이 아닌 요청에는 쓰지 않는다.',
  'ponytail-review': 'diff의 과잉 설계를 리뷰한다. 다시 구현한 표준 라이브러리, 불필요한 의존성, 미리 만든 추상화처럼 지울 것을 찾아 항목마다 한 줄로 알려 준다.',
  'ponytail-audit': '저장소 전체의 과잉 설계를 감사한다. 지우거나 단순화하거나 표준 라이브러리나 플랫폼 기본 기능으로 바꿀 것을 순위 목록으로 보여 준다.',
  'ponytail-debt': 'ponytail: 주석을 모두 모아 부채 목록 하나로 만든다. 미뤄 둔 작업을 잊지 않고 관리하게 한다. 한 번만 실행하는 보고서다.',
  'ponytail-gain': '벤치마크 중앙값으로 측정한 ponytail의 효과(코드 감소, 비용 감소, 속도 향상)를 점수표로 보여 준다. 한 번만 표시한다.',
  'ponytail-help': 'ponytail의 모드, 스킬, 명령을 한눈에 보는 참고 카드다. 한 번만 표시한다.',
};

const NAMES = Object.keys(DESCRIPTIONS);

function sourceBody(name) {
  const src = fs.readFileSync(path.join(ROOT, 'skills', name, 'SKILL.md'), 'utf8').replace(/\r\n/g, '\n');
  const fm = src.match(/^---\n[\s\S]*?\n---\n?/);
  if (!fm) throw new Error(`skills/${name}/SKILL.md has no frontmatter`);
  return src.slice(fm[0].length);
}

function render(name) {
  const desc = DESCRIPTIONS[name];
  if (desc.length > 160 || desc.includes('\n') || desc.includes('"')) {
    throw new Error(`description for ${name} must be one line, no quotes, under 160 chars`);
  }
  const frontmatter =
    `---\nname: ${name}\ndescription: "${desc}"\nhomepage: ${HOMEPAGE}\nlicense: MIT\n---\n`;
  return frontmatter + sourceBody(name);
}

function outPath(name) {
  return path.join(ROOT, '.openclaw', 'skills', name, 'SKILL.md');
}

module.exports = { DESCRIPTIONS, NAMES, render, outPath, sourceBody };

if (require.main === module) {
  for (const name of NAMES) {
    const p = outPath(name);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, render(name));
    console.log('wrote', path.relative(ROOT, p).replace(/\\/g, '/'));
  }
}
