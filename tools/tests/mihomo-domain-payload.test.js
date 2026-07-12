'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  partitionMihomoDomainEntries,
  toMihomoDomainPayload,
} = require('../lib/mihomo-domain-payload');

test('Mihomo domain payload conversion uses wildcard grammar without broadening suffix rules', () => {
  assert.equal(toMihomoDomainPayload('DOMAIN,chat.openai.com'), 'chat.openai.com');
  assert.equal(toMihomoDomainPayload('DOMAIN-SUFFIX,chatgpt.com'), '+.chatgpt.com');
  assert.equal(toMihomoDomainPayload('DOMAIN-SUFFIX,.chatgpt.com'), '+.chatgpt.com');
  assert.equal(toMihomoDomainPayload('DOMAIN-WILDCARD,*.*.microsoft.com'), '*.*.microsoft.com');
});

test('Mihomo domain payload conversion keeps keyword and regex rules classical', () => {
  assert.equal(toMihomoDomainPayload('DOMAIN-KEYWORD,openai'), null);
  assert.equal(toMihomoDomainPayload('DOMAIN-REGEX,^chatgpt\\.example$'), null);

  assert.deepEqual(
    partitionMihomoDomainEntries([
      'DOMAIN,chat.openai.com',
      'DOMAIN-SUFFIX,chatgpt.com',
      'DOMAIN-KEYWORD,openai',
      'DOMAIN-REGEX,^chatgpt\\.example$',
    ]),
    {
      payload: ['chat.openai.com', '+.chatgpt.com'],
      residual: ['DOMAIN-KEYWORD,openai', 'DOMAIN-REGEX,^chatgpt\\.example$'],
    },
  );
});
