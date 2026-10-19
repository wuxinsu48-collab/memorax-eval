import type { DatasetSummary } from '../src/types';

export const dataset = {
  id: 'zh_profiles_v1', name: '中文画像 A / B / C', version: '1.0',
  description: '测试夹具：三个画像、三个阶段。', profile_count: 3,
  message_count: 54, question_count: 36, noise_pair_count: 450, add_count: 36,
  profiles: ['A', 'B', 'C'].map((id) => ({
    id, name: `画像 ${id}`, question_count: 12,
    stages: [1, 2, 3].map((stage) => ({
      id: stage, period: `测试阶段 ${stage}`, message_count: 6, noise_pair_count: 50,
    })),
  })),
};

export const smokeScope: { protocol: string; max_movie_turns: number; datasets: (DatasetSummary & { recipe: string })[] } = { protocol: 'five-suite-smoke-v1', max_movie_turns: 5, datasets: [
  { ...dataset, id: 'zh-profiles-v1', name: '中文三组画像', profile_count: 1, question_count: 12,
    message_count: 18, noise_pair_count: 30, add_count: 6, recipe: 'A 组三阶段，每阶段 5 对普通闲聊＋5 对高相似干扰；保留 12 题' },
  { ...dataset, id: 'ncpbench-v1', name: '英文交互叙事 · NCP-Bench', kind: 'episode', question_count: 0,
    episode_count: 1, add_count: 0, recipe: '100 部中随机 1 部，最多 5 回合；不是完整电影成绩' },
  { ...dataset, id: 'finrank-v1', name: '金融 FinRank', kind: 'retrieval', question_count: 5,
    add_count: 5, recipe: '随机 5 题，每题保留完整原文与干扰段落' },
  { ...dataset, id: 'multi-scene-memory-v1', name: '多场景记忆一致性', kind: 'conversation_qa',
    question_count: 2, add_count: 2, recipe: '人员变更快照：完整 2 个会话、2 道题' },
  { ...dataset, id: 'novel-memory-v1', name: '小说剧情记忆', kind: 'novel_qa', question_count: 10,
    add_count: 22, recipe: '诸星遗辞 A：第一阶段 22 轮正文、10 道题' },
] };

export const smokeReport = { protocol: 'five-suite-smoke-v1', status: 'passed' as const,
  datasets: smokeScope.datasets.map(d => ({ dataset_id: d.id, status: 'passed' as const, errors: [], missing: [],
    adds_completed: d.kind === 'episode' ? 2 : d.add_count, adds_total: d.kind === 'episode' ? 2 : d.add_count, cases_completed: d.episode_count || d.question_count,
    cases_total: d.episode_count || d.question_count })) };

export const defaults = {
  memory: { base_url: 'http://localhost:8000', timeout_s: 60 },
  answer: { base_url: 'http://localhost:8001/v1', model: 'answer-test', temperature: 0, max_tokens: 1024,
    top_p: null, frequency_penalty: null, presence_penalty: null, seed: null },
  judge: { base_url: 'http://localhost:8002/v1', model: 'judge-test', temperature: 0, max_tokens: 1024,
    top_p: null, frequency_penalty: null, presence_penalty: null, seed: null },
  search: { mode: 'fast', output_mode: 'summary', top_k: 10, k_dense: 10, k_sparse: 10, extra_fields: {} },
  evidence: { parser_mode: 'legacy', content_paths: [], include_builtin_formats: true,
    include_matched_facts: true, include_buckets: true, include_attributes: true,
    deduplicate: false, max_items: 500 },
  common_yaml: { name: 'common.yaml', content: 'memory:\n  enabled: true\n' },
  domain_yaml: null,
  ncp: { max_turns: 100, condition: 'adversarial' as const, player_model: 'gemini-2.5-flash',
    auditor_model: 'gemini-2.5-flash', temperature: 0.6, top_p: 0.95, max_tokens: 8092, recent_turns: 3 },
};

export const prompts = [
  { id: 'profile-answer-v8.4', name: '回答提示词 v8.4', kind: 'answer' as const,
    content: '请根据问题和证据回答。', sha256: 'answer-default-sha' },
  { id: 'profile-judge-v6', name: '评分提示词 v6', kind: 'judge' as const,
    content: '请严格按评分标准输出 JSON。', sha256: 'judge-default-sha' },
];

export const run = {
  id: 'run-test', name: '契约测试运行', dataset_id: dataset.id, dataset_name: dataset.name,
  created_at: '2026-10-17T07:00:00Z', updated_at: '2026-10-17T07:01:00Z',
  status: 'completed', phase: 'completed',
  progress: { add_completed: 36, add_total: 36, search_completed: 36, search_total: 36,
    answer_completed: 36, answer_total: 36, judge_completed: 2, judge_total: 36 },
  metrics: { passed: 1, failed: 1, errors: 1, judged: 2, total: 36, accuracy: 0.5 },
  timing: { add_seconds: 48, total_seconds: 80 },
  profiles: ['A', 'B', 'C'].map((id) => ({
    id, name: `画像 ${id}`, user_id: `run-test-${id}`, status: 'completed', stage: 3,
    adds_completed: 12, adds_total: 12, cases_total: 12,
  })),
  error: null, config: { answer: { model: 'answer-test' }, judge: { model: 'judge-test' } },
  cases: [
    { id: 'A-01', profile_id: 'A', profile_name: '画像 A', question: '当前偏好是什么？',
      status: 'completed', verdict: 'pass', answer: '最新偏好是步行。',
      evidence: [{ id: 'memory-1', content: '用户现在偏好步行', kind: 'summary', bucket: 'preferences',
        score: 0.92, source_ids: ['message-1'] }],
      judgement: { pass: true, reason: '覆盖当前偏好' },
      gold: { must_include: '步行', must_not: '过去偏好' }, error: null,
      search_response: { items: [{ text: '用户现在偏好步行' }] } },
    { id: 'A-02', profile_id: 'A', profile_name: '画像 A', question: '失败题的偏好？',
      status: 'completed', verdict: 'fail', answer: '旧偏好。',
      evidence: [], judgement: { pass: false, reason: '使用过时事实' },
      gold: { must_include: '新偏好', must_not: '旧偏好' }, error: null },
    { id: 'B-01', profile_id: 'B', profile_name: '画像 B', question: '执行异常的题目？',
      status: 'error', verdict: null, answer: null, evidence: [], judgement: null,
      gold: { must_include: '事实', must_not: '猜测' }, error: '模型服务超时' },
  ],
  events: [{ at: '2026-10-17T07:01:00Z', level: 'info', message: '测试运行已结束' }],
  adds: [{ id: 'add-1', profile_id: 'A', stage: 1, kind: 'profile', message_count: 6,
    pair_count: 0, status: 'completed', task_id: 'task-test', error: null }],
};
