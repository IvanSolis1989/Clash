#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const {
  GENERATED_EGERN_RULE_SET_URL_PREFIX,
  buildEgernGenerationManifest,
  validateEgernGenerationManifest,
} = require('../lib/egern-generation-manifest');
const {
  fetchText,
  generateNativeRuleSets,
  sourceCacheFile,
} = require('../generate-egern-from-cmfa');

function renderProfile({ ruleCount, ruleSetRefs, assetCount }) {
  const nestedRefs = assetCount - ruleSetRefs;
  const topLevelRules = ruleCount - nestedRefs;
  const lines = [
    '---',
    `# Egern rule sets: ${assetCount} generated native YAML files.`,
    'rules:',
  ];

  for (let index = 0; index < topLevelRules; index += 1) {
    if (index < ruleSetRefs) {
      lines.push('  - rule_set:');
      lines.push(`      match: "${GENERATED_EGERN_RULE_SET_URL_PREFIX}asset-${String(index).padStart(3, '0')}.yaml"`);
      lines.push('      policy: "DIRECT"');
    } else {
      lines.push('  - domain:');
      lines.push(`      match: "example-${index}.test"`);
      lines.push('      policy: "DIRECT"');
    }
  }

  for (let index = ruleSetRefs; index < assetCount; index += 1) {
    lines.push('  - and:');
    lines.push('      match:');
    lines.push('        - rule_set:');
    lines.push(`            match: "${GENERATED_EGERN_RULE_SET_URL_PREFIX}asset-${String(index).padStart(3, '0')}.yaml"`);
    lines.push('      policy: "DIRECT"');
  }
  return `${lines.join('\n')}\n`;
}

test('Egern generation manifest accepts valid upstream-driven count changes and rejects stale output', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'scki-egern-manifest-'));
  const cmfaSource = 'rule-providers:\n  synthetic:\n    type: http\nrules:\n  - MATCH,DIRECT\n';
  const routingGraphSource = 'module.exports = { synthetic: true };\n';

  try {
    for (let index = 0; index < 97; index += 1) {
      const file = `asset-${String(index).padStart(3, '0')}.yaml`;
      fs.writeFileSync(path.join(directory, file), `domain_set:\n  - "example-${index}.test"\n`, 'utf8');
    }
    const profileSource = renderProfile({ ruleCount: 109, ruleSetRefs: 92, assetCount: 97 });
    const manifest = buildEgernGenerationManifest({
      cmfaSource,
      routingGraphSource,
      profileSource,
      generatedRuleSetDirectory: directory,
      sourceProviderCount: 113,
      sourceRuleCount: 130,
      ruleSetStats: {
        totalEntries: 575697,
        removedEntries: 123980,
        globalExactDuplicates: 123436,
        emptyAssets: 21,
      },
    });
    const result = validateEgernGenerationManifest({
      manifest,
      cmfaSource,
      routingGraphSource,
      profileSource,
      generatedRuleSetDirectory: directory,
      expectedSourceProviderCount: 113,
      expectedSourceRuleCount: 130,
    });

    assert.deepEqual(result.failures, []);
    assert.deepEqual(result.metrics, { rule_count: 109, rule_set_ref_count: 92 });
    assert.equal(result.assets.length, 97);

    const staleResult = validateEgernGenerationManifest({
      manifest,
      cmfaSource,
      routingGraphSource,
      profileSource: `${profileSource}  - domain:\n      match: "stale-output.test"\n      policy: "DIRECT"\n`,
      generatedRuleSetDirectory: directory,
      expectedSourceProviderCount: 113,
      expectedSourceRuleCount: 130,
    });
    assert.ok(staleResult.failures.some((failure) => failure.id === 'rendered.rule-count'));
    assert.ok(staleResult.failures.some((failure) => failure.id === 'rendered.profile-sha256'));
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('Egern generator uses the fused cache offline and fails closed on a cache miss', async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'scki-egern-source-cache-'));
  const url = 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip/google.yaml';
  const cacheFile = sourceCacheFile(url, directory);
  const originalFetch = global.fetch;
  let fetchCalls = 0;

  try {
    fs.writeFileSync(cacheFile, 'payload: ["DOMAIN-SUFFIX,example.test"]\n', 'utf8');
    global.fetch = async () => {
      fetchCalls += 1;
      throw new Error('network must not be reached');
    };

    assert.equal(path.basename(cacheFile), `${Buffer.from(url).toString('base64url')}.txt`);
    assert.equal(await fetchText(url, { cacheDir: directory, offline: true }), 'payload: ["DOMAIN-SUFFIX,example.test"]\n');
    await assert.rejects(
      fetchText('https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip/cache-miss.yaml', { cacheDir: directory, offline: true }),
      /SCKI_OFFLINE cache miss/,
    );
    assert.equal(fetchCalls, 0);
  } finally {
    global.fetch = originalFetch;
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('Egern generator preserves existing native rule sets when source preflight fails', async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'scki-egern-preflight-'));
  const sentinel = path.join(directory, 'existing.yaml');
  const assets = new Map([[
    'synthetic.yaml',
    {
      file: 'synthetic.yaml',
      id: 'synthetic',
      sourceUrl: 'https://example.test/synthetic.yaml',
      sourceFilter: null,
      behavior: 'classical',
      noResolve: false,
    },
  ]]);

  try {
    fs.writeFileSync(sentinel, 'preserve-me\n', 'utf8');
    await assert.rejects(
      generateNativeRuleSets(assets, {
        outputDir: directory,
        fetcher: async () => {
          throw new Error('SCKI_OFFLINE cache miss: https://example.test/synthetic.yaml');
        },
      }),
      /SCKI_OFFLINE cache miss/,
    );
    assert.equal(fs.readFileSync(sentinel, 'utf8'), 'preserve-me\n');
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
