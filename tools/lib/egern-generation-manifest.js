'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const {
  SCKI_REPOSITORY_BASE,
  getAssetRevisionFromUrl,
  normalizeAssetRevision,
} = require('./generated-asset-url');

const SCHEMA_VERSION = 1;
const GENERATOR_PATH = 'tools/generate-egern-from-cmfa.js';
const GENERATED_EGERN_RULE_SET_URL_PREFIX = `${SCKI_REPOSITORY_BASE}/rulesets/generated/egern/`;

function normalizeText(value) {
  return String(value).replace(/\r\n/g, '\n');
}

function sha256Text(value) {
  return crypto.createHash('sha256').update(normalizeText(value), 'utf8').digest('hex');
}

function getRulesSource(profileSource) {
  const source = normalizeText(profileSource);
  const marker = '\nrules:\n';
  const index = source.indexOf(marker);
  return index === -1 ? '' : source.slice(index + marker.length);
}

function countMatches(source, pattern) {
  return [...source.matchAll(pattern)].length;
}

function getRenderedRuleMetrics(profileSource) {
  const rulesSource = getRulesSource(profileSource);
  return {
    rule_count: countMatches(rulesSource, /^  - [a-z_]+:\s*$/gm),
    rule_set_ref_count: countMatches(rulesSource, /^  - rule_set:\s*$/gm),
  };
}

function getGeneratedEgernRuleSetReferences(profileSource) {
  const references = [];
  for (const match of normalizeText(profileSource).matchAll(/^\s+match:\s+("[^"]+")\s*$/gm)) {
    const url = JSON.parse(match[1]);
    if (!url.startsWith(GENERATED_EGERN_RULE_SET_URL_PREFIX)) continue;
    references.push(decodeURIComponent(url.slice(GENERATED_EGERN_RULE_SET_URL_PREFIX.length).split(/[?#]/)[0]));
  }
  return references;
}

function getGeneratedEgernRuleSetRevisions(profileSource) {
  const revisions = [];
  for (const match of normalizeText(profileSource).matchAll(/^\s+match:\s+("[^"]+")\s*$/gm)) {
    const url = JSON.parse(match[1]);
    if (url.startsWith(GENERATED_EGERN_RULE_SET_URL_PREFIX)) revisions.push(getAssetRevisionFromUrl(url));
  }
  return revisions;
}

function listGeneratedEgernAssetRecords(directory) {
  return fs.readdirSync(directory)
    .filter((file) => file.endsWith('.yaml'))
    .sort()
    .map((file) => {
      const source = fs.readFileSync(path.join(directory, file), 'utf8');
      return {
        file,
        bytes: Buffer.byteLength(normalizeText(source), 'utf8'),
        sha256: sha256Text(source),
      };
    });
}

function buildEgernGenerationManifest({
  assetRevision,
  cmfaSource,
  routingGraphSource,
  profileSource,
  generatedRuleSetDirectory,
  sourceProviderCount,
  sourceRuleCount,
  ruleSetStats,
}) {
  const metrics = getRenderedRuleMetrics(profileSource);
  const assets = listGeneratedEgernAssetRecords(generatedRuleSetDirectory);
  return {
    schema_version: SCHEMA_VERSION,
    generator: GENERATOR_PATH,
    asset_revision: normalizeAssetRevision(assetRevision),
    source: {
      cmfa_sha256: sha256Text(cmfaSource),
      routing_graph_sha256: sha256Text(routingGraphSource),
      cmfa_provider_count: sourceProviderCount,
      cmfa_rule_count: sourceRuleCount,
    },
    rendered: {
      profile_sha256: sha256Text(profileSource),
      rule_count: metrics.rule_count,
      rule_set_ref_count: metrics.rule_set_ref_count,
      native_rule_set_count: assets.length,
      source_entry_count: ruleSetStats.totalEntries,
      dedup_removed: ruleSetStats.removedEntries,
      global_exact_duplicates_removed: ruleSetStats.globalExactDuplicates,
      empty_asset_count: ruleSetStats.emptyAssets,
    },
    assets: {
      files: assets,
      referenced_files: getGeneratedEgernRuleSetReferences(profileSource),
    },
  };
}

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function validateEgernGenerationManifest({
  manifest,
  cmfaSource,
  routingGraphSource,
  profileSource,
  generatedRuleSetDirectory,
  expectedSourceProviderCount,
  expectedSourceRuleCount,
  expectedAssetRevision,
}) {
  const failures = [];
  const check = (id, condition, message, value) => {
    if (!condition) failures.push({ id, message, value });
  };

  const source = manifest && manifest.source;
  const rendered = manifest && manifest.rendered;
  const assets = manifest && manifest.assets;
  const actualMetrics = getRenderedRuleMetrics(profileSource);
  const actualAssets = listGeneratedEgernAssetRecords(generatedRuleSetDirectory);
  const actualReferences = getGeneratedEgernRuleSetReferences(profileSource);
  const actualRevisions = getGeneratedEgernRuleSetRevisions(profileSource);
  const headerMatch = normalizeText(profileSource).match(/^# Egern rule sets:\s+(\d+) generated native YAML files\.$/m);

  check('schema', manifest && manifest.schema_version === SCHEMA_VERSION, `expected schema_version ${SCHEMA_VERSION}`);
  check('generator', manifest && manifest.generator === GENERATOR_PATH, `expected generator ${GENERATOR_PATH}`);
  check('asset-revision', manifest && manifest.asset_revision === normalizeAssetRevision(expectedAssetRevision), 'Egern asset revision does not match the source graph');
  check('source.cmfa-sha256', source && source.cmfa_sha256 === sha256Text(cmfaSource), 'CMFA source hash does not match generated Egern artifact');
  check('source.routing-graph-sha256', source && source.routing_graph_sha256 === sha256Text(routingGraphSource), 'routing graph hash does not match generated Egern artifact');
  check('source.cmfa-provider-count', source && source.cmfa_provider_count === expectedSourceProviderCount, 'CMFA provider count metadata is inconsistent');
  check('source.cmfa-rule-count', source && source.cmfa_rule_count === expectedSourceRuleCount, 'CMFA rule count metadata is inconsistent');
  check('rendered.profile-sha256', rendered && rendered.profile_sha256 === sha256Text(profileSource), 'Egern profile hash does not match generation manifest');
  check('rendered.rule-count', rendered && rendered.rule_count === actualMetrics.rule_count, 'Egern rendered rule count does not match generation manifest', actualMetrics.rule_count);
  check('rendered.rule-set-ref-count', rendered && rendered.rule_set_ref_count === actualMetrics.rule_set_ref_count, 'Egern rendered rule_set count does not match generation manifest', actualMetrics.rule_set_ref_count);
  check('rendered.native-rule-set-count', rendered && rendered.native_rule_set_count === actualAssets.length, 'Egern native rule-set count does not match generated asset inventory', actualAssets.length);
  check('rendered.nonnegative-generation-stats', rendered
    && Number.isInteger(rendered.source_entry_count)
    && Number.isInteger(rendered.dedup_removed)
    && Number.isInteger(rendered.global_exact_duplicates_removed)
    && Number.isInteger(rendered.empty_asset_count)
    && rendered.source_entry_count >= actualAssets.length
    && rendered.dedup_removed >= rendered.global_exact_duplicates_removed
    && rendered.global_exact_duplicates_removed >= 0
    && rendered.empty_asset_count >= 0,
  'Egern generation statistics are invalid');
  check('assets.header-count', headerMatch && Number(headerMatch[1]) === actualAssets.length, 'Egern profile asset-count header does not match generated asset inventory', actualAssets.length);
  check('assets.files', assets && sameJson(assets.files, actualAssets), 'Egern generated asset inventory or content hashes do not match generation manifest');
  check('assets.referenced-files', assets && sameJson(assets.referenced_files, actualReferences), 'Egern generated asset references do not match generation manifest');
  check('assets.references-unique', new Set(actualReferences).size === actualReferences.length, 'Egern profile references a generated asset more than once');
  check('assets.references-cover-inventory', sameJson([...actualReferences].sort(), actualAssets.map((asset) => asset.file)), 'Egern generated asset inventory must be referenced exactly once by the profile');
  check('assets.references-versioned', actualRevisions.length === actualReferences.length && actualRevisions.every((revision) => revision === manifest.asset_revision), 'Egern generated asset references must use the release asset revision', actualRevisions);

  return { failures, metrics: actualMetrics, assets: actualAssets, references: actualReferences };
}

module.exports = {
  GENERATED_EGERN_RULE_SET_URL_PREFIX,
  buildEgernGenerationManifest,
  getGeneratedEgernRuleSetReferences,
  getGeneratedEgernRuleSetRevisions,
  getRenderedRuleMetrics,
  listGeneratedEgernAssetRecords,
  normalizeText,
  sha256Text,
  validateEgernGenerationManifest,
};
