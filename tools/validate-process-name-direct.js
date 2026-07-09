#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FIXTURE_PATH = path.join(__dirname, 'fixtures', 'process-name-direct-tools.json');
const fixture = JSON.parse(fs.readFileSync(FIXTURE_PATH, 'utf8'));

const mihomoNames = fixture.mihomoDesktopProcessNames;
const mihomoWorkNames = fixture.mihomoWorkProcessNames || [];
const surgeNames = fixture.surgeMacProcessNames;
const surgeWorkNames = fixture.surgeWorkProcessNames || [];
const WORK_POLICY = '🧑‍💼 会议协作';
const SCKI_REPO_BASE = 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused';
const MIHOMO_DIRECT_RULE_SET = 'scki-fused-007-direct-residual';
const MIHOMO_WORK_RULE_SET = 'scki-fused-008-work-residual';
const SURGE_DIRECT_PROCESS_URL = `${SCKI_REPO_BASE}/surge/scki-fused-007-direct.list`;
const SURGE_WORK_PROCESS_URL = `${SCKI_REPO_BASE}/surge/scki-fused-008-work.list`;

const mihomoJsTargets = [
  'Clash Party/ClashParty(mihomo-smart).js',
  'Clash Party/ClashParty(mihomo).js',
  'FlClash/FlClash(mihomo).js',
];

const mihomoRuleTextTargets = [
  'Clash Meta For Android/CMFA(mihomo).yaml',
  'OpenClash/OpenClash(mihomo).sh',
  'OpenClash/OpenClash(mihomo-smart).sh',
];

const unsupportedTargets = [
  'Shadowrocket/Shadowrocket.conf',
  'Loon/Loon.conf',
  'Quantumult X/QuantumultX.conf',
  'v2rayN/v2rayN(xray).json',
  'Passwall/Passwall(xray+sing-box)-apply.sh',
  'Passwall/Passwall(xray+sing-box).conf',
  'Passwall2/Passwall2(xray+sing-box)-apply.sh',
  'Passwall2/Passwall2(xray+sing-box).conf',
];

for (const dir of ['Passwall/shunt-rules', 'Passwall2/shunt-rules']) {
  for (const file of fs.readdirSync(path.join(ROOT, dir)).filter((name) => name.endsWith('.list'))) {
    unsupportedTargets.push(`${dir}/${file}`);
  }
}

const failures = [];

validateSupplementalProcessLists();

for (const target of mihomoJsTargets) {
  const text = read(target);
  validateMihomoJsTarget(target, text);
}

for (const target of mihomoRuleTextTargets) {
  const text = read(target);
  validateMihomoRuleTextTarget(target, text);
}

{
  const target = 'Surge/Surge.conf';
  const text = read(target);
  if (!text.includes(`RULE-SET,${SURGE_DIRECT_PROCESS_URL},DIRECT`)) {
    failures.push(`${target}: missing Surge Mac supplemental DIRECT process RULE-SET`);
  }
  if (!text.includes(`RULE-SET,${SURGE_WORK_PROCESS_URL},${WORK_POLICY}`)) {
    failures.push(`${target}: missing Surge Mac supplemental WORK process RULE-SET`);
  }
}

{
  const target = 'SingBox/SingBox(sing-box)-full.json';
  const data = JSON.parse(read(target));
  const routeRuleSets = new Set((data.route?.rule_set || []).map((ruleSet) => ruleSet.tag));
  if (!routeRuleSets.has('scki-fused-007-direct-residual')) {
    failures.push(`${target}: missing scki-fused-007-direct-residual remote rule_set`);
  }
  if (!routeRuleSets.has('scki-fused-008-work-residual')) {
    failures.push(`${target}: missing scki-fused-008-work-residual remote rule_set`);
  }
  const directProcessNames = readSingBoxFusedProcessNames('scki-fused-007-direct');
  const workProcessNames = readSingBoxFusedProcessNames('scki-fused-008-work');
  const missing = mihomoNames.filter((name) => !directProcessNames.has(name));
  if (missing.length > 0) {
    failures.push(`rulesets/generated/fused/sing-box/scki-fused-007-direct.json: missing ${missing.length} process_name entries: ${missing.join(', ')}`);
  }
  const missingWork = mihomoWorkNames.filter((name) => !workProcessNames.has(name));
  if (missingWork.length > 0) {
    failures.push(`rulesets/generated/fused/sing-box/scki-fused-008-work.json: missing ${missingWork.length} RustDesk process_name entries: ${missingWork.join(', ')}`);
  }
}

for (const target of unsupportedTargets) {
  const text = read(target);
  const activeProcessRules = text
    .split(/\r?\n/)
    .filter((line) => /^\s*(PROCESS-NAME|process-name),/.test(line));
  if (activeProcessRules.length > 0) {
    failures.push(`${target}: unsupported artifact contains active process rules`);
  }
}

if (failures.length > 0) {
  console.error('PROCESS-NAME direct whitelist validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`PROCESS-NAME policy validation: OK (${mihomoNames.length} direct desktop names, ${mihomoWorkNames.length} RustDesk work names, ${surgeNames.length} Surge direct names)`);

function validateMihomoJsTarget(target, text) {
  if (!text.includes(MIHOMO_DIRECT_RULE_SET)) {
    failures.push(`${target}: missing ${MIHOMO_DIRECT_RULE_SET} supplemental process rule-set reference`);
  }
  if (!text.includes(MIHOMO_WORK_RULE_SET)) {
    failures.push(`${target}: missing ${MIHOMO_WORK_RULE_SET} supplemental work-process rule-set reference`);
  }
}

function validateMihomoRuleTextTarget(target, text) {
  if (!text.includes(`RULE-SET,${MIHOMO_DIRECT_RULE_SET},DIRECT`)) {
    failures.push(`${target}: missing ${MIHOMO_DIRECT_RULE_SET} fused process RULE-SET`);
  }
  if (!text.includes(`RULE-SET,${MIHOMO_WORK_RULE_SET},`) || !text.includes('会议协作')) {
    failures.push(`${target}: missing ${MIHOMO_WORK_RULE_SET} fused work-process RULE-SET`);
  }
}

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function activeProcessRuleSet(text) {
  return new Set(text
    .split(/\r?\n/)
    .map(normalizeRuleLine)
    .filter((line) => line.startsWith('PROCESS-NAME,')));
}

function normalizeRuleLine(line) {
  let value = String(line || '').trim();
  if (!value || value.startsWith('#')) return '';
  if (value.startsWith('-')) value = value.slice(1).trim();
  if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
    value = value.slice(1, -1);
  }
  return value;
}

function hasWorkProcessRule(activeRules, name) {
  const exact = `PROCESS-NAME,${name},${WORK_POLICY}`;
  if (activeRules.has(exact)) return true;
  for (const rule of activeRules) {
    if (rule.startsWith(`PROCESS-NAME,${name},`) && rule.includes('会议协作')) return true;
  }
  return false;
}

function validateSupplementalProcessLists() {
  const mihomoDirect = readProcessRuleSet('rulesets/supplemental/clash/local-process-direct.list');
  const mihomoWork = readProcessRuleSet('rulesets/supplemental/clash/work-process.list');
  const surgeDirect = readProcessRuleSet('rulesets/supplemental/surge/local-process-direct.list');
  const surgeWork = readProcessRuleSet('rulesets/supplemental/surge/work-process.list');

  const missingMihomo = mihomoNames.filter((name) => !mihomoDirect.has(name));
  if (missingMihomo.length > 0) {
    failures.push(`rulesets/supplemental/clash/local-process-direct.list: missing ${missingMihomo.length} names: ${missingMihomo.join(', ')}`);
  }
  const missingMihomoWork = mihomoWorkNames.filter((name) => !mihomoWork.has(name));
  if (missingMihomoWork.length > 0) {
    failures.push(`rulesets/supplemental/clash/work-process.list: missing ${missingMihomoWork.length} names: ${missingMihomoWork.join(', ')}`);
  }
  const missingSurge = surgeNames.filter((name) => !surgeDirect.has(name));
  if (missingSurge.length > 0) {
    failures.push(`rulesets/supplemental/surge/local-process-direct.list: missing ${missingSurge.length} names: ${missingSurge.join(', ')}`);
  }
  const missingSurgeWork = surgeWorkNames.filter((name) => !surgeWork.has(name));
  if (missingSurgeWork.length > 0) {
    failures.push(`rulesets/supplemental/surge/work-process.list: missing ${missingSurgeWork.length} names: ${missingSurgeWork.join(', ')}`);
  }
}

function readProcessRuleSet(relativePath) {
  return new Set(read(relativePath)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => line.split(','))
    .filter((parts) => parts[0] === 'PROCESS-NAME' && parts[1])
    .map((parts) => parts[1]));
}

function readSingBoxFusedProcessNames(id) {
  const file = `rulesets/generated/fused/sing-box/${id}.json`;
  const data = JSON.parse(read(file));
  return new Set((data.rules || [])
    .filter((rule) => Array.isArray(rule.process_name))
    .flatMap((rule) => rule.process_name));
}
