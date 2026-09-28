#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8').replace(/\r\n/g, '\n').trim();
}

function stripFrontmatter(text) {
  return text.replace(/^---\n[\s\S]*?\n---\n*/, '').trim();
}

const agents = read('AGENTS.md');
const canonical = agents.replace(/\n\n\(그렇다, 이 파일은[\s\S]*?\)$/, '').trim();

// Compact copies: same body as AGENTS.md, host-specific frontmatter stripped.
const copies = [
  ['.cursor/rules/ponytail.mdc', stripFrontmatter],
  ['.windsurf/rules/ponytail.md', text => text.trim()],
  ['.clinerules/ponytail.md', text => text.trim()],
  ['.agents/rules/ponytail.md', text => text.trim()],
  ['.qoder/rules/ponytail.md', text => text.trim()],
  ['.github/copilot-instructions.md', text => text.trim()],
  ['.kiro/steering/ponytail.md', stripFrontmatter],
];

let failed = false;

for (const [relPath, normalize] of copies) {
  const actual = normalize(read(relPath));
  if (actual !== canonical) {
    console.error(`${relPath} drifted from AGENTS.md`);
    failed = true;
  }
}

// SKILL.md is the runtime source of truth and is longer than the compact body,
// so it cannot be byte-compared. ponytail: canary, not full equality. Assert the
// load-bearing rules survive verbatim in both the source and AGENTS.md. Changing
// a rule's wording trips this, which is the reminder to propagate it everywhere.
// Upgrade path: generate the copies from SKILL.md if this ever misses a real drift.
const INVARIANTS = [
  '이 코드베이스에',                      // ladder rung: reuse what already exists (#217)
  '단순한 휴리스틱',                       // ceiling-comment rule
  '실행할 수 있는 검사를 딱 하나',                    // test reflex
  '더 허술한 알고리즘',                    // robust-variant rule
  // the four "not lazy about" safety carve-outs: pin each so a reword in either
  // file can't silently drop one. Only validation was pinned before. These are the
  // continuous substrings present in both files ("prevents data loss" because the
  // full "error handling that prevents data loss" wraps a line in SKILL.md).
  '신뢰 경계의 입력 검증',
  '데이터 손실을 막는',
  '보안',
  '접근성',
  '검사가 없는 게으른 코드는 끝난 코드가 아니다', // one-check promoted to headline
];

const skill = read('skills/ponytail/SKILL.md');
const sources = [['skills/ponytail/SKILL.md', skill], ['AGENTS.md', agents]];
for (const phrase of INVARIANTS) {
  for (const [label, text] of sources) {
    if (!text.includes(phrase)) {
      console.error(`${label} is missing rule invariant: "${phrase}"`);
      failed = true;
    }
  }
}

if (failed) {
  console.error('Update the copied rule text, AGENTS.md, or SKILL.md so the shared rules match.');
  process.exit(1);
}

console.log(`Rule copies match AGENTS.md; ${INVARIANTS.length} rule invariants present in SKILL.md and AGENTS.md.`);
