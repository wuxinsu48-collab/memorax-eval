import type { CreateRun, Defaults } from './types';

export function runPayload(d: Defaults, keys: { memory: string; answer: string; judge: string },
  mode: 'full' | 'mini' | 'smoke', datasetIds?: string[]): CreateRun {
  const custom = mode === 'full' && !!datasetIds?.length;
  return {
    name: `${mode === 'smoke' ? '快速自检' : mode === 'mini' ? 'Mini 评测' : custom ? '自定义评测' : '全量评测'} ${new Date().toLocaleString('zh-CN', { hour12: false })}`,
    run_mode: mode, dataset_id: custom ? 'custom' : 'all',
    ...(custom ? { dataset_ids: datasetIds } : {}), profile_ids: [],
    memory: { ...d.memory, api_key: keys.memory },
    answer: { ...d.answer, api_key: keys.answer }, judge: { ...d.judge, api_key: keys.judge },
    search: d.search, evidence: d.evidence, common_yaml: d.common_yaml, domain_yaml: d.domain_yaml,
    ...(d.quality ? { quality: d.quality } : {}),
    ...(d.ncp ? { ncp: d.ncp } : {}),
    answer_prompt: d.answer_prompt ?? null, judge_prompt: d.judge_prompt ?? null,
    dataset_overrides: d.dataset_overrides ?? {},
  };
}
