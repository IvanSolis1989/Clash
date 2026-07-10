/**
 * Merge subscription-userinfo headers for a Sub-Store collection.
 *
 * Use this only as a Script Operator on a collection. It sums independent
 * subscriptions and collapses mirror subscriptions that expose the same flow
 * snapshot and host-independent subscription identity. Use
 * #flowDedup=<shared-key> on mirror subscription URLs when CDN cache lag or
 * different URL paths make automatic identification unavailable.
 */
async function operator(proxies = [], targetPlatform, context) {
  if (typeof $substore === 'undefined' || typeof flowUtils === 'undefined') {
    throw new Error('This script requires Sub-Store runtime helpers: $substore and flowUtils');
  }

  const SUBS_KEY = 'subs';
  const COLLECTIONS_KEY = 'collections';
  const store = $substore;
  const { source } = context || {};
  const { _collection: collection } = source || {};

  if (!collection || Object.keys(source || {}).length > 1) {
    throw new Error('请仅在“组合订阅”中使用此脚本');
  }

  const allSubs = store.read(SUBS_KEY) || [];
  const subnames = expandCollectionSubscriptions(collection, allSubs);
  const { parseFlowHeaders, getFlowHeaders, normalizeFlowHeader } = flowUtils;

  const snapshots = [];

  for (const sub of allSubs) {
    if (!subnames.includes(sub.name)) continue;

    let subInfo;
    let flowInfo;
    const subscriptionUrl = readSubscriptionUrlConfig(sub);

    if (sub.source !== 'local' || ['localFirst', 'remoteFirst'].includes(sub.mergeSources)) {
      try {
        const remoteInfo = await readRemoteFlowInfo(
          sub,
          getFlowHeaders,
          normalizeFlowHeader,
          subscriptionUrl
        );
        flowInfo = remoteInfo.flowInfo;
        subInfo = remoteInfo.subInfo;
      } catch (err) {
        log('error', `订阅 ${sub.name} 获取流量信息失败: ${JSON.stringify(err)}`);
      }
    }

    if (sub.subUserinfo) {
      try {
        subInfo = await readCustomSubUserinfo(sub, flowInfo, getFlowHeaders, normalizeFlowHeader);
      } catch (err) {
        log('error', `订阅 ${sub.name} 自定义流量信息获取失败: ${JSON.stringify(err)}`);
      }
    }

    if (!subInfo) continue;

    try {
      const parsed = parseFlowHeaders(subInfo);
      const snapshot = createFlowSnapshot(parsed, subscriptionUrl.localArgs, subscriptionUrl.url);
      if (hasFlowSnapshotValues(snapshot)) snapshots.push(snapshot);
    } catch (err) {
      log('error', `订阅 ${sub.name} 解析 subscription-userinfo 失败: ${JSON.stringify(err)}`);
    }
  }

  const aggregate = aggregateFlowSnapshots(snapshots);

  const subUserInfo = [
    `upload=${Math.floor(aggregate.upload)}`,
    `download=${Math.floor(aggregate.download)}`,
    `total=${Math.floor(aggregate.total)}`,
    aggregate.expire ? `expire=${aggregate.expire}` : '',
  ].filter(Boolean).join('; ');

  persistCollectionUserinfo(store, COLLECTIONS_KEY, collection.name, subUserInfo);

  if (typeof $options !== 'undefined' && $options) {
    $options._res = {
      headers: {
        'subscription-userinfo': subUserInfo,
      },
    };
  }

  log(
    'info',
    `[MergeUserinfo] collection=${collection.name} subs=${subnames.length} snapshots=${snapshots.length} counted=${aggregate.counted} deduped=${aggregate.deduplicated}`
  );
  return proxies;
}

function expandCollectionSubscriptions(collection, allSubs) {
  const subnames = [...(collection.subscriptions || [])];
  const tags = collection.subscriptionTags;

  if (Array.isArray(tags) && tags.length > 0) {
    for (const sub of allSubs) {
      if (!Array.isArray(sub.tag) || sub.tag.length === 0) continue;
      if (subnames.includes(sub.name)) continue;
      if (sub.tag.some((tag) => tags.includes(tag))) subnames.push(sub.name);
    }
  }

  return subnames;
}

function readSubscriptionUrlConfig(sub) {
  const rawUrl = String(sub.url || '')
    .split(/[\r\n]+/)
    .map((item) => item.trim())
    .filter(Boolean)[0] || '';

  const hashIndex = rawUrl.indexOf('#');
  const url = hashIndex >= 0 ? rawUrl.slice(0, hashIndex) : rawUrl;
  const rawArgs = hashIndex >= 0 ? rawUrl.slice(hashIndex + 1) : '';

  return {
    url,
    localArgs: parseHashArguments(rawArgs),
  };
}

async function readRemoteFlowInfo(sub, getFlowHeaders, normalizeFlowHeader, subscriptionUrl) {
  const { url, localArgs } = subscriptionUrl || readSubscriptionUrlConfig(sub);

  if (localArgs.noFlow || !/^https?:\/\//.test(url)) {
    return { flowInfo: undefined, subInfo: undefined };
  }

  const flowInfo = await getFlowHeaders(
    localArgs.insecure ? `${url}#insecure` : url,
    localArgs.flowUserAgent,
    undefined,
    sub.proxy,
    localArgs.flowUrl
  );

  if (!flowInfo) return { flowInfo, subInfo: undefined };

  const headers = normalizeFlowHeader(flowInfo, true);
  return {
    flowInfo,
    subInfo: headers?.['subscription-userinfo'],
  };
}

function createFlowSnapshot(parsed, localArgs, sourceUrl) {
  const snapshot = {
    upload: finiteValue(parsed?.usage?.upload),
    download: finiteValue(parsed?.usage?.download),
    total: finiteValue(parsed?.total),
    expires: finiteValue(parsed?.expires),
    sourceIdentity: createHostIndependentSubscriptionIdentity(sourceUrl),
  };
  snapshot.dedupIdentity = resolveFlowDedupIdentity(snapshot, localArgs);
  return snapshot;
}

function aggregateFlowSnapshots(snapshots, now = Date.now()) {
  const groups = new Map();
  let deduplicated = 0;

  for (const snapshot of snapshots) {
    const key = snapshot.dedupIdentity || Symbol('independent-flow-snapshot');
    const existing = groups.get(key);
    if (!existing) {
      groups.set(key, snapshot);
      continue;
    }

    groups.set(key, mergeDuplicateSnapshots(existing, snapshot));
    deduplicated += 1;
  }

  let upload = 0;
  let download = 0;
  let total = 0;
  let expire;

  for (const snapshot of groups.values()) {
    if (isPositiveFinite(snapshot.upload)) upload += snapshot.upload;
    if (isPositiveFinite(snapshot.download)) download += snapshot.download;
    if (isPositiveFinite(snapshot.total)) total += snapshot.total;
    if (snapshot.expires && snapshot.expires * 1000 > now) {
      expire = expire ? Math.min(expire, snapshot.expires) : snapshot.expires;
    }
  }

  return {
    upload,
    download,
    total,
    expire,
    counted: groups.size,
    deduplicated,
  };
}

function mergeDuplicateSnapshots(first, second) {
  return {
    ...first,
    upload: maximumFinite(first.upload, second.upload),
    download: maximumFinite(first.download, second.download),
    total: maximumFinite(first.total, second.total),
    // A shorter expiry from a stale mirror must not expire the shared account early.
    expires: maximumFinite(first.expires, second.expires),
  };
}

function resolveFlowDedupIdentity(snapshot, localArgs = {}) {
  const configuredKey = normalizeFlowDedupKey(localArgs.flowDedup ?? localArgs.flowDedupKey);
  if (configuredKey === false) return undefined;
  if (configuredKey) return `key:${configuredKey}`;

  // Automatic deduplication is deliberately conservative: a full, exact
  // subscription-userinfo snapshot must also share a host-independent URL
  // identity, so two unrelated plans with matching quotas are not collapsed.
  if (!hasCompleteFlowSnapshot(snapshot) || !snapshot.sourceIdentity) return undefined;
  return `snapshot:${snapshot.sourceIdentity}:${snapshot.upload}:${snapshot.download}:${snapshot.total}:${snapshot.expires}`;
}

function normalizeFlowDedupKey(value) {
  if (value == null || value === true) return undefined;

  const key = String(value).trim();
  if (!key || key.toLowerCase() === 'auto') return undefined;
  if (['off', 'false', '0', 'none', 'disabled'].includes(key.toLowerCase())) return false;
  return key;
}

function hasCompleteFlowSnapshot(snapshot) {
  return Number.isFinite(snapshot.upload)
    && Number.isFinite(snapshot.download)
    && Number.isFinite(snapshot.total)
    && snapshot.total > 0
    && Number.isFinite(snapshot.expires)
    && snapshot.expires > 0;
}

function hasFlowSnapshotValues(snapshot) {
  return Number.isFinite(snapshot.upload)
    || Number.isFinite(snapshot.download)
    || Number.isFinite(snapshot.total)
    || Number.isFinite(snapshot.expires);
}

function createHostIndependentSubscriptionIdentity(sourceUrl) {
  if (!sourceUrl) return undefined;

  try {
    const parsed = new URL(sourceUrl);
    const parameters = [...parsed.searchParams.entries()]
      .sort(([firstKey, firstValue], [secondKey, secondValue]) => {
        const keyOrder = firstKey.localeCompare(secondKey);
        return keyOrder || firstValue.localeCompare(secondValue);
      })
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');

    return `${parsed.pathname}?${parameters}`;
  } catch (err) {
    return undefined;
  }
}

function finiteValue(value) {
  return Number.isFinite(value) ? value : undefined;
}

function isPositiveFinite(value) {
  return Number.isFinite(value) && value > 0;
}

function maximumFinite(first, second) {
  if (!Number.isFinite(first)) return second;
  if (!Number.isFinite(second)) return first;
  return Math.max(first, second);
}

async function readCustomSubUserinfo(sub, flowInfo, getFlowHeaders, normalizeFlowHeader) {
  let customSubUserInfo = sub.subUserinfo;

  if (/^https?:\/\//.test(sub.subUserinfo)) {
    customSubUserInfo = await getFlowHeaders(undefined, undefined, undefined, sub.proxy, sub.subUserinfo);
  }

  const headers = normalizeFlowHeader([customSubUserInfo, flowInfo].filter(Boolean).join(';'), true);
  return headers?.['subscription-userinfo'];
}

function parseHashArguments(raw) {
  if (!raw) return {};

  try {
    return JSON.parse(decodeURIComponent(raw));
  } catch (err) {
    const args = {};
    for (const pair of raw.split('&')) {
      if (!pair) continue;
      const index = pair.indexOf('=');
      const key = index >= 0 ? pair.slice(0, index) : pair;
      const value = index >= 0 ? pair.slice(index + 1) : true;
      args[key] = value == null || value === '' ? true : decodeURIComponent(value);
    }
    return args;
  }
}

function persistCollectionUserinfo(store, key, collectionName, subUserInfo) {
  const allCollections = store.read(key) || [];
  for (const collection of allCollections) {
    if (collection.name !== collectionName) continue;
    collection.subUserinfo = subUserInfo;
    break;
  }
  store.write(allCollections, key);
}

function log(level, message) {
  if (typeof $substore === 'undefined') return;
  const fn = $substore[level];
  if (typeof fn === 'function') fn(message);
}

if (typeof module !== 'undefined') {
  module.exports = {
    operator,
    aggregateFlowSnapshots,
    createFlowSnapshot,
    createHostIndependentSubscriptionIdentity,
    expandCollectionSubscriptions,
    parseHashArguments,
    readSubscriptionUrlConfig,
    resolveFlowDedupIdentity,
  };
}

