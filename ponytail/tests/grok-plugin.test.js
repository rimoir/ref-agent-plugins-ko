#!/usr/bin/env node
// Grok Build loads Ponytail through its native skill system. Lifecycle-hook
// stdout is passive in Grok, so this adapter must not register any hooks.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

test('Grok manifest is a skill-only adapter with no lifecycle hooks', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'plugin.json'), 'utf8'));
  assert.equal(manifest.name, 'ponytail');
  assert.equal(manifest.hooks, undefined);
  assert.equal(manifest.mcpServers, undefined);
  assert.ok(!fs.existsSync(path.join(root, 'hooks', 'hooks.json')));
  assert.ok(!fs.existsSync(path.join(root, '.grok-plugin', 'hooks.json')));
});

test('Ponytail skill describes every coding task for Grok auto-invocation', () => {
  const skill = fs.readFileSync(path.join(root, 'skills', 'ponytail', 'SKILL.md'), 'utf8');
  assert.match(skill, /모든\s+코딩\s+작업에\s+쓴다/);
  assert.match(skill, /작성,\s+추가,\s+리팩터링,\s+수정,\s+리뷰,\s+설계/);
  assert.doesNotMatch(skill, /disable-model-invocation:\s*true/i);
});
