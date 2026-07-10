#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  aggregateFlowSnapshots,
  createFlowSnapshot,
  operator,
  readSubscriptionUrlConfig,
} = require('./merge-subscription-userinfo');

function snapshot(
  { upload, download, total, expires },
  localArgs,
  sourceUrl = 'https://mirror-a.example/sub?token=shared-account'
) {
  return createFlowSnapshot({
    usage: { upload, download },
    total,
    expires,
  }, localArgs, sourceUrl);
}

test('identical complete flow snapshots are counted once, while independent subscriptions still sum', () => {
  const mirrorA = snapshot({ upload: 100, download: 200, total: 1000, expires: 2000000000 });
  const mirrorB = snapshot(
    { upload: 100, download: 200, total: 1000, expires: 2000000000 },
    undefined,
    'https://mirror-b.example/sub?token=shared-account'
  );
  const independent = snapshot(
    { upload: 30, download: 40, total: 500, expires: 2000000100 },
    undefined,
    'https://independent.example/sub?token=another-account'
  );

  const result = aggregateFlowSnapshots([mirrorA, mirrorB, independent], 1);

  assert.deepEqual(result, {
    upload: 130,
    download: 240,
    total: 1500,
    expire: 2000000000,
    counted: 2,
    deduplicated: 1,
  });
});

test('matching quotas from distinct subscription identities are not automatically collapsed', () => {
  const first = snapshot(
    { upload: 100, download: 200, total: 1000, expires: 2000000000 },
    undefined,
    'https://first.example/sub?token=first-account'
  );
  const second = snapshot(
    { upload: 100, download: 200, total: 1000, expires: 2000000000 },
    undefined,
    'https://second.example/sub?token=second-account'
  );

  const result = aggregateFlowSnapshots([first, second], 1);

  assert.deepEqual(result, {
    upload: 200,
    download: 400,
    total: 2000,
    expire: 2000000000,
    counted: 2,
    deduplicated: 0,
  });
});

test('shared flowDedup key merges divergent mirror snapshots by their freshest counters', () => {
  const mirrorA = snapshot(
    { upload: 100, download: 200, total: 1000, expires: 2000000000 },
    { flowDedup: 'airport-alpha' }
  );
  const mirrorB = snapshot(
    { upload: 120, download: 220, total: 1000, expires: 2000000100 },
    { flowDedup: 'airport-alpha' }
  );
  const independent = snapshot({ upload: 10, download: 20, total: 500, expires: 2000000200 });

  const result = aggregateFlowSnapshots([mirrorA, mirrorB, independent], 1);

  assert.deepEqual(result, {
    upload: 130,
    download: 240,
    total: 1500,
    expire: 2000000100,
    counted: 2,
    deduplicated: 1,
  });
});

test('flowDedup=off keeps matching headers as independent subscriptions', () => {
  const first = snapshot(
    { upload: 100, download: 200, total: 1000, expires: 2000000000 },
    { flowDedup: 'off' },
    'https://mirror-a.example/sub?token=shared-account'
  );
  const second = snapshot(
    { upload: 100, download: 200, total: 1000, expires: 2000000000 },
    { flowDedup: 'off' },
    'https://mirror-b.example/sub?token=shared-account'
  );

  const result = aggregateFlowSnapshots([first, second], 1);

  assert.deepEqual(result, {
    upload: 200,
    download: 400,
    total: 2000,
    expire: 2000000000,
    counted: 2,
    deduplicated: 0,
  });
});

test('subscription URL parser preserves a mirror key without exposing the URL to aggregation', () => {
  const result = readSubscriptionUrlConfig({
    url: 'https://mirror.example/sub?token=redacted#flowDedup=airport%20alpha',
  });

  assert.equal(result.url, 'https://mirror.example/sub?token=redacted');
  assert.deepEqual(result.localArgs, { flowDedup: 'airport alpha' });
});

test('operator persists an automatically deduplicated collection userinfo header', { concurrency: false }, async () => {
  const collection = {
    name: 'Mirror collection',
    subscriptions: ['Mirror A', 'Mirror B'],
  };
  const subscriptions = [
    { name: 'Mirror A', source: 'remote', url: 'https://mirror-a.example/sub?token=shared-account' },
    { name: 'Mirror B', source: 'remote', url: 'https://mirror-b.example/sub?token=shared-account' },
  ];
  const collections = [{ ...collection }];
  const headers = new Map([
    ['https://mirror-a.example/sub?token=shared-account', 'upload=100; download=200; total=1000; expire=2000000000'],
    ['https://mirror-b.example/sub?token=shared-account', 'upload=100; download=200; total=1000; expire=2000000000'],
  ]);
  const logs = [];
  const restore = [
    replaceGlobal('$substore', {
      read(key) {
        if (key === 'subs') return subscriptions;
        if (key === 'collections') return collections;
        return [];
      },
      write(value, key) {
        if (key === 'collections') {
          collections.splice(0, collections.length, ...value);
        }
      },
      info(message) {
        logs.push(message);
      },
    }),
    replaceGlobal('flowUtils', {
      async getFlowHeaders(url) {
        return headers.get(url.replace(/#insecure$/, ''));
      },
      normalizeFlowHeader(raw) {
        return { 'subscription-userinfo': raw };
      },
      parseFlowHeaders(raw) {
        const values = Object.fromEntries(raw.split(';').map((item) => {
          const [key, value] = item.trim().split('=');
          return [key, Number(value)];
        }));
        return {
          usage: { upload: values.upload, download: values.download },
          total: values.total,
          expires: values.expire,
        };
      },
    }),
    replaceGlobal('$options', {}),
  ];

  try {
    const proxies = [{ name: 'retained proxy' }];
    const result = await operator(proxies, 'Clash.Meta', { source: { _collection: collection } });
    const expected = 'upload=100; download=200; total=1000; expire=2000000000';

    assert.equal(result, proxies);
    assert.equal(collections[0].subUserinfo, expected);
    assert.equal(globalThis.$options._res.headers['subscription-userinfo'], expected);
    assert.ok(logs.some((message) => message.includes('counted=1 deduped=1')));
  } finally {
    restore.reverse().forEach((restoreGlobal) => restoreGlobal());
  }
});

function replaceGlobal(name, value) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, name);
  Object.defineProperty(globalThis, name, {
    configurable: true,
    enumerable: true,
    writable: true,
    value,
  });

  return () => {
    if (previous) {
      Object.defineProperty(globalThis, name, previous);
    } else {
      delete globalThis[name];
    }
  };
}
