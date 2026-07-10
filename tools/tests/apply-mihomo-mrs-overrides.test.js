#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const childProcess = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const REPO_ROOT = path.resolve(__dirname, '../..');
const TOOL = path.join(REPO_ROOT, 'tools/apply-mihomo-mrs-overrides.js');

test('Mihomo MRS override application is idempotent', () => {
  const sourceGraph = path.join(REPO_ROOT, 'rulesets/source/routing-graph.js');
  let firstOutput = null;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const result = childProcess.spawnSync(process.execPath, [TOOL], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
    });
    assert.equal(
      result.status,
      0,
      `attempt ${attempt} failed:\n${result.stderr || result.stdout}`,
    );
    const output = fs.readFileSync(sourceGraph);
    if (firstOutput) assert.deepEqual(output, firstOutput, 'second application changed source graph bytes');
    firstOutput = output;
  }
});
