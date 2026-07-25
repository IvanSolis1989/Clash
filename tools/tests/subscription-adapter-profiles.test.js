#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');
const {
  PROFILE_IDS,
  readProfileContract,
  renderJavaScriptProfileRuntime,
  renderRubyProfileRuntime,
  validateProfileContract,
} = require('../lib/subscription-adapter-profiles');

const REPOSITORY_ROOT = path.resolve(__dirname, '..', '..');

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

test('subscription adapter profile contract is closed and renders the same enum for JS and Ruby', () => {
  const contract = readProfileContract(REPOSITORY_ROOT);
  assert.deepEqual(validateProfileContract(contract), []);
  assert.equal(contract.default, 'adaptive');
  assert.deepEqual(Object.keys(contract.profiles).sort(), [...PROFILE_IDS].sort());

  const js = renderJavaScriptProfileRuntime(contract);
  const ruby = renderRubyProfileRuntime(contract);
  for (const id of PROFILE_IDS) {
    assert.match(js, new RegExp(`"${id}"`));
    assert.match(ruby, new RegExp(`"${id}"`));
  }
  assert.match(js, /SCKI_SUBSCRIPTION_ADAPTER_PROFILE_DEFAULT = "adaptive"/);
  assert.match(ruby, /DEFAULT = "adaptive"\.freeze/);
});

test('subscription adapter profile contract rejects routing-affecting expansion', () => {
  const contract = clone(readProfileContract(REPOSITORY_ROOT));
  contract.profiles.adaptive.rules = 'remove';
  contract.invariants.proxy_groups = 'optional';
  const errors = validateProfileContract(contract);
  assert.ok(errors.some((error) => error.includes('profiles.adaptive.rules')));
  assert.ok(errors.some((error) => error.includes('invariants.proxy_groups')));
});
