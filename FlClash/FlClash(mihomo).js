// FlClash 覆写脚本 — 防御版
// 版本：v5.3.2-flclash.2 (2026-05-03)

const main = (config) => {
  // 确保 proxy-groups 存在
  if (!config["proxy-groups"]) {
    config["proxy-groups"] = [];
  }
  // 确保 rules 存在
  if (!config.rules) {
    config.rules = [];
  }
  // 确保 proxies 存在
  if (!config.proxies) {
    config.proxies = [];
  }

  // 构建测试节点列表
  var names = ["DIRECT"];
  for (var i = 0; i < config.proxies.length && i < 3; i++) {
    var p = config.proxies[i];
    if (p && p.name) { names.push(p.name); }
  }

  // 注入测试组（用 unshift 放在最前面）
  config["proxy-groups"].unshift({
    name: "TEST-GROUP",
    type: "select",
    proxies: names
  });

  // 注入测试规则
  config.rules.unshift("DOMAIN-SUFFIX,test.example.com,TEST-GROUP");

  return config;
};
