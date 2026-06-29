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
  const activeRules = activeProcessRuleSet(text);
  const missing = surgeNames.filter((name) => !activeRules.has(`PROCESS-NAME,${name},DIRECT`));
  if (missing.length > 0) {
    failures.push(`${target}: missing ${missing.length} Surge Mac PROCESS-NAME rules: ${missing.join(', ')}`);
  }
  const missingWork = surgeWorkNames.filter((name) => !activeRules.has(`PROCESS-NAME,${name},${WORK_POLICY}`));
  if (missingWork.length > 0) {
    failures.push(`${target}: missing ${missingWork.length} Surge RustDesk WORK PROCESS-NAME rules: ${missingWork.join(', ')}`);
  }
}

{
  const target = 'SingBox/SingBox(sing-box)-full.json';
  const data = JSON.parse(read(target));
  const directProcessNames = new Set(
    (data.route?.rules || [])
      .filter((rule) => rule.action === 'route' && rule.outbound === 'DIRECT' && Array.isArray(rule.process_name))
      .flatMap((rule) => rule.process_name)
  );
  const workProcessNames = new Set(
    (data.route?.rules || [])
      .filter((rule) => rule.action === 'route' && rule.outbound === WORK_POLICY && Array.isArray(rule.process_name))
      .flatMap((rule) => rule.process_name)
  );
  const missing = mihomoNames.filter((name) => !directProcessNames.has(name));
  if (missing.length > 0) {
    failures.push(`${target}: missing ${missing.length} generated process_name route rules: ${missing.join(', ')}`);
  }
  const missingWork = mihomoWorkNames.filter((name) => !workProcessNames.has(name));
  if (missingWork.length > 0) {
    failures.push(`${target}: missing ${missingWork.length} generated RustDesk process_name WORK route rules: ${missingWork.join(', ')}`);
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
  const directNames = extractConstStringArray(text, 'LOCAL_TOOL_DIRECT_PROCESS_NAMES');
  const workNames = extractConstStringArray(text, 'RUSTDESK_WORK_PROCESS_NAMES');
  const missingDirect = mihomoNames.filter((name) => !directNames.includes(name));
  const missingWork = mihomoWorkNames.filter((name) => !workNames.includes(name));

  if (missingDirect.length > 0) {
    failures.push(`${target}: missing ${missingDirect.length} names in LOCAL_TOOL_DIRECT_PROCESS_NAMES: ${missingDirect.join(', ')}`);
  }
  if (missingWork.length > 0) {
    failures.push(`${target}: missing ${missingWork.length} names in RUSTDESK_WORK_PROCESS_NAMES: ${missingWork.join(', ')}`);
  }

  if (!text.includes('LOCAL_TOOL_DIRECT_PROCESS_NAMES.map(name => `PROCESS-NAME,${name},DIRECT`)')) {
    failures.push(`${target}: LOCAL_TOOL_DIRECT_PROCESS_NAMES is not mapped to PROCESS-NAME,<name>,DIRECT rules`);
  }
  if (!text.includes('RUSTDESK_WORK_PROCESS_NAMES.map(name => `PROCESS-NAME,${name},${BIZ.WORK}`)')) {
    failures.push(`${target}: RUSTDESK_WORK_PROCESS_NAMES is not mapped to WORK PROCESS-NAME rules`);
  }
}

function validateMihomoRuleTextTarget(target, text) {
  const activeRules = activeProcessRuleSet(text);
  const missing = mihomoNames.filter((name) => !activeRules.has(`PROCESS-NAME,${name},DIRECT`));
  if (missing.length > 0) {
    failures.push(`${target}: missing ${missing.length} desktop PROCESS-NAME rules: ${missing.join(', ')}`);
  }
  const missingWork = mihomoWorkNames.filter((name) => !hasWorkProcessRule(activeRules, name));
  if (missingWork.length > 0) {
    failures.push(`${target}: missing ${missingWork.length} RustDesk WORK PROCESS-NAME rules: ${missingWork.join(', ')}`);
  }
}

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function extractConstStringArray(text, constName) {
  const pattern = new RegExp(`const\\s+${constName}\\s*=\\s*\\[([\\s\\S]*?)\\]`);
  const match = text.match(pattern);
  if (!match) return [];
  const values = [];
  const stringPattern = /'((?:\\'|[^'])*)'|"((?:\\"|[^"])*)"/g;
  let item;
  while ((item = stringPattern.exec(match[1])) !== null) {
    values.push((item[1] || item[2] || '').replace(/\\'/g, "'").replace(/\\"/g, '"'));
  }
  return values;
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
