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

export const smokeScope: { protocol: string; max_movie_turns: number; datasets: (DatasetSummary & { recipe: string })[] } = { protocol: 'seven-suite-smoke-v1', max_movie_turns: 5, datasets: [
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
  { ...dataset, id: 'novel-choice-v1', name: '小说多选记忆', kind: 'choice', question_count: 5,
    add_count: 8, recipe: '小说多选：trace1 完整会话、前 5 道六选一题' },
  { ...dataset, id: 'rsi-trace-v1', name: '回应问候 · 行为记忆', kind: 'novel_qa', question_count: 5,
    add_count: 10, recipe: '后续多会话 LS1-LS2：10 turns、5 道跨会话题' },
] };

export const smokeReport = { protocol: 'seven-suite-smoke-v1', status: 'passed' as const,
  datasets: smokeScope.datasets.map(d => ({ dataset_id: d.id, status: 'passed' as const, errors: [], diagnostic_errors: [], missing: [],
    adds_completed: d.kind === 'episode' ? 2 : d.add_count, adds_total: d.kind === 'episode' ? 2 : d.add_count, cases_completed: d.episode_count || d.question_count,
    cases_total: d.episode_count || d.question_count })) };

export const miniScope = {
  protocol: 'seven-suite-mini-v1', target_seconds: 2100, question_count: 88, episode_count: 2,
  risk_counts: {
    actor_transfer: 18, temporal_disorder: 14, false_commitment: 17, global_memory_leak: 15,
    fabricated_action: 21, item_state_migration: 14, identity_pollution: 17,
  },
  datasets: [
    { ...dataset, id: 'zh-a', name: '中文 A', question_count: 8, add_count: 9, kind: 'profiles' as const },
    { ...dataset, id: 'zh-b', name: '中文 B', question_count: 8, add_count: 9, kind: 'profiles' as const },
    { ...dataset, id: 'zh-c', name: '中文 C', question_count: 8, add_count: 9, kind: 'profiles' as const },
    { ...dataset, id: 'rsi-trace-v1', name: '包子 / RSI', question_count: 15, add_count: 6, kind: 'novel_qa' as const },
    { ...dataset, id: 'novel-memory-v1', name: '小说四 trace', question_count: 32, add_count: 12, kind: 'novel_qa' as const },
    { ...dataset, id: 'ncpbench-v1', name: 'NCP-Bench', question_count: 0, episode_count: 2, add_count: 0, kind: 'episode' as const },
    { ...dataset, id: 'finrank-v1', name: 'FinRank v22', question_count: 15, add_count: 15, kind: 'finance_v22' as const },
  ],
};

export const miniConsistency = {
  protocol: 'seven-suite-mini-calibration-v1',
  generated_at: '2026-10-21T05:00:00Z',
  method: 'frozen-mini-subset-vs-full-v1',
  summary: {
    status: 'watch' as const, full_runs_scanned: 25, full_runs_used: 7,
    evaluated_suites: 4, total_suites: 4, max_versions: 4, mean_abs_bias: 0.0224,
    within_run_rank_median: 1, ready_for_replacement: false,
    minimum_versions: 3, recommended_versions: 5,
  },
  datasets: [
    { dataset_id: 'zh-profiles-v1', name: '中文三组', expected: 24, version_count: 4, run_count: 4,
      mean_delta: -0.0027, mean_abs_error: 0.0444, rank_correlation: 1,
      within_run_rank_median: 1, status: 'aligned' as const, recommended_versions: 5 },
    { dataset_id: 'rsi-trace-v1', name: '包子 / RSI', expected: 15, version_count: 1, run_count: 1,
      mean_delta: -0.0267, mean_abs_error: 0.0267, rank_correlation: null,
      within_run_rank_median: null, status: 'insufficient' as const, recommended_versions: 5 },
    { dataset_id: 'novel-memory-v1', name: '小说四 trace', expected: 32, version_count: 3, run_count: 3,
      mean_delta: 0.0061, mean_abs_error: 0.0172, rank_correlation: 1,
      within_run_rank_median: 1, status: 'aligned' as const, recommended_versions: 5 },
    { dataset_id: 'finrank-v1', name: 'FinRank v22', expected: 15, version_count: 2, run_count: 2,
      mean_delta: -0.0114, mean_abs_error: 0.0243, rank_correlation: 1,
      within_run_rank_median: null, status: 'insufficient' as const, recommended_versions: 5 },
  ],
  runs: [{
    run_id: 'd50d95f76e3e4977', name: '定向评测 · R79 · 关键词 BM25',
    status: 'failed', created_at: '2026-10-20T12:17:42Z', fingerprint: 'd50d95f76e3e4977',
    answer_model: 'qwen3.7-flash', judge_model: 'glm-5.3-flash',
    yaml_name: 'universal-memory-v5.79-r79-ask-anchor.yaml',
    mini_judged: 63, mini_accuracy: 0.5397, full_judged: 366,
    full_accuracy: 0.5273, delta: 0.0124, suite_count: 3,
  }],
  notes: ['NCP 电影在 Mini 与 Full 中使用不同电影集合，不纳入直接子集比较。'],
};

const capability = {
  id: 'temporal_reasoning', label: '时间与状态排序',
  description: '区分事件时间、会话时间、先后关系、区间和持续时长。',
  failure_mode: '把旧时点当当前状态，或颠倒计划、执行和结果的时间顺序。',
};
const extractionCapability = {
  id: 'information_extraction', label: '关键事实提取',
  description: '从长历史中找回准确的实体、数值、时间和限定条件。',
  failure_mode: '只召回主题相关内容，却漏掉精确事实、否定词或限定语。',
};

export const miniQuestions = {
  protocol: 'seven-suite-mini-details-v1',
  generated_at: '2026-10-21T06:00:00Z',
  summary: {
    total_tasks: 88, qa_tasks: 86, episode_tasks: 2, hard_tasks: 32,
    difficulty_counts: { easy: 7, medium: 49, hard: 32 },
    capability_counts: { temporal_reasoning: 33, knowledge_update: 44 },
    risk_counts: { temporal_disorder: 21 }, type_counts: { 时间顺序错乱: 10 },
    explicit_distractor_tasks: 24,
  },
  capability_catalog: { temporal_reasoning: capability },
  risk_catalog: {
    temporal_disorder: { label: '时间顺序错乱', description: '混淆过去与当前、计划与执行，或颠倒事件先后。' },
  },
  tasks: [
    {
      id: 'A03', kind: 'qa',
      question: '我现在做什么工作、住在哪里、稳定爱好是什么？',
      dataset_id: 'zh-profiles-v1', group_id: 'A', group_name: '中文 A',
      task_type: '时间顺序错乱', question_family: null,
      difficulty: 'medium', difficulty_source: 'source',
      difficulty_reason: '原始标注为 Medium：2 条证据，跨 1 个会话，包含 4 个关键点。',
      why_hard: '需要覆盖 4 个关键点，并核对 2 条证据；同时要避开时间顺序错乱陷阱。',
      evaluation_value: '该题直接考查关键事实提取和时间与状态排序。答错可以暴露当前状态与历史状态混淆。',
      capabilities: [extractionCapability, capability],
      risks: [{ id: 'temporal_disorder', label: '时间顺序错乱', description: '混淆过去与当前、计划与执行，或颠倒事件先后。' }],
      reference_answer: '江湾自然教育基金会、自然教育项目主管、杭州市上城区；稳定观鸟和烘焙。',
      required_points: [{ id: 'A03-a01', text: '当前在江湾自然教育基金会担任自然教育项目主管。' }],
      evidence: [{ id: 'A-S3-M3', kind: 'source_evidence', location: '2026 · A-S3-M3', role: 'user',
        content: '我加入江湾自然教育基金会，担任自然教育项目主管。' }],
      misleading: [{ id: 'ZH-N-A-S1-P02', kind: 'high_similarity_noise', label: '高相似干扰',
        location: '2023-2024 · ZH-N-A-S1-P02', content: '同事林川在省城乡规设计院做生态修复规划，住武汉武昌。' }],
      metadata: { answerable: true, evaluation_role: 'memory_core' },
    },
    {
      id: 'NCP-movie44', kind: 'episode',
      question: '在对抗玩家持续施压下，保持完整叙事轨迹、事实状态和承诺顺序一致。',
      dataset_id: 'ncpbench-v1', group_id: 'NCP-movie44', group_name: 'Clueless',
      task_type: '交互叙事闭环', question_family: 'adversarial trajectory consistency',
      difficulty: 'hard', difficulty_source: 'protocol',
      difficulty_reason: '协议固定为 Hard：包含 11 条轨迹承诺，需要多回合连续满足。',
      why_hard: '玩家会主动试探越序、提前触发和状态冲突。',
      evaluation_value: '把长程记忆、事实更新、时间顺序和承诺一致性放在同一个闭环里。',
      capabilities: [{ id: 'narrative_state_tracking', label: '长程叙事状态追踪',
        description: '在连续交互中保持人物、事实、关系和当前场景状态一致。',
        failure_mode: '随着对话推进忘记既有状态，或让后文与前文逻辑冲突。' }],
      risks: [],
      reference_answer: '满足全部轨迹承诺，并保持事实、关系和当前状态一致。',
      required_points: [{ id: 'c_0', text: '等级协商必须晚于匹配计划完成。' }],
      evidence: [{ id: 'c_0', kind: 'trajectory_commitment', location: '轨迹承诺 c_0 · ordering',
        role: 'commitment', content: '等级协商必须晚于匹配计划完成。', condition: '先完成计划。', violation: '提前成功。' }],
      misleading: [{ id: 'c_0', kind: 'commitment_violation', label: '违反轨迹承诺',
        location: '轨迹承诺 c_0 · ordering', content: '计划完成前接受协商成功。' }],
      metadata: { condition: 'adversarial', commitment_count: 11, max_turns: 15 },
    },
  ],
};

export const fullQuestions = {
  ...miniQuestions,
  protocol: 'seven-suite-full-details-v1',
  summary: {
    ...miniQuestions.summary,
    total_tasks: 709,
    qa_tasks: 609,
    episode_tasks: 100,
    hard_tasks: 245,
  },
};

export const defaults = {
  memory: { base_url: 'https://preview-text.memorax.net', timeout_s: 60 },
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
  metrics: { passed: 1, failed: 1, errors: 1, judged: 2, total: 36, accuracy: 0.5,
    blocked: 0, evaluable_total: 36, evaluable_judged: 2, evaluable_passed: 1, evaluable_failed: 1,
    evaluable_errors: 1, evaluable_accuracy: 0.5 },
  timing: { add_seconds: 48, total_seconds: 80 },
  add_health: { static_completed: 36, static_total: 36, dynamic_completed: 0, dynamic_total: 0, errors: 0 },
  health_summary: { formal_errors: 1, evaluable_errors: 1, formal_retryable: 1, formal_blocked: 0,
    diagnostic_errors: 2, diagnostic_retryable: 2, diagnostic_blocked: 0,
    model_calls: 24, prompt_tokens: 1200, completion_tokens: 300, total_tokens: 1500, eta_seconds: null },
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
