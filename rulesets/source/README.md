# Source Routing Graph

`routing-graph.js` is the rule-authority input for Smart-Config-Kit.

It owns three relationships:

1. Upstream rule-provider IDs and URLs.
2. Raw rule order and final policy targets.
3. Mihomo MRS normalization used before fused rule-set compilation.

Client artifacts such as Clash Party, FlClash, CMFA, OpenClash, Stash, Shadowrocket, Surge, Loon, Quantumult X, Egern, SingBox, v2rayN, Passwall, and Passwall2 must consume generated fused outputs. They should not carry raw upstream provider maps or source rule injection code.

Tooling contract:

- `node tools/sync-mihomo-mrs-rule-providers.js` reads the raw provider graph.
- `node tools/apply-mihomo-mrs-overrides.js` updates the MRS normalization block in this source file.
- `node tools/build-fused-rule-sets.js` reads the Mihomo-normalized graph and writes `rulesets/generated/fused/**`.
- `node tools/generate-fused-fallback-artifacts.js` reads the fused manifest and writes native fallback mappings for v2rayN Xray, Passwall, and Passwall2.
