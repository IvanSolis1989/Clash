'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');
const {
  localPathForRepositoryRuleUrl,
} = require('../lib/repository-rule-asset');

test('repository-owned rule URLs resolve to the checked-out source file', () => {
  const resolved = localPathForRepositoryRuleUrl(
    'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/supplemental/clash/adfp-ai.list',
  );
  assert.equal(resolved, path.resolve(__dirname, '../../rulesets/supplemental/clash/adfp-ai.list'));
});

test('repository rule URL resolver rejects path traversal', () => {
  const resolved = localPathForRepositoryRuleUrl(
    'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/../../outside.txt',
  );
  assert.equal(resolved, null);
});
