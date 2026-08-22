#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const {
  BIZ,
  SOURCE_GRAPH_VERSION,
  getRawRoutingGraph,
} = require('../../rulesets/source/routing-graph');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const FUSED_ROOT = path.join(REPO_ROOT, 'rulesets/generated/fused');
const GITHUB_API_TOOLS_RULE = `RULE-SET,scki-github-api-tools,${BIZ.TOOLS}`;
const GITHUB_API_AI_RULES = [
  `AND,((PROCESS-NAME,Code Helper),(DOMAIN,api.github.com)),${BIZ.AI}`,
  `AND,((PROCESS-NAME,Code Helper (Plugin)),(DOMAIN,api.github.com)),${BIZ.AI}`,
];

function readText(relativePath) {
  return fs.readFileSync(path.join(REPO_ROOT, relativePath), 'utf8');
}

function parseFusedRules() {
  const source = readText('Clash Party/ClashParty(mihomo-smart).js');
  const match = source.match(/const\s+MIHOMO_FUSED_RULES\s*=\s*(\[[^\r\n]*\])/);
  assert.ok(match, 'Clash Party Smart must contain MIHOMO_FUSED_RULES');
  return JSON.parse(match[1]);
}

function ruleSetEntries(segment) {
  const entry = segment.files && segment.files.clash;
  const files = Array.isArray(entry && entry.parts) ? entry.parts : [entry && entry.file].filter(Boolean);
  return files.flatMap((file) => readText(`rulesets/generated/fused/clash/${file}`)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#')));
}

function wildcardMatches(pattern, host) {
  const expression = `^${pattern.split('*').map((part) => part.replace(/[|\\{}()[\]^$+?.]/g, '\\$&')).join('.*')}$`;
  return new RegExp(expression, 'i').test(host);
}

function matchesDomainRule(rule, host) {
  const [type, value] = rule.split(',', 3);
  const normalized = host.toLowerCase();
  const candidate = String(value || '').toLowerCase();
  if (type === 'DOMAIN') return normalized === candidate;
  if (type === 'DOMAIN-SUFFIX') return normalized === candidate || normalized.endsWith(`.${candidate}`);
  if (type === 'DOMAIN-KEYWORD') return normalized.includes(candidate);
  if (type === 'DOMAIN-WILDCARD') return wildcardMatches(candidate, normalized);
  if (type === 'DOMAIN-REGEX') return new RegExp(value, 'i').test(normalized);
  return false;
}

function firstDomainRoute(host) {
  const manifest = JSON.parse(fs.readFileSync(path.join(FUSED_ROOT, 'manifest.json'), 'utf8'));
  const segments = new Map(manifest.segments.map((segment) => [segment.id, segment]));
  for (const rule of parseFusedRules()) {
    const [type, provider, policy] = rule.split(',', 3);
    if (type !== 'RULE-SET' || !provider.endsWith('-domain')) continue;
    const segment = segments.get(provider.slice(0, -'-domain'.length));
    if (segment && ruleSetEntries(segment).some((entry) => matchesDomainRule(entry, host))) {
      return { provider, policy };
    }
  }
  return null;
}

test('api.github.com keeps a process-scoped AI exception before its generic Tools route', () => {
  const graph = getRawRoutingGraph();
  const genericIndex = graph.rules.indexOf(GITHUB_API_TOOLS_RULE);
  const szkaneAiIndex = graph.rules.indexOf(`RULE-SET,szkane-ai,${BIZ.AI}`);

  assert.ok(genericIndex >= 0, 'api.github.com generic fallback must be a supplemental rule set');
  assert.ok(szkaneAiIndex > genericIndex, 'generic GitHub API route must precede broad AI provider');
  for (const rule of GITHUB_API_AI_RULES) {
    const index = graph.rules.indexOf(rule);
    assert.ok(index >= 0, `${rule} must remain in the source graph`);
    assert.ok(index < genericIndex, `${rule} must precede generic Tools fallback`);
  }
});

test('Gemini-specific rules reach Google before broad szkane AI matching', () => {
  const graph = getRawRoutingGraph();
  const geminiRule = `RULE-SET,gemini,${BIZ.GOOGLE}`;
  const accGeminiRule = `RULE-SET,acc-gemini,${BIZ.GOOGLE}`;
  const szkaneAiRule = `RULE-SET,szkane-ai,${BIZ.AI}`;
  const geminiIndex = graph.rules.indexOf(geminiRule);
  const szkaneAiIndex = graph.rules.indexOf(szkaneAiRule);
  const accGeminiIndex = graph.rules.indexOf(accGeminiRule);

  assert.ok(geminiIndex >= 0, 'gemini must target Google in the source graph');
  assert.ok(accGeminiIndex >= 0, 'acc-gemini must target Google in the source graph');
  assert.ok(szkaneAiIndex >= 0, 'szkane-ai must remain in the source graph');
  assert.ok(geminiIndex < szkaneAiIndex, 'gemini must remain before broad szkane AI matching');
  assert.ok(szkaneAiIndex < accGeminiIndex, 'szkane-ai must retain its relative source order');

  for (const host of [
    'gemini.google.com',
    'generativelanguage.googleapis.com',
    'apis.google.com',
    'ai.google',
    'deepmind.com',
  ]) {
    assert.equal(firstDomainRoute(host).policy, BIZ.GOOGLE, `${host} must first-match Google`);
  }
  assert.equal(firstDomainRoute('cerebras.ai').policy, BIZ.AI, 'non-Gemini szkane AI traffic must stay AI routed');
  assert.equal(firstDomainRoute('static.doubleclick.net').policy, BIZ.AD, 'advertising must retain priority over Google');
});

test('generated clients route generic GitHub API traffic to Tools while retaining supported process precision', () => {
  const genericRoute = firstDomainRoute('api.github.com');
  assert.ok(genericRoute, 'api.github.com must match a fused domain rule set');
  assert.equal(genericRoute.policy, BIZ.TOOLS, 'generic api.github.com traffic must not inherit AI routing');
  assert.equal(firstDomainRoute('api.githubcopilot.com').policy, BIZ.AI, 'Copilot-specific API must remain AI routed');

  const fusedRules = parseFusedRules();
  const genericRuleIndex = fusedRules.indexOf(`RULE-SET,${genericRoute.provider},${BIZ.TOOLS}`);
  assert.ok(genericRuleIndex >= 0, 'fused generic Tools route must be present');
  for (const rule of GITHUB_API_AI_RULES) {
    const index = fusedRules.indexOf(rule);
    assert.ok(index >= 0, `${rule} must survive in Mihomo output`);
    assert.ok(index < genericRuleIndex, `${rule} must precede generic Tools route`);
  }

  const egern = readText('Egern/Egern.yaml');
  assert.match(egern, new RegExp(`provider-${genericRoute.provider}\\.yaml\\?scki=${SOURCE_GRAPH_VERSION}`));
  assert.match(readText(`rulesets/generated/egern/provider-${genericRoute.provider}.yaml`), /api\.github\.com/);
  assert.doesNotMatch(egern, /Code Helper/, 'Egern must omit unsupported process-scoped rules');

  const singBox = JSON.parse(readText('SingBox/SingBox(sing-box)-full.json'));
  for (const processName of ['Code Helper', 'Code Helper (Plugin)']) {
    assert.ok((singBox.route.rules || []).some((rule) => (
      Array.isArray(rule.process_name)
      && rule.process_name.includes(processName)
      && Array.isArray(rule.domain)
      && rule.domain.includes('api.github.com')
      && rule.outbound === BIZ.AI
    )), `Sing-box must retain the ${processName} AI exception`);
  }

  const xray = JSON.parse(readText('v2rayN/v2rayN(xray).json'));
  const genericSegmentId = genericRoute.provider.replace(/-domain$/, '');
  const genericXrayIndex = xray.findIndex((rule) => rule.id === genericSegmentId);
  assert.ok(genericXrayIndex >= 0, 'Xray fallback must include the generic Tools segment');
  for (const processName of ['Code Helper', 'Code Helper (Plugin)']) {
    const xrayIndex = xray.findIndex((rule) => (
      Array.isArray(rule.process)
      && rule.process.includes(processName)
      && Array.isArray(rule.domain)
      && rule.domain.includes('full:api.github.com')
      && rule.outboundTag === 'proxy'
    ));
    assert.ok(xrayIndex >= 0, `Xray fallback must retain the ${processName} AI exception`);
    assert.ok(xrayIndex < genericXrayIndex, `${processName} must precede generic Xray Tools routing`);
  }
});
