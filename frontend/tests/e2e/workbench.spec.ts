import { expect, test, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { dataset, defaults, miniConsistency, miniQuestions, miniScope, prompts, run, smokeScope, smokeReport } from '../fixtures';

test.beforeEach(async ({ page }) => {
  if (!process.env.MEMORAX_E2E_STATIC) return;
  const root = resolve(process.cwd(), 'dist');
  await page.route('http://memorax.test/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.startsWith('/api/')) return route.fallback();
    const file = resolve(root, path === '/' ? 'index.html' : path.slice(1));
    if (!file.startsWith(`${root}/`)) return route.abort();
    try {
      const body = await readFile(file);
      const contentType = file.endsWith('.js') ? 'text/javascript'
        : file.endsWith('.css') ? 'text/css' : 'text/html';
      await route.fulfill({ body, contentType });
    } catch { await route.fulfill({ status: 404, body: 'Not found' }); }
  });
});

async function openNewRun(page: Page) {
  await page.goto('/#/new');
}

async function mockApi(page: Page) {
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname.replace('/api', '');
    const response = path === '/health' ? { status: 'ok', version: '0.1.0' }
      : path === '/defaults' ? defaults
      : path === '/datasets' ? { datasets: [dataset] }
      : path === '/mini' ? miniScope
      : path === '/mini/consistency' ? miniConsistency
      : path === '/mini/questions' ? miniQuestions
      : path.startsWith('/datasets/') ? { ...dataset, data: { profiles: dataset.profiles } }
      : path === '/prompts' ? { prompts }
      : path === '/config/preview' ? { effective_yaml: defaults.common_yaml.content, sha256: 'test-sha' }
      : path === '/connections/check' ? { checks: [{ name: 'memory', status: 'ok', message: '连接成功' }] }
      : path === '/runs' && route.request().method() === 'GET' ? { runs: [run] }
      : run;
    await route.fulfill({ json: response });
  });
}

async function assertNoPageOverflow(page: Page) {
  const width = page.viewportSize()?.width;
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  if (width) expect(await page.evaluate(() => window.innerWidth)).toBeLessThanOrEqual(width);
}

test('submit a configured run and inspect per-case evidence', async ({ page }, testInfo) => {
  await mockApi(page);
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '全量评测', exact: true })).toBeVisible();
  await assertNoPageOverflow(page);
  await page.screenshot({ path: testInfo.outputPath('overview.png'), fullPage: true });
  await openNewRun(page);
  await page.getByLabel('Memory API Key', { exact: true }).fill('memory-test-key');
  await page.getByLabel('回答 API Key', { exact: true }).fill('answer-test-key');
  await page.getByLabel('评审 API Key', { exact: true }).fill('judge-test-key');
  await expect(page.getByRole('checkbox', { name: /画像 A/ })).toBeChecked();
  await assertNoPageOverflow(page);
  await page.screenshot({ path: testInfo.outputPath('new-run.png'), fullPage: true });
  const request = page.waitForRequest((r) => new URL(r.url()).pathname === '/api/runs' && r.method() === 'POST');
  await page.getByRole('button', { name: '开始评测' }).click();
  expect((await request).postDataJSON().profile_ids).toEqual(['A', 'B', 'C']);
  await expect(page.getByRole('heading', { name: '契约测试运行' })).toBeVisible();
  await expect(page.getByText('50.0%')).toBeVisible();
  await assertNoPageOverflow(page);
  await page.screenshot({ path: testInfo.outputPath('run-detail.png'), fullPage: true });
  await page.getByRole('button', { name: '当前偏好是什么？', exact: true }).click();
  await expect(page.getByRole('dialog', { name: '题目 A-01' }).getByText('用户现在偏好步行', { exact: true })).toBeVisible();
  await assertNoPageOverflow(page);
  await page.screenshot({ path: testInfo.outputPath('case-drawer.png'), fullPage: true });
  await page.keyboard.press('Escape');
  await page.getByLabel('结果筛选').selectOption('error');
  await expect(page.getByText('执行异常的题目？')).toBeVisible();
  await expect(page.getByText('当前偏好是什么？')).toHaveCount(0);
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 });
});

test('backend errors remain actionable', async ({ page }) => {
  await page.route('**/api/**', (route) => route.fulfill({
    status: 503, json: { detail: '本地服务暂时不可用' },
  }));
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('本地服务暂时不可用');
  await expect(page.getByRole('button', { name: '重试' })).toBeVisible();
  await assertNoPageOverflow(page);
});

test('failed questions show precise reasons and have independent question and audit retries', async ({ page }, testInfo) => {
  const failure = { category: 'transport', operation: 'answering', message: '远端连接异常', exception_type: 'RemoteProtocolError',
    exception_message: 'Server disconnected without sending a response.', endpoint: 'https://model.test/v1/chat/completions',
    method: 'POST', model: 'answer-test', http_status: null, elapsed_ms: 32915, timeout_s: 300 };
  let current = { ...structuredClone(run), retry_options: { cases: ['B-01'], quality: ['Q-A-01'], blocked: [] as unknown[] } };
  Object.assign(current.cases[2], { error: '远端连接异常', error_detail: failure });
  const retries: { target: string; item_ids: string[] }[] = [];
  await page.route('**/api/**', async route => {
    const path = new URL(route.request().url()).pathname.replace('/api', '');
    if (path.endsWith('/retry-failed')) {
      const body = route.request().postDataJSON();
      retries.push(body);
      if (body.target === 'cases') {
        Object.assign(current.cases[2], { status: 'completed', error: null, error_detail: null, verdict: 'pass', answer: '重试后的回答',
          attempt_history: [{ batch_id: 'batch-1', at: '2026-10-19T07:00:00Z', previous: { status: 'error', error: '远端连接异常', error_detail: failure } }] });
        current = { ...current, metrics: { ...current.metrics, errors: 0 }, retry_options: { ...current.retry_options, cases: [] } };
      } else current = { ...current, retry_options: { ...current.retry_options, quality: [] } };
    }
    await route.fulfill({ json: path === '/health' ? { status: 'ok', version: '0.1.0' }
      : path === '/runs' ? { runs: [current] } : current });
  });
  await page.goto('/#/runs/run-test');
  await page.getByRole('button', { name: '查看题目 B-01', exact: true }).click();
  const drawer = page.getByRole('dialog', { name: '题目 B-01', exact: true });
  await expect(drawer.getByText('RemoteProtocolError', { exact: true })).toBeVisible();
  await expect(drawer.getByText('32.91 秒', { exact: true })).toBeVisible();
  await expect(drawer.getByText('未收到 HTTP 响应', { exact: true })).toBeVisible();
  await assertNoPageOverflow(page);
  await page.screenshot({ path: testInfo.outputPath('failure-detail.png') });
  await drawer.getByRole('button', { name: '重试本题', exact: true }).click();
  const modal = page.getByRole('dialog', { name: '重试失败题', exact: true });
  await modal.getByLabel('Memory API Key', { exact: true }).fill('memory-retry-test');
  await modal.getByLabel('回答 API Key', { exact: true }).fill('answer-retry-test');
  await modal.getByLabel('评审 API Key', { exact: true }).fill('judge-retry-test');
  await page.screenshot({ path: testInfo.outputPath('retry-confirm.png') });
  await modal.getByRole('button', { name: '确认重试', exact: true }).click();
  await expect(modal).not.toBeVisible();
  expect(retries[0]).toMatchObject({ target: 'cases', item_ids: ['B-01'] });
  await page.getByRole('button', { name: '查看题目 B-01', exact: true }).click();
  await page.getByText('重试历史 · 1 次', { exact: true }).click();
  await expect(page.getByText('Server disconnected without sending a response.', { exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: '仅重试诊断（1）', exact: true }).click();
  await page.getByRole('dialog', { name: '重试失败诊断', exact: true }).getByRole('button', { name: '确认重试', exact: true }).click();
  expect(retries[1]).toMatchObject({ target: 'quality', item_ids: ['Q-A-01'] });
  expect(retries).toHaveLength(2);
  await assertNoPageOverflow(page);
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
});

test('quick-check tab launches the fixed scope and separates pipeline status from scores', async ({ page }, testInfo) => {
  const smokeRun = { ...run, run_mode: 'smoke', name: '七套快速自检', dataset_id: 'all',
    dataset_name: '七套快速自检', smoke_report: smokeReport, metrics: { ...run.metrics, errors: 0, accuracy: 0 } };
  await page.route('**/api/**', async route => {
    const path = new URL(route.request().url()).pathname.replace('/api', '');
    const data = path === '/health' ? { status: 'ok', version: '0.1.0' }
      : path === '/defaults' ? defaults
      : path === '/datasets' ? { datasets: [dataset] }
      : path === '/prompts' ? { prompts }
      : path === '/smoke' ? smokeScope
      : path === '/settings' ? { settings_revision: 'test' }
      : path === '/config/preview' ? { effective_yaml: defaults.common_yaml.content, sha256: 'test-sha' }
      : path === '/runs' && route.request().method() === 'GET' ? { runs: [smokeRun] }
      : smokeRun;
    await route.fulfill({ json: data });
  });
  await page.goto('/#/smoke');
  await expect(page.getByRole('heading', { name: '快速自检', exact: true })).toBeVisible();
  await expect(page.getByText('7 套小样本 · 39 题＋1 部电影 · 非正式成绩')).toBeVisible();
  await expect(page.getByRole('region', { name: '自检流程结果' })).toContainText('流程跑通');
  await assertNoPageOverflow(page);
  await page.screenshot({ path: testInfo.outputPath('quick-check.png'), fullPage: true });
  await page.getByRole('button', { name: '评测设置', exact: true }).last().click();
  await page.getByLabel('Memory API Key', { exact: true }).fill('memory-test-key');
  await page.getByLabel('回答 API Key', { exact: true }).fill('answer-test-key');
  await page.getByLabel('评审 API Key', { exact: true }).fill('judge-test-key');
  await page.getByRole('button', { name: '保存配置', exact: true }).click();
  await expect(page.getByRole('heading', { name: '全量评测', exact: true })).toBeVisible();
  if (testInfo.project.name === 'mobile') await page.getByRole('button', { name: '打开导航' }).click();
  await page.getByRole('button', { name: '快速自检', exact: true }).click();
  const request = page.waitForRequest(r => new URL(r.url()).pathname === '/api/runs' && r.method() === 'POST');
  await page.getByRole('button', { name: '开始快速自检' }).click();
  expect((await request).postDataJSON()).toMatchObject({ run_mode: 'smoke', dataset_id: 'all', profile_ids: [],
    common_yaml: defaults.common_yaml, answer: { model: defaults.answer.model } });
  await expect(page.getByRole('heading', { name: '七套快速自检', exact: true })).toBeVisible();
  await expect(page.getByText('快速自检 · 小样本，非正式成绩；电影最多 5 回合。')).toBeVisible();
  await expect(page.getByRole('region', { name: '自检流程结果' })).toContainText('流程跑通');
  await assertNoPageOverflow(page);
  await page.screenshot({ path: testInfo.outputPath('quick-check-results.png'), fullPage: true });
});

test('mini tab shows the frozen seven-group scope on desktop and mobile', async ({ page }, testInfo) => {
  await mockApi(page);
  await page.goto('/#/mini');
  await expect(page.getByRole('heading', { name: 'Mini 评测', exact: true })).toBeVisible();
  await expect(page.getByText(/86 题＋2 部电影 · 目标 35 分钟/)).toBeVisible();
  await expect(page.getByText('Mini 冻结范围')).toBeVisible();
  await expect(page.getByText('包子 / RSI', { exact: true })).toBeVisible();
  await expect(page.getByText('FinRank v22', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: '历史 Full 代表性回测' })).toBeVisible();
  await expect(page.getByText('7 / 25')).toBeVisible();
  await expect(page.getByText(/尚不能证明 Mini 可替代 Full/)).toBeVisible();
  await assertNoPageOverflow(page);
  await page.screenshot({ path: testInfo.outputPath('mini-scope.png'), fullPage: true });
});

test('mini question explanations expose capability, evidence and misleading information', async ({ page }, testInfo) => {
  await mockApi(page);
  await page.goto('/#/mini/questions');
  await expect(page.getByRole('heading', { name: 'Mini 题库详解', exact: true })).toBeVisible();
  await expect(page.getByRole('table', { name: 'Mini 题目列表' })).toBeVisible();
  await page.getByRole('button', { name: '查看题目 A03' }).click();
  const drawer = page.getByRole('dialog', { name: 'A03 题目详解' });
  await expect(drawer.getByRole('heading', { name: '为什么有测评价值' })).toBeVisible();
  await expect(drawer.getByRole('heading', { name: '考查的记忆能力' })).toBeVisible();
  await expect(drawer.getByText('关键事实提取', { exact: true })).toBeVisible();
  await expect(drawer.getByRole('heading', { name: '关键信息在哪里' })).toBeVisible();
  await expect(drawer.getByText('A-S3-M3', { exact: true })).toBeVisible();
  await expect(drawer.getByRole('heading', { name: '误导信息在哪里' })).toBeVisible();
  await expect(drawer.getByText(/同事林川/)).toBeVisible();
  await assertNoPageOverflow(page);
  await page.screenshot({ path: testInfo.outputPath('mini-question-detail.png'), fullPage: true });
});

test('self-bucket setting and separate evidence sources fit both viewports', async ({ page }, testInfo) => {
  await mockApi(page);
  await page.route('**/api/defaults', route => route.fulfill({ json: {
    ...defaults, search: { ...defaults.search, include_self_bucket: true },
  } }));
  const anchored = structuredClone(run);
  Object.assign(anchored.cases[0], {
    retrieval: { policy: 'automatic-plus-self-v1', automatic_contains_self: false,
      self_bucket_status: 'present', self_evidence_count: 1, automatic_evidence_count: 2 },
    automatic_search_response: { native_only: true }, self_bucket_response: { self_only: true },
    evidence: [{ ...anchored.cases[0].evidence[0], bucket: 'person/user', retrieval_source: 'self_bucket' }],
  });
  await page.route('**/api/runs/run-test', route => route.fulfill({ json: anchored }));
  await page.goto('/#/settings');
  await page.getByRole('tab', { name: '检索与证据' }).click();
  await expect(page.getByRole('checkbox', { name: '固定补读本人桶 · person/user' })).toBeChecked();
  await assertNoPageOverflow(page);
  await page.screenshot({ path: testInfo.outputPath('self-setting.png'), fullPage: true });
  await page.goto('/#/runs/run-test');
  await page.getByRole('button', { name: '查看题目 A-01' }).click();
  const dialog = page.getByRole('dialog', { name: '题目 A-01' });
  await expect(dialog.getByText('本人桶补读', { exact: true })).toBeVisible();
  await expect(dialog.getByText('自动召回 2 条 · 本人桶补读 1 条 · 自动召回未含本人桶')).toBeVisible();
  await assertNoPageOverflow(page);
  await page.screenshot({ path: testInfo.outputPath('self-evidence.png'), fullPage: true });
  await dialog.getByText('自动 Search 原始响应').click();
  await expect(dialog.getByText('"native_only": true', { exact: false })).toBeVisible();
  await dialog.getByText('本人桶补读原始响应').click();
  await expect(dialog.getByText('"self_only": true', { exact: false })).toBeVisible();
});

test('NCP movies and staged novel results remain distinct on desktop and mobile', async ({ page }, testInfo) => {
  await mockApi(page);
  const metrics = { episode_count: 1, average_turns: 1, average_trajectory_progress: 1, average_commitment_satisfaction: 1,
    fact_conflict_rate: 0, commitment_conflict_rate: 0, player_input_conflict_rate: 0, conflict_count: 0, max_turns_count: 0, all_resolved_count: 1 };
  const row = { name: '行为主体转移', total: 32, judged: 1, passed: 1, errors: 0, accuracy: 1, point_coverage: 1 };
  const result = { ...run, name: '七套叙事集成验收', ncp_metrics: metrics,
    config: { ...run.config, sampling: { 'ncpbench-v1': { seed: '42', movie_ids: ['movie01'], movie_titles: ['50 First Dates'], sample_size: 10 } } },
    dataset_metrics: [{ dataset_id: 'novel-memory-v1', kind: 'novel_qa', total: 200, completed: 1, errors: 0,
      accuracy: 1, retrieval: null, mapping_coverage: null, categories: [row], stages: [{ ...row, name: '1' }],
      risks: [{ ...row, name: 'actor_transfer' }] }],
    metrics: { ...run.metrics, episode_total: 10, episode_completed: 1 },
    cases: [{ ...run.cases[0], id: 'NCP-movie01', profile_name: '50 First Dates', kind: 'episode', verdict: null,
      episode_result: { termination: 'all_resolved', turns: [{}] } },
      { ...run.cases[2], id: 'NCP-movie02', profile_name: 'Raiders of the Lost Ark', kind: 'episode',
        status: 'error', error: 'Add 返回失败或部分写入',
        error_detail: { category: 'unknown', operation: 'ncp_episode', message: 'Add 返回失败或部分写入' } },
      { ...run.cases[2], id: 'NCP-movie03', profile_name: 'Black Swan', kind: 'episode',
        status: 'error', error: 'method_response_fact_extract failed after 3 attempts: response is not valid JSON',
        error_detail: { category: 'unknown', operation: 'ncp_episode',
          message: 'method_response_fact_extract failed after 3 attempts: response is not valid JSON' } },
      { ...run.cases[0], id: 'NV-q001', kind: 'novel_qa', stage: 1, visible_until_turn: 22,
        category: { id: 'actor_transfer', name: '行为主体转移' } }],
  };
  await page.route('**/api/runs/run-test', route => route.fulfill({ json: result }));
  await page.goto('/#/runs/run-test');
  await expect(page.getByRole('heading', { name: 'NCP-Bench', exact: true })).toBeVisible();
  await expect(page.getByText('电影局 · 不并入问答通过率')).toBeVisible();
  await expect(page.getByText('审计 JSON 未恢复（1 部）', { exact: false })).toBeVisible();
  await expect(page.getByText('Add 部分写入（1 部）', { exact: false })).toBeVisible();
  await expect(page.getByRole('heading', { name: '小说剧情记忆', exact: true })).toBeVisible();
  await expect(page.getByText('行为主体转移', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: '七类记忆风险', exact: true })).toBeVisible();
  await assertNoPageOverflow(page);
  await page.screenshot({ path: testInfo.outputPath('ncp-novel-results.png'), fullPage: true });
  await page.getByRole('button', { name: '查看题目 NV-q001' }).click();
  await expect(page.getByText('阶段 1 · 可见至 T22 · 行为主体转移')).toBeVisible();
  await assertNoPageOverflow(page);
  await page.screenshot({ path: testInfo.outputPath('novel-stage-evidence.png') });
});
