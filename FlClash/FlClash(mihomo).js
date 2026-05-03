// FlClash 覆写脚本 — 最小验证版
// 如果这个生效，说明 API 没问题；再逐步加功能。
// 版本：v5.3.2-flclash.2 (2026-05-03)

const main = (config) => {
  if (!config.proxies || !config["proxy-groups"]) return config;

  // ========== 测试 1：加一个自定义代理组 ==========
  var testGroup = {
    name: "🧪 测试组",
    type: "select",
    proxies: config.proxies.slice(0, 5).map(function(p) { return p.name }).concat(["DIRECT"])
  };
  config["proxy-groups"].push(testGroup);

  // ========== 测试 2：加一条前置规则 ==========
  var testRule = "DOMAIN-SUFFIX,example.com,🧪 测试组";
  if (!Array.isArray(config.rules)) config.rules = [];
  config.rules = [testRule].concat(config.rules);

  return config;
};
