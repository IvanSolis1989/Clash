# Maintenance tools

> 目录简介：这里存放仓库维护脚本和一致性校验工具，用于验证覆写脚本与跨客户端产物契约。

This directory contains repository-maintainer checks. These tools do not change
published client artifacts.

## Generated client artifacts

Run:

```bash
node tools/generate-stash-from-cmfa.js
node tools/generate-egern-supplemental.js
node tools/generate-egern-from-cmfa.js
node tools/sync-mihomo-mrs-rule-providers.js
node tools/apply-mihomo-mrs-overrides.js
node tools/build-fused-rule-sets.js
node tools/generate-fused-fallback-artifacts.js
```

Scope:

- reads `Clash Meta For Android/CMFA(mihomo).yaml` as the Stash source;
- writes `Stash/Stash.yaml`;
- preserves the shared 22 region groups, 33 business groups, rule-providers,
  and rules;
- removes Stash-unverified Mihomo-only fields such as GeoX auto-update,
  sniffer, provider health-check / exclude-filter, provider download `proxy`,
  and Mihomo-specific DNS fallback keys.
- reads `rulesets/supplemental/clash/*.list` as the Egern supplemental source;
- writes `rulesets/supplemental/egern/*.yaml` with Egern-native
  `domain_suffix_set` / `domain_set` / `ip_cidr_set` fields;
- skips process rule sets because Egern does not expose Clash-style
  `PROCESS-NAME` matching.
- reads `Clash Meta For Android/CMFA(mihomo).yaml` as the formal Egern source;
- writes `Egern/Egern.yaml` with 22 smart region groups, 33 business groups,
  CMFA rule order, and Egern-compatible YAML / text `rule_set` URLs;
- keeps Mihomo `.mrs` in Clash Party / CMFA, but does not emit `.mrs` URLs into
  Egern because Egern official docs do not document `.mrs` rule-set support.
- writes `rulesets/generated/mihomo-mrs/*.mrs` and
  `rulesets/generated/mihomo-mrs/manifest.json` for Mihomo-compatible
  products; mixed classical providers are split into `-domain` and `-ipcidr`
  rule providers.
- reads `rulesets/source/routing-graph.js` as the fused compiler input and
  writes `rulesets/generated/fused/**`; this is the authority for client
  fused rule-set consumption.
- writes fallback-native fused artifacts for clients that cannot consume
  Mihomo `.mrs`: v2rayN Xray is flattened into native RuleObject JSON, while
  Passwall / Passwall2 receive generated `rule-set:remote` `.srs` shunt rules.

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
- checks static group counts for CMFA, Stash, Shadowrocket, Surge, Loon, and
  Quantumult X;
- verifies Stash YAML is a generated CMFA derivative and does not carry
  unverified Mihomo-only keys;
- validates Mihomo `.mrs` conversion counts and generated file presence;
- validates formal Egern metadata, 22 region smart groups, 33 business groups,
  882 generated rules, 439 top-level rule-set references, and the absence of
  `.mrs` / process rule-set files in Egern;
- validates SingBox and v2rayN JSON structure, baseline metadata, and fused
  source mapping;
- extracts OpenClash heredoc YAML and, when Ruby is available, parses it through
  Ruby/Psych to catch duplicate top-level `rule-providers` / `rules` keys;
- checks Passwall / Passwall2 fused shunt-rule counts, generated `.srs` URLs,
  and rejects Clash-style rule prefixes inside `.list` files;
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
