import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(root, "docs/audits/images/2026-10-21-7group");
fs.mkdirSync(outputDir, { recursive: true });

const capabilityLabels = {
  information_extraction: "信息提取",
  cross_session_reasoning: "跨会话推理",
  temporal_reasoning: "时间推理",
  knowledge_update: "知识更新",
  personalization: "个性化",
  assistant_memory: "助手历史记忆",
  numerical_aggregation: "数值聚合",
  evidence_tracking: "证据追踪",
  conflict_resolution: "冲突解决",
  abstention: "信息不足拒答",
};

const riskLabels = {
  temporal_disorder: "时间顺序错乱",
  false_commitment: "虚假承诺与核验",
  global_memory_leak: "全局记忆泄漏",
  actor_transfer: "行为主体转移",
  identity_pollution: "人物身份污染",
  fabricated_action: "虚构行为写入记忆",
  item_state_migration: "物品所有权与位置迁移",
};

const chinese = {
  A: {
    name: "中文 A · 顾澄安",
    total: 34,
    passed: 22,
    base: 12,
    expanded: 22,
    capabilities: [
      ["assistant_memory", 3, 4],
      ["conflict_resolution", 1, 1],
      ["cross_session_reasoning", 6, 9],
      ["evidence_tracking", 1, 3],
      ["information_extraction", 11, 17],
      ["knowledge_update", 8, 10],
      ["numerical_aggregation", 2, 4],
      ["personalization", 1, 5],
      ["temporal_reasoning", 11, 16],
    ],
    risks: [
      ["actor_transfer", 4, 6],
      ["fabricated_action", 6, 6],
      ["false_commitment", 8, 12],
      ["global_memory_leak", 6, 9],
      ["identity_pollution", 5, 9],
      ["item_state_migration", 3, 3],
      ["temporal_disorder", 9, 15],
    ],
    note: "个性化和证据追踪最弱；物品迁移与虚构行为控制较好。",
  },
  B: {
    name: "中文 B · 陆知行",
    total: 33,
    passed: 22,
    base: 12,
    expanded: 21,
    capabilities: [
      ["abstention", 2, 2],
      ["assistant_memory", 1, 4],
      ["conflict_resolution", 2, 2],
      ["cross_session_reasoning", 7, 13],
      ["evidence_tracking", 3, 4],
      ["information_extraction", 9, 16],
      ["knowledge_update", 7, 9],
      ["numerical_aggregation", 4, 5],
      ["personalization", 3, 4],
      ["temporal_reasoning", 9, 12],
    ],
    risks: [
      ["actor_transfer", 4, 8],
      ["fabricated_action", 9, 17],
      ["false_commitment", 6, 10],
      ["global_memory_leak", 5, 10],
      ["identity_pollution", 6, 7],
      ["item_state_migration", 2, 2],
      ["temporal_disorder", 11, 15],
    ],
    note: "助手历史记忆、行为主体和全局边界是主要失分来源。",
  },
  C: {
    name: "中文 C · 沈予宁",
    total: 33,
    passed: 22,
    base: 12,
    expanded: 21,
    capabilities: [
      ["abstention", 2, 2],
      ["assistant_memory", 1, 4],
      ["conflict_resolution", 2, 3],
      ["cross_session_reasoning", 7, 11],
      ["evidence_tracking", 4, 8],
      ["information_extraction", 10, 15],
      ["knowledge_update", 9, 12],
      ["numerical_aggregation", 5, 6],
      ["personalization", 2, 5],
      ["temporal_reasoning", 7, 9],
    ],
    risks: [
      ["actor_transfer", 3, 7],
      ["fabricated_action", 10, 16],
      ["false_commitment", 7, 9],
      ["global_memory_leak", 4, 7],
      ["identity_pollution", 2, 3],
      ["item_state_migration", 3, 4],
      ["temporal_disorder", 10, 13],
    ],
    note: "行为主体转移最弱，其次是全局泄漏和虚构行为。",
  },
};

const rsi = {
  passed: 56,
  total: 100,
  stages: [
    ["Stage 1 · 基础场景", 17, 25, 74.5],
    ["Stage 7 · 跨会话扩充", 39, 75, 81.2],
  ],
  categories: [
    ["时间顺序错乱", 2, 8, 54.3],
    ["行为主体转移", 3, 10, 76.3],
    ["数值聚合", 4, 12, null],
    ["全局记忆泄漏", 2, 5, 88.9],
    ["人物身份污染", 6, 10, 84.8],
    ["物品所有权与位置迁移", 10, 18, 86.5],
    ["虚假承诺与核验", 10, 16, 87.1],
    ["虚构行为写入记忆", 6, 8, 84.0],
    ["消费与行为", 8, 12, 66.7],
    ["地点与路径", 4, 5, 88.9],
    ["时序与条件", 0, 2, 0],
    ["证据边界", 2, 3, 100],
    ["因果与力量", 1, 1, 100],
    ["记忆与主体 / 主体与台词", 2, 2, 100],
  ],
};

const novel = {
  old: {
    total: 200,
    passed: 93,
    stages: [47.5, 42.5, 60, 30, 52.5],
    zeroBuckets: 194,
    meanBuckets: 0.47,
  },
  next: {
    total: 200,
    passed: 120,
    stages: [62.5, 57.5, 60, 57.5, 62.5],
    zeroBuckets: 12,
    meanBuckets: 9.97,
  },
  risks: [
    ["时间顺序错乱", 48.3, 69.0, 29],
    ["物品所有权与位置迁移", 32.5, 47.5, 40],
    ["虚假承诺与核验", 48.4, 71.0, 31],
    ["全局记忆泄漏", 42.9, 52.4, 21],
    ["人物身份污染", 52.6, 68.4, 19],
    ["虚构行为写入记忆", 50.0, 42.9, 28],
    ["行为主体转移", 56.3, 71.9, 32],
  ],
};

const ncp = {
  episodes: 10,
  turns: 8.0,
  trajectory: 16.2,
  commitment: 9.1,
  factConflict: 80.0,
  commitmentConflict: 0.0,
  playerConflict: 20.0,
  conflictCount: 10,
  allResolved: 0,
  maxTurnsStop: 0,
};

const finrank = {
  total: 30,
  passed: 18,
  soft: 20,
  atomicCorrect: 107,
  atomicTotal: 146,
  evidenceCorrect: 84,
  evidenceTotal: 101,
  types: [
    ["Easy", "10/10", 6, 10, 6, 10, 25, 42, 28, 34],
    ["Medium", "10/10", 7, 10, 8, 10, 39, 44, 25, 27],
    ["Hard", "10/10", 5, 10, 6, 10, 43, 60, 31, 40],
    ["Qualitative", "16/16", 9, 16, 10, 16, 66, 88, 57, 69],
    ["Quantitative", "14/14", 9, 14, 10, 14, 41, 50, 27, 28],
  ],
};

const pct = (passed, total) => total ? Math.round((passed / total) * 1000) / 10 : 0;
const one = (value) => `${Number(value).toFixed(1)}%`;
const barWidth = (passed, total) => `${Math.max(0, Math.min(100, pct(passed, total)))}%`;
const rateClass = (rate) => rate < 55 ? "poor" : rate < 70 ? "watch" : "good";

function barRow(label, passed, total, meta = "") {
  const rate = pct(passed, total);
  return `<div class="bar-row">
    <div class="bar-label">${label}${meta ? `<span>${meta}</span>` : ""}</div>
    <div class="bar-track"><div class="bar-fill ${rateClass(rate)}" style="width:${barWidth(passed, total)}"></div></div>
    <div class="bar-value">${passed}/${total}<b>${one(rate)}</b></div>
  </div>`;
}

function metricCard(label, value, note, tone = "") {
  return `<div class="metric ${tone}"><div class="metric-label">${label}</div><div class="metric-value">${value}</div><div class="metric-note">${note}</div></div>`;
}

function shell(index, kicker, title, subtitle, body, footer = "") {
  return `<section class="page" id="page-${index}">
    <div class="page-accent"></div>
    <header class="page-head">
      <div>
        <div class="kicker">${kicker}</div>
        <h1>${title}</h1>
        <p>${subtitle}</p>
      </div>
      <div class="brand">MEMORAX<br><span>EVAL / 2026</span></div>
    </header>
    <main>${body}</main>
    <footer>
      <span>7组专项评测 · 2026-10-21</span>
      <span>${footer}</span>
      <span>${String(index).padStart(2, "0")} / 09</span>
    </footer>
  </section>`;
}

const overviewGroups = [
  ["中文 A", "顾澄安", "22 / 34", "64.7%", "34题 · 0执行错误", "teal"],
  ["中文 B", "陆知行", "22 / 33", "66.7%", "33题 · 0执行错误", "teal"],
  ["中文 C", "沈予宁", "22 / 33", "66.7%", "33题 · 0执行错误", "teal"],
  ["包子 / RSI", "跨会话行为记忆", "56 / 100", "56.0%", "100题 · 0执行错误", "blue"],
  ["小说四 trace", "四部剧情 · 五阶段", "120 / 200", "60.0%", "关键词选桶 · 复测", "orange"],
  ["NCP-Bench", "电影闭环记忆", "10 / 10", "完成", "平均 8 turns / 部", "violet"],
  ["FinRank v22", "金融专用 YAML", "18 / 30", "60.0%", "30道有效样本", "red"],
];

const pages = [];

pages.push(shell(
  1,
  "EXECUTIVE OVERVIEW",
  "记忆系统评测 · 7组专项结果",
  "R79 通用 YAML + FinRank 金融专用 YAML · 2026-10-21",
  `<div class="overview-top">
    ${metricCard("测试组", "7", "中文 A/B/C、包子、小说、NCP、金融")}
    ${metricCard("评测任务", "440", "430 道问答 + 10 部 NCP 电影")}
    ${metricCard("YAML 文件", "2", "通用 R79 + 金融 source-relations")}
    ${metricCard("未解决执行异常", "0", "金融 2 题由替补题计入30题")}
  </div>
  <div class="group-grid">
    ${overviewGroups.map(([name, desc, count, rate, note, tone]) => `
      <div class="group-card ${tone}">
        <div class="group-title">${name}</div>
        <div class="group-desc">${desc}</div>
        <div class="group-score">${rate}</div>
        <div class="group-count">${count}</div>
        <div class="group-note">${note}</div>
      </div>`).join("")}
  </div>
  <div class="insight-grid">
    <div><b>提升最大</b><span>小说切关键词选桶后，准确率 46.5% → 60.0%。</span></div>
    <div><b>主要短板</b><span>行为主体、时间顺序、物品迁移仍是跨组共性风险。</span></div>
    <div><b>稳定性</b><span>全量后端测试 260 passed；本轮无遗留执行错误。</span></div>
  </div>`,
  "总览"
));

for (const [key, group] of Object.entries(chinese)) {
  const rate = pct(group.passed, group.total);
  const index = key === "A" ? 2 : key === "B" ? 3 : 4;
  const weakestCap = [...group.capabilities].sort((a, b) => pct(a[1], a[2]) - pct(b[1], b[2]))[0];
  const weakestRisk = [...group.risks].sort((a, b) => pct(a[1], a[2]) - pct(b[1], b[2]))[0];
  pages.push(shell(
    index,
    `CHINESE PROFILE / ${key}`,
    group.name,
    `${group.total} 道题 · ${group.base} 道 LongMemEval 基础题 + ${group.expanded} 道高风险扩充题`,
    `<div class="profile-hero">
      <div class="score-block">
        <div class="score-number">${one(rate)}</div>
        <div class="score-count">${group.passed} / ${group.total} 通过</div>
        <div class="score-tags"><span>0 执行错误</span><span>R79 通用 YAML</span></div>
      </div>
      <div class="hero-note">
        <div class="eyebrow">一句话判断</div>
        <div class="hero-copy">${group.note}</div>
        <div class="hero-mini">
          <span>最弱能力：${capabilityLabels[weakestCap[0]]} ${pct(weakestCap[1], weakestCap[2]).toFixed(1)}%</span>
          <span>最弱风险：${riskLabels[weakestRisk[0]]} ${pct(weakestRisk[1], weakestRisk[2]).toFixed(1)}%</span>
        </div>
      </div>
    </div>
    <div class="two-col">
      <section class="panel">
        <div class="panel-head"><h2>LongMemEval 能力类型</h2><span>多标签 · 一题可计入多类</span></div>
        <div class="bar-list">${group.capabilities.map(([name, passed, total]) =>
          barRow(capabilityLabels[name], passed, total)).join("")}</div>
      </section>
      <section class="panel">
        <div class="panel-head"><h2>七类风险</h2><span>与小说测试统一口径</span></div>
        <div class="bar-list">${group.risks.map(([name, passed, total]) =>
          barRow(riskLabels[name], passed, total)).join("")}</div>
      </section>
    </div>`,
    `中文 ${key}`
  ));
}

pages.push(shell(
  5,
  "RSI / CROSS-SESSION BEHAVIOR",
  "包子 / RSI · 跨会话行为记忆",
  "100 道场景与多会话题 · 121 turns / 241 messages · 七类风险多标签",
  `<div class="rsi-top">
    <div class="rsi-score">
      <div class="score-number">56.0%</div>
      <div class="score-count">56 / 100 通过 · 0 执行错误</div>
    </div>
    ${rsi.stages.map(([name, passed, total, coverage]) => `
      <div class="stage-card">
        <div class="eyebrow">${name}</div>
        <div class="stage-rate">${one(pct(passed, total))}</div>
        <div class="stage-count">${passed} / ${total} 通过</div>
        <div class="mini-track"><span style="width:${pct(passed, total)}%"></span></div>
        <div class="stage-foot">必答点覆盖 ${one(coverage)}</div>
      </div>`).join("")}
  </div>
  <section class="panel full fin-table-panel">
    <div class="panel-head"><h2>题目主类型</h2><span>通过率 · 必答点覆盖率</span></div>
    <div class="category-grid">
      ${rsi.categories.map(([name, passed, total, coverage]) => `
        <div class="category-row">
          <div class="category-name">${name}</div>
          <div class="category-bar"><span class="${rateClass(pct(passed, total))}" style="width:${pct(passed, total)}%"></span></div>
          <div class="category-value">${passed}/${total} <b>${one(pct(passed, total))}</b></div>
          <div class="category-cover">${coverage == null ? "—" : one(coverage)}</div>
        </div>`).join("")}
    </div>
    <div class="panel-note"><b>报告重点：</b>时间顺序 25.0%、行为主体 30.0%、数值聚合 33.3%。Stage 7 从 68.0% 降到 52.0%，说明历史变长后关系保持明显衰减。</div>
  </section>`,
  "包子 / RSI"
));

pages.push(shell(
  6,
  "NOVEL / SEARCH INTERVENTION",
  "小说四 trace · 关键词选桶复测",
  "同一 R79 YAML、同一 200 题；仅把普通 Search 改为 search_semantic_2_bucket + 冻结关键词",
  `<div class="novel-top">
    ${metricCard("旧 Search", "46.5%", "93 / 200", "neutral")}
    <div class="arrow-block">→</div>
    ${metricCard("关键词选桶", "60.0%", "120 / 200", "accent")}
    ${metricCard("提升", "+13.5pp", "通过数 +27", "success")}
  </div>
  <div class="two-col novel-middle">
    <section class="panel">
      <div class="panel-head"><h2>分阶段准确率</h2><span>旧 vs 新</span></div>
      ${novel.next.stages.map((value, i) => `
        <div class="dual-row">
          <div class="dual-label">Stage ${i + 1}</div>
          <div class="dual-bars">
            <span class="old" style="width:${novel.old.stages[i]}%"></span>
            <span class="new" style="width:${value}%"></span>
          </div>
          <div class="dual-value">${one(novel.old.stages[i])} → <b>${one(value)}</b></div>
        </div>`).join("")}
    </section>
    <section class="panel retrieval-panel">
      <div class="panel-head"><h2>检索健康</h2><span>200 题响应统计</span></div>
      <div class="retrieval-compare">
        <div><span>零桶题</span><strong>194 → 12</strong><small>下降 182 题</small></div>
        <div><span>平均桶数</span><strong>0.47 → 9.97</strong><small>中位数 8</small></div>
        <div><span>问题根因</span><strong>普通 Search 基本不选桶</strong><small>并非题干无法命中</small></div>
      </div>
    </section>
  </div>
  <section class="panel full compact">
    <div class="panel-head"><h2>七类风险变化</h2><span>按题目数加权</span></div>
    <div class="risk-delta-grid">
      ${novel.risks.map(([name, before, after, count]) => {
        const delta = after - before;
        return `<div class="delta-row">
          <div>${name}<span>${count}题</span></div>
          <div class="delta-values">${one(before)} → <b>${one(after)}</b></div>
          <div class="delta ${delta >= 0 ? "up" : "down"}">${delta >= 0 ? "+" : ""}${delta.toFixed(1)}pp</div>
        </div>`;
      }).join("")}
    </div>
    <div class="panel-note"><b>仍未解决：</b>虚构行为写入记忆回退 7.1pp；物品迁移 47.5%、全局泄漏 52.4%，说明选桶改善不能替代主体和事件边界治理。</div>
  </section>`,
  "小说四 trace"
));

pages.push(shell(
  7,
  "NCP-BENCH / MULTI-TURN CLOSURE",
  "NCP-Bench · 电影闭环记忆",
  "10 部电影独立闭环 · Add / Search 均使用 R79 通用 YAML · 平均 8 turns",
  `<div class="ncp-metrics">
    ${metricCard("完成电影", "10 / 10", "0 执行错误", "success")}
    ${metricCard("平均 Trajectory", "16.2%", "剧情推进覆盖率", "poor")}
    ${metricCard("Commitment", "9.1%", "承诺满足率", "poor")}
    ${metricCard("Fact Conflict", "80.0%", "越低越好", "poor")}
    ${metricCard("冲突数量", "10", "10/10 以冲突结束", "watch")}
    ${metricCard("完全解决", "0 / 10", "没有一部完整消解冲突", "poor")}
  </div>
  <div class="two-col ncp-bottom">
    <section class="panel">
      <div class="panel-head"><h2>冲突结构</h2><span>按 NCP 指标</span></div>
      ${barRow("事实冲突", 8, 10, "Fact conflict rate")}
      ${barRow("玩家输入冲突", 2, 10, "Player input conflict rate")}
      ${barRow("承诺冲突", 0, 10, "Commitment conflict rate")}
      <div class="panel-note">事实冲突是主要问题；承诺冲突为零，但承诺满足率只有 9.1%，多数承诺没有被真正执行。</div>
    </section>
    <section class="panel callout-panel">
      <div class="eyebrow">解释</div>
      <div class="big-callout">不是“跑不稳”，<br>而是“闭环推进弱”。</div>
      <p>10 部电影均在 8 turns 左右触发冲突终止，没有一部达到最大 turn。说明模型会较快暴露矛盾，但无法在后续轮次修复并继续完成剧情目标。</p>
    </section>
  </div>`,
  "NCP-Bench"
));

pages.push(shell(
  8,
  "FINRANK / FINANCE-SPECIFIC YAML",
  "FinRank v22 · 金融证据评测",
  "30 道有效样本 · 金融专用 source-relations YAML · 固定 30 题展示口径",
  `<div class="fin-overview">
    ${metricCard("Completion", "30 / 30", "含2道替补", "success")}
    ${metricCard("Hard ACC", "60.0%", "18 / 30", "watch")}
    ${metricCard("Soft ACC", "66.7%", "20 / 30", "watch")}
    ${metricCard("Atomic", "73.3%", "107 / 146", "good")}
    ${metricCard("Evidence", "83.2%", "84 / 101", "success")}
  </div>
  <section class="panel full">
    <div class="panel-head"><h2>按题目类型拆分</h2><span>Hard / Soft / Atomic / Evidence</span></div>
    <table class="data-table">
      <thead><tr><th>类型</th><th>完成</th><th>Hard ACC</th><th>Soft ACC</th><th>Atomic</th><th>Evidence</th></tr></thead>
      <tbody>
      ${finrank.types.map(([name, completion, hp, ht, sp, st, ac, at, ec, et]) => `
        <tr>
          <td><b>${name}</b></td>
          <td>${completion}</td>
          <td><span class="${rateClass(pct(hp, ht))}">${one(pct(hp, ht))}</span><small>${hp}/${ht}</small></td>
          <td><span class="${rateClass(pct(sp, st))}">${one(pct(sp, st))}</span><small>${sp}/${st}</small></td>
          <td><span class="${rateClass(pct(ac, at))}">${one(pct(ac, at))}</span><small>${ac}/${at}</small></td>
          <td><span class="${rateClass(pct(ec, et))}">${one(pct(ec, et))}</span><small>${ec}/${et}</small></td>
        </tr>`).join("")}
      </tbody>
    </table>
  </section>
  <div class="fin-notes">
    <div><b>正式口径</b><span>原计划 30 道；2 道 Add 504 使用替补题 CTRL-12/19 填充，展示与计算均为 30 道有效样本。</span></div>
    <div><b>审计保留</b><span>失败原题、替补映射和运行 ID 保留在审计记录中，不删除原始失败证据。</span></div>
    <div><b>关键短板</b><span>Hard 题最低（50%），Quantitative 和 Medium 相对改善；回答正确但证据来源未对齐仍会判 Hard fail。</span></div>
  </div>`,
  "FinRank v22"
));

pages.push(shell(
  9,
  "METHODOLOGY / TRACEABILITY",
  "评测范围与口径",
  "本轮 7 组测试的数据来源、YAML 映射和结果解释边界",
  `<div class="method-grid">
    <section class="panel method-panel">
      <div class="panel-head"><h2>数据集与规模</h2><span>本轮实际执行</span></div>
      <table class="method-table">
        <tr><td>中文 A/B/C</td><td>100 题</td><td>12 基础 + 22/21/21 高风险扩充</td></tr>
        <tr><td>包子 / RSI</td><td>100 题</td><td>121 turns / 241 messages</td></tr>
        <tr><td>小说四 trace</td><td>200 题</td><td>4 traces / 400 turns / 499 必答点</td></tr>
        <tr><td>NCP-Bench</td><td>10 部</td><td>平均 8 turns / 部，共 80 turns</td></tr>
        <tr><td>FinRank v22</td><td>30 题</td><td>28 原题 + 2 替补；固定 30 有效样本</td></tr>
      </table>
    </section>
    <section class="panel method-panel">
      <div class="panel-head"><h2>YAML 与 Search 策略</h2><span>两份 YAML，三类策略</span></div>
      <div class="strategy-list">
        <div><b>通用关键词选桶</b><span>中文三组 + 包子</span><em>semantic_2_bucket · 原题+关键词 · k=14/6</em></div>
        <div><b>通用语义选桶</b><span>小说四 trace</span><em>semantic_2_bucket · 冻结关键词 · k=14/6</em></div>
        <div><b>通用普通搜索</b><span>NCP-Bench</span><em>search · top_k=10 · R79 YAML</em></div>
        <div><b>金融专用搜索</b><span>FinRank v22</span><em>source-relations YAML · 完整 Bucket census</em></div>
      </div>
    </section>
  </div>
  <div class="boundary-grid">
    <div><b>多标签口径</b><span>能力类型和七类风险均可一题计入多类，因此分类合计可超过题量。</span></div>
    <div><b>不同测试不可直接混算</b><span>NCP 没有通过/失败准确率；FinRank 使用固定 30 题和原子评分。</span></div>
    <div><b>结论边界</b><span>图片数据来自对应运行冻结文件；小说结果已包含 2 道 Judge 失败的安全重试。</span></div>
  </div>
  <div class="run-ids">
    <span>主运行 d50d95f76e3e4977</span>
    <span>A/金融补跑 b81c8bbebbb74737</span>
    <span>小说复测 e036285024284547</span>
    <span>NCP 7edc2c40dcff4bba</span>
  </div>`,
  "方法与审计"
));

const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>MemoraX 7组专项评测</title>
<style>
  :root {
    --ink: #17202a;
    --muted: #617080;
    --line: #d7dee6;
    --surface: #fbfcfd;
    --panel: #f2f5f8;
    --teal: #0f766e;
    --blue: #2563eb;
    --orange: #d97706;
    --violet: #7c3aed;
    --red: #c2413b;
    --green: #16825d;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #cbd5e1; }
  body { font-family: "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Microsoft YaHei", sans-serif; color: var(--ink); }
  .page {
    position: relative; width: 1600px; height: 1000px; padding: 54px 72px 48px;
    background: var(--surface); overflow: hidden;
  }
  .page-accent { position: absolute; left: 0; top: 0; width: 12px; height: 100%; background: var(--teal); }
  .page-head { display: flex; justify-content: space-between; align-items: flex-start; min-height: 144px; }
  .kicker { font-size: 14px; letter-spacing: 2.4px; color: var(--teal); font-weight: 600; margin-bottom: 12px; }
  h1 { margin: 0; font-size: 46px; line-height: 1.16; letter-spacing: 0; font-weight: 600; }
  .page-head p { margin: 12px 0 0; color: var(--muted); font-size: 18px; line-height: 1.5; }
  .brand { text-align: right; color: var(--ink); font-size: 18px; line-height: 1.2; font-weight: 700; letter-spacing: 1.5px; }
  .brand span { color: var(--muted); font-size: 11px; letter-spacing: 2px; }
  main { height: 748px; }
  footer { position: absolute; left: 72px; right: 72px; bottom: 22px; border-top: 1px solid var(--line); padding-top: 12px; display: flex; justify-content: space-between; color: var(--muted); font-size: 12px; }
  .overview-top, .fin-overview, .ncp-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 22px; }
  .ncp-metrics { grid-template-columns: repeat(6, 1fr); }
  .fin-overview { grid-template-columns: repeat(5, 1fr); margin-bottom: 16px; }
  .fin-overview .metric { min-height: 104px; padding: 14px 20px; }
  .fin-overview .metric-value { font-size: 30px; margin-top: 7px; }
  .metric { min-height: 124px; padding: 20px 22px; background: var(--panel); border-radius: 8px; border-left: 4px solid var(--teal); }
  .metric-label { font-size: 13px; color: var(--muted); }
  .metric-value { font-size: 34px; line-height: 1.1; font-weight: 600; margin-top: 10px; }
  .metric-note { font-size: 12px; color: var(--muted); margin-top: 8px; min-height: 18px; }
  .metric.success { border-color: var(--green); }
  .metric.accent { border-color: var(--orange); }
  .metric.poor { border-color: var(--red); }
  .metric.watch { border-color: var(--orange); }
  .metric.good { border-color: var(--teal); }
  .group-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
  .group-card { min-height: 180px; padding: 20px; border-radius: 8px; background: var(--panel); border-top: 4px solid var(--teal); }
  .group-card.blue { border-color: var(--blue); }
  .group-card.orange { border-color: var(--orange); }
  .group-card.violet { border-color: var(--violet); }
  .group-card.red { border-color: var(--red); }
  .group-title { font-size: 18px; font-weight: 600; }
  .group-desc { color: var(--muted); font-size: 13px; margin-top: 4px; }
  .group-score { font-size: 38px; font-weight: 600; margin-top: 18px; }
  .group-count { font-size: 13px; color: var(--muted); margin-top: 2px; }
  .group-note { font-size: 12px; color: var(--muted); margin-top: 14px; }
  .insight-grid { margin-top: 22px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .insight-grid div, .boundary-grid div, .fin-notes div { padding: 18px 20px; background: var(--panel); border-radius: 8px; }
  .insight-grid b, .boundary-grid b, .fin-notes b { display: block; font-size: 14px; margin-bottom: 8px; }
  .insight-grid span, .boundary-grid span, .fin-notes span { font-size: 13px; line-height: 1.55; color: var(--muted); }
  .profile-hero { display: grid; grid-template-columns: 360px 1fr; gap: 18px; min-height: 190px; margin-bottom: 20px; }
  .score-block, .hero-note { background: var(--panel); border-radius: 8px; padding: 22px 26px; }
  .score-block { border-left: 5px solid var(--teal); }
  .score-number { font-size: 58px; line-height: 1; font-weight: 600; color: var(--teal); }
  .score-count { font-size: 16px; color: var(--muted); margin-top: 10px; }
  .score-tags { display: flex; gap: 8px; margin-top: 20px; }
  .score-tags span { background: #e5ecef; color: var(--ink); padding: 6px 10px; border-radius: 4px; font-size: 12px; }
  .eyebrow { color: var(--teal); text-transform: uppercase; font-size: 12px; letter-spacing: 1.7px; font-weight: 600; }
  .hero-copy { font-size: 22px; line-height: 1.5; margin-top: 18px; }
  .hero-mini { display: flex; gap: 24px; margin-top: 24px; color: var(--muted); font-size: 13px; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  .panel { background: var(--panel); border-radius: 8px; padding: 20px 22px; }
  .panel.full { height: 424px; }
  .panel.compact { height: 270px; }
  .fin-table-panel { height: 342px; }
  .panel-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 18px; }
  .panel-head h2 { margin: 0; font-size: 18px; font-weight: 600; }
  .panel-head span { color: var(--muted); font-size: 12px; }
  .bar-list { display: flex; flex-direction: column; gap: 10px; }
  .bar-row { display: grid; grid-template-columns: 142px 1fr 98px; align-items: center; gap: 12px; min-height: 26px; }
  .bar-label { font-size: 13px; line-height: 1.25; }
  .bar-label span { display: block; color: var(--muted); font-size: 10px; margin-top: 2px; }
  .bar-track, .mini-track { height: 8px; background: #dfe5eb; border-radius: 4px; overflow: hidden; }
  .bar-fill, .mini-track span { display: block; height: 100%; border-radius: 4px; background: var(--teal); }
  .bar-fill.watch { background: var(--orange); }
  .bar-fill.poor { background: var(--red); }
  .bar-value { font-size: 12px; text-align: right; color: var(--muted); white-space: nowrap; }
  .bar-value b { display: block; color: var(--ink); font-size: 13px; margin-top: 2px; }
  .rsi-top { display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 16px; margin-bottom: 18px; }
  .rsi-score, .stage-card { min-height: 158px; padding: 20px 22px; background: var(--panel); border-radius: 8px; }
  .rsi-score { border-left: 5px solid var(--blue); }
  .rsi-score .score-number { color: var(--blue); }
  .stage-rate { font-size: 34px; font-weight: 600; margin-top: 12px; }
  .stage-count { font-size: 13px; color: var(--muted); }
  .mini-track { margin-top: 16px; }
  .stage-foot { font-size: 11px; color: var(--muted); margin-top: 8px; }
  .category-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 34px; }
  .category-row { display: grid; grid-template-columns: 156px 1fr 92px 60px; align-items: center; gap: 10px; font-size: 12px; }
  .category-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .category-bar { height: 8px; background: #dfe5eb; border-radius: 4px; overflow: hidden; }
  .category-bar span { display: block; height: 100%; background: var(--teal); border-radius: 4px; }
  .category-bar span.watch { background: var(--orange); }
  .category-bar span.poor { background: var(--red); }
  .category-value { text-align: right; color: var(--muted); }
  .category-value b { color: var(--ink); }
  .category-cover { text-align: right; color: var(--muted); }
  .panel-note { margin-top: 18px; font-size: 12px; line-height: 1.6; color: var(--muted); }
  .panel-note b { color: var(--ink); }
  .novel-top { display: grid; grid-template-columns: 1fr 70px 1fr 1fr; gap: 16px; align-items: center; margin-bottom: 14px; }
  .novel-top .metric { min-height: 104px; padding: 14px 20px; }
  .novel-top .metric-value { font-size: 30px; margin-top: 7px; }
  .arrow-block { text-align: center; font-size: 28px; color: var(--muted); }
  .novel-middle { height: 300px; margin-bottom: 14px; }
  .dual-row { display: grid; grid-template-columns: 70px 1fr 128px; align-items: center; gap: 12px; margin-bottom: 17px; }
  .dual-label { font-size: 12px; }
  .dual-bars { position: relative; height: 26px; }
  .dual-bars span { position: absolute; left: 0; height: 9px; border-radius: 4px; }
  .dual-bars .old { top: 1px; background: #aab6c1; }
  .dual-bars .new { top: 15px; background: var(--orange); }
  .dual-value { text-align: right; font-size: 11px; color: var(--muted); white-space: nowrap; }
  .dual-value b { display: block; color: var(--ink); font-size: 13px; margin-top: 2px; }
  .retrieval-panel { border-left: 4px solid var(--orange); }
  .retrieval-compare { display: flex; flex-direction: column; gap: 18px; }
  .retrieval-compare div { border-bottom: 1px solid var(--line); padding-bottom: 14px; }
  .retrieval-compare span { display: block; color: var(--muted); font-size: 12px; }
  .retrieval-compare strong { display: inline-block; font-size: 26px; margin-top: 5px; }
  .retrieval-compare small { color: var(--muted); margin-left: 12px; }
  .risk-delta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 38px; }
  .delta-row { display: grid; grid-template-columns: 1fr 160px 82px; align-items: center; font-size: 11px; border-bottom: 1px solid var(--line); padding-bottom: 6px; }
  .delta-row > div:first-child span { color: var(--muted); margin-left: 8px; }
  .delta-values { text-align: right; }
  .delta-values b { margin-left: 6px; }
  .delta { text-align: right; font-weight: 600; }
  .delta.up { color: var(--green); }
  .delta.down { color: var(--red); }
  .ncp-bottom { height: 492px; }
  .callout-panel { border-left: 4px solid var(--red); }
  .big-callout { font-size: 35px; line-height: 1.35; font-weight: 600; margin-top: 38px; }
  .callout-panel p { font-size: 15px; line-height: 1.7; color: var(--muted); margin-top: 24px; }
  .data-table, .method-table { width: 100%; border-collapse: collapse; font-size: 14px; }
  .data-table th, .method-table th { text-align: left; color: var(--muted); font-weight: 500; border-bottom: 1px solid #cbd3dc; padding: 12px 10px; }
  .data-table td { border-bottom: 1px solid var(--line); padding: 9px 10px; }
  .data-table td span { display: block; font-size: 20px; font-weight: 600; }
  .data-table td span.watch { color: var(--orange); }
  .data-table td span.poor { color: var(--red); }
  .data-table td span.good { color: var(--green); }
  .data-table td small { color: var(--muted); font-size: 11px; }
  .fin-notes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 14px; }
  .fin-notes div { padding: 14px 16px; }
  .method-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; height: 480px; }
  .method-panel { height: 480px; }
  .method-table tr { border-bottom: 1px solid var(--line); }
  .method-table td { padding: 15px 8px; font-size: 13px; }
  .method-table td:nth-child(2) { width: 100px; font-weight: 600; }
  .method-table td:nth-child(3) { color: var(--muted); }
  .strategy-list { display: flex; flex-direction: column; gap: 12px; }
  .strategy-list div { border-left: 3px solid var(--teal); padding: 10px 14px; background: var(--surface); }
  .strategy-list b, .strategy-list span, .strategy-list em { display: block; }
  .strategy-list b { font-size: 14px; }
  .strategy-list span { font-size: 12px; margin-top: 3px; }
  .strategy-list em { font-style: normal; font-size: 11px; color: var(--muted); margin-top: 5px; }
  .boundary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 18px; }
  .run-ids { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 20px; }
  .run-ids span { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11px; background: #e7edf2; padding: 7px 10px; border-radius: 4px; }
</style>
</head>
<body>
${pages.join("\n")}
</body>
</html>`;

const htmlPath = path.join(outputDir, "eval-7-group-report.html");
fs.writeFileSync(htmlPath, html);

const executablePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const browser = await chromium.launch({ headless: true, executablePath });
const context = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  deviceScaleFactor: 2,
});
const page = await context.newPage();
await page.setContent(html, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);

const names = [
  "01-overview",
  "02-chinese-a",
  "03-chinese-b",
  "04-chinese-c",
  "05-rsi",
  "06-novel",
  "07-ncp",
  "08-finrank",
  "09-methodology",
];

for (let index = 0; index < names.length; index += 1) {
  await page.locator(`#page-${index + 1}`).screenshot({
    path: path.join(outputDir, `${names[index]}.png`),
  });
}

await browser.close();
console.log(JSON.stringify({ outputDir, htmlPath, files: names.map((name) => `${name}.png`) }, null, 2));
