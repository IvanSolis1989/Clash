#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const MAX_JSDELIVR_ASSET_BYTES = 18 * 1024 * 1024;
const SELF_HOSTED_URL_RE = /https:\/\/(?:fastly\.)?jsdelivr\.net\/gh\/IvanSolis1989\/Smart-Config-Kit@main\/([^\s,"'\\]+)/g;
const CLIENT_FILES = [
  'Clash Party/ClashParty(mihomo-smart).js',
  'Clash Party/ClashParty(mihomo).js',
  'Clash Meta For Android/CMFA(mihomo).yaml',
  'Egern/Egern.yaml',
  'FlClash/FlClash(mihomo).js',
  'Loon/Loon.conf',
  'OpenClash/OpenClash(mihomo).sh',
  'OpenClash/OpenClash(mihomo-smart).sh',
  'Quantumult X/QuantumultX.conf',
  'Shadowrocket/Shadowrocket.conf',
  'SingBox/SingBox(sing-box)-full.json',
  'Stash/Stash.yaml',
  'Surge/Surge.conf',
  'v2rayN/v2rayN(xray).json',
];
const CLIENT_DIRECTORIES = [
  'Passwall',
  'Passwall2',
];

function collectClientFiles() {
  const files = CLIENT_FILES.map((relative) => path.join(REPO_ROOT, relative));
  for (const relativeDirectory of CLIENT_DIRECTORIES) {
    const directory = path.join(REPO_ROOT, relativeDirectory);
    for (const entry of fs.readdirSync(directory, { recursive: true, withFileTypes: true })) {
      if (entry.isFile() && (entry.name.endsWith('.conf') || entry.name.endsWith('.sh') || entry.name.endsWith('.list'))) {
        files.push(path.join(entry.parentPath, entry.name));
      }
    }
  }
  return files;
}

function collectGeneratedReferences() {
  const consumers = new Map();
  for (const file of collectClientFiles()) {
    const content = fs.readFileSync(file, 'utf8');
    const relativeConsumer = path.relative(REPO_ROOT, file).replace(/\\/g, '/');
    for (const match of content.matchAll(SELF_HOSTED_URL_RE)) {
      const relativeAsset = decodeURIComponent(match[1]).replace(/[?#].*$/, '');
      if (!relativeAsset.startsWith('rulesets/generated/')) continue;
      const rows = consumers.get(relativeAsset) || [];
      rows.push(relativeConsumer);
      consumers.set(relativeAsset, rows);
    }
  }
  return consumers;
}

function validateGeneratedRemoteAssetSizes() {
  const failures = [];
  const references = collectGeneratedReferences();
  for (const [relativeAsset, consumers] of references) {
    const asset = path.join(REPO_ROOT, relativeAsset);
    if (!fs.existsSync(asset)) {
      failures.push(`missing generated asset: ${relativeAsset} (referenced by ${[...new Set(consumers)].join(', ')})`);
      continue;
    }
    const size = fs.statSync(asset).size;
    if (size > MAX_JSDELIVR_ASSET_BYTES) {
      failures.push(`oversized jsDelivr asset: ${relativeAsset} = ${size} bytes, limit = ${MAX_JSDELIVR_ASSET_BYTES} bytes (referenced by ${[...new Set(consumers)].join(', ')})`);
    }
  }
  return { failures, references };
}

if (require.main === module) {
  const { failures, references } = validateGeneratedRemoteAssetSizes();
  if (failures.length) {
    console.error(`FAIL generated remote asset size validation: ${failures.length} issue(s) across ${references.size} referenced assets`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log(`PASS generated remote asset size validation: ${references.size} referenced assets <= ${MAX_JSDELIVR_ASSET_BYTES} bytes`);
}

module.exports = {
  MAX_JSDELIVR_ASSET_BYTES,
  collectGeneratedReferences,
  validateGeneratedRemoteAssetSizes,
};
