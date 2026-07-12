'use strict';

const { splitTopLevel } = require('./fused-rule-optimizer');

// `behavior: domain` accepts Clash wildcard payloads, not classical RULE-TYPE,value entries.
const MIHOMO_DOMAIN_PAYLOAD_TYPES = new Set([
  'DOMAIN',
  'DOMAIN-SUFFIX',
  'DOMAIN-WILDCARD',
]);

function ruleType(parts) {
  return String(parts[0] || '').toUpperCase().replace(/\s+/g, '');
}

function toMihomoDomainPayload(entry) {
  const text = String(entry || '').trim();
  if (!text) return null;
  if (!text.includes(',')) return text;

  const parts = splitTopLevel(text);
  const type = ruleType(parts);
  const value = String(parts[1] || '').trim();
  if (!value || !MIHOMO_DOMAIN_PAYLOAD_TYPES.has(type)) return null;

  if (type === 'DOMAIN') return value;
  if (type === 'DOMAIN-SUFFIX') {
    const suffix = value.replace(/^\+?\./, '');
    return suffix ? `+.${suffix}` : null;
  }
  return value;
}

function partitionMihomoDomainEntries(entries) {
  const payload = [];
  const residual = [];
  for (const entry of entries) {
    const converted = toMihomoDomainPayload(entry);
    if (converted) payload.push(converted);
    else residual.push(entry);
  }
  return { payload, residual };
}

module.exports = {
  partitionMihomoDomainEntries,
  toMihomoDomainPayload,
};
