# Maintenance tools

> 目录简介：这里存放仓库维护脚本和一致性校验工具，用于验证覆写脚本与跨客户端产物契约。

This directory contains repository-maintainer checks. These tools do not change
published client artifacts.

## JS overwrite smoke contract

Run:

```bash
node tools/validate-js-overwrites.js
```

Scope:

- loads `Clash Party/ClashParty(mihomo-smart).js`,
  `Clash Party/ClashParty(mihomo).js`, and `FlClash/FlClash(mihomo).js`
  through their real `main(config)` entrypoint;
- validates alpha-3 node classification, info-node exclusion, home-node
  classification, empty-region non-fallback behavior, group order and group
  references;
- verifies subscription-native groups/rules/providers are removed;
- checks rule-provider download proxy, rule-provider references, final `MATCH`,
  TikTok target isolation, DNS fallback, TLS fingerprint handling, and the
  FlClash in-place mutation contract.

Useful options:

```bash
node tools/validate-js-overwrites.js --target smart
node tools/validate-js-overwrites.js --target normal
node tools/validate-js-overwrites.js --target flclash
node tools/validate-js-overwrites.js --json
node tools/validate-js-overwrites.js --verbose
```

## Cross-client artifact contract

Run:

```bash
node tools/validate-artifact-contracts.js
```

Scope:

- compiles the JS overwrite artifacts and checks that Normal / FlClash follow
  the Clash Party Smart baseline version;
- checks static group counts for CMFA, Shadowrocket, Surge, Loon, and
  Quantumult X;
- validates SingBox and v2rayN JSON structure and baseline metadata;
- extracts OpenClash heredoc YAML and, when Ruby is available, parses it through
  Ruby/Psych to catch duplicate top-level `rule-providers` / `rules` keys;
- checks Passwall / Passwall2 shunt-rule counts and rejects Clash-style rule
  prefixes inside `.list` files;
- includes legacy reference `.conf` files in the sha256 manifest and warns when
  they drift from the authoritative `.sh` / shunt-rule artifacts;
- can emit a sha256 manifest for release review without changing any published
  artifact.

Useful options:

```bash
node tools/validate-artifact-contracts.js --json
node tools/validate-artifact-contracts.js --strict-ruby
node tools/validate-artifact-contracts.js --write-manifest docs/runtime/artifact-manifest.json
```

## PROCESS-NAME direct whitelist

Run:

```bash
node tools/validate-process-name-direct.js
```

Scope:

- validates the desktop local-tool direct whitelist from
  `tools/fixtures/process-name-direct-tools.json`;
- checks Clash Party, FlClash, CMFA, OpenClash Normal/Smart, Surge Mac, and
  generated SingBox Full output;
- rejects accidental active process rules in unsupported mobile/router artifacts.
