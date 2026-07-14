#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { reconcileSnapshot } = require('../rebuild-fused-from-snapshot');

const MOVING = 'scki-fused-058-intl-site';
const CN_MEDIA = 'scki-fused-060-cnmedia';
const CN_SITE = 'scki-fused-061-cn-site';
const INTL_FALLBACK = 'scki-fused-064-intl-site';
const UNEXPECTED = 'scki-fused-059-payments';

function record(owner, value, key = 'domain') {
  return {
    identity: `${key}\u0000${value}`,
    owner,
    key,
    value,
  };
}

function snapshot(records) {
  const owners = new Map();
  for (const entry of records) {
    if (!owners.has(entry.identity)) owners.set(entry.identity, entry.owner);
  }
  return {
    records,
    owners,
  };
}

function reconcile(baseline, probe) {
  assert.equal(typeof reconcileSnapshot, 'function', 'reconcileSnapshot must be exported for provenance tests');
  return reconcileSnapshot({
    baseline,
    probe,
    movingSegment: MOVING,
    destinations: [CN_MEDIA, CN_SITE, INTL_FALLBACK],
    order: new Map([
      [MOVING, 58],
      [CN_MEDIA, 60],
      [CN_SITE, 61],
      [INTL_FALLBACK, 64],
    ]),
  });
}

function outputRecords(result) {
  assert.ok(result && result.grouped instanceof Map, 'reconcileSnapshot must return grouped output records');
  return [...result.grouped.values()].flat();
}

function ownerByValue(result) {
  return Object.fromEntries(outputRecords(result).map((entry) => [entry.value, entry.owner]));
}

test('snapshot reconciliation only moves baseline 058 values and ignores probe-only drift', () => {
  const baseline = snapshot([
    record(CN_SITE, 'must-remain-cn.example'),
    record(MOVING, 'move-to-cn.example'),
    record(MOVING, 'remain-international.example'),
    // A later physical duplicate in 058 is not its effective first-match
    // owner. Reconciliation must operate on the first owner above.
    record(MOVING, 'must-remain-cn.example'),
  ]);
  const probe = snapshot([
    record(CN_SITE, 'move-to-cn.example'),
    record(MOVING, 'remain-international.example'),
    // This models the observed upstream drift: a baseline CN value appears in
    // the probe's 058 payload. It must never be allowed to move backwards.
    record(MOVING, 'must-remain-cn.example'),
    record(CN_SITE, 'probe-only-upstream-drift.example'),
  ]);

  const result = reconcile(baseline, probe);
  const records = outputRecords(result);

  assert.deepEqual(ownerByValue(result), {
    'move-to-cn.example': CN_SITE,
    'remain-international.example': MOVING,
    'must-remain-cn.example': CN_SITE,
  });
  assert.equal(records.length, 3, 'the physical 058 duplicate must not survive reconciliation');
  assert.ok(!records.some((entry) => entry.value === 'probe-only-upstream-drift.example'));
});

test('snapshot reconciliation fails closed when a moving baseline value is absent from the probe', () => {
  const baseline = snapshot([record(MOVING, 'missing-from-probe.example')]);
  const probe = snapshot([]);

  assert.throws(() => reconcile(baseline, probe));
});

test('snapshot reconciliation rejects a moving value assigned outside the explicit destination allowlist', () => {
  const baseline = snapshot([record(MOVING, 'unexpected-owner.example')]);
  const probe = snapshot([record(UNEXPECTED, 'unexpected-owner.example')]);

  assert.throws(() => reconcile(baseline, probe));
});
