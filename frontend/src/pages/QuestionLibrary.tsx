import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, Filter, RefreshCw, Search, ShieldAlert, Target } from 'lucide-react';
import { useResource } from '../hooks';
import type { MiniQuestionIndex, MiniQuestionTask } from '../types';
import { Button, Empty, ErrorNotice, IconButton, Loading, Metric, Modal, Status } from '../ui';

const difficultyLabels = { easy: 'Easy', medium: 'Medium', hard: 'Hard' } as const;
const sourceLabels = {
  source: '原始难度标注',
  derived: '由冻结证据推导',
  protocol: '协议固定难度',
} as const;

const PAGE_SIZE = 60;

export default function QuestionLibrary({ scope }: { scope: 'mini' | 'full' }) {
  const mini = scope === 'mini';
  const questions = useResource<MiniQuestionIndex>(mini ? '/mini/questions' : '/questions?scope=full');
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [capability, setCapability] = useState('all');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<MiniQuestionTask | null>(null);
  const tasks = questions.data?.tasks ?? [];
  const groups = useMemo(() => Array.from(new Map(tasks.map(task => [task.group_id, task.group_name])).entries()), [tasks]);
  const capabilities = useMemo(() => Array.from(new Map(
    tasks.flatMap(task => task.capabilities.map(item => [item.id, item.label] as const)),
  ).entries()).sort((a, b) => a[1].localeCompare(b[1], 'zh-CN')), [tasks]);
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return tasks.filter(task => {
      if (group !== 'all' && task.group_id !== group) return false;
      if (difficulty !== 'all' && task.difficulty !== difficulty) return false;
      if (capability !== 'all' && !task.capabilities.some(item => item.id === capability)) return false;
      if (!needle) return true;
      return [
        task.id, task.question, task.group_name, task.task_type, task.evaluation_value,
        task.reference_answer ?? '',
        ...task.capabilities.flatMap(item => [item.label, item.description]),
        ...task.risks.map(item => item.label),
        ...task.required_points.map(item => item.text),
        ...task.evidence.map(item => item.content),
      ].join(' ').toLocaleLowerCase().includes(needle);
    });
  }, [capability, difficulty, group, query, tasks]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  useEffect(() => {
    setPage(0);
  }, [scope, query, group, difficulty, capability]);

  const reset = () => {
    setQuery('');
    setGroup('all');
    setDifficulty('all');
    setCapability('all');
  };
  return <>
    <div className="page-heading">
      <div><div className="eyebrow">{mini ? 'Mini 基准' : '全量基准'}</div><h1>{mini ? 'Mini 题库详解' : '测试集题库详解'}</h1>
        <p>逐题说明记忆能力、难度来源、关键证据和误导路径。</p></div>
      <IconButton icon={RefreshCw} label={`刷新${mini ? ' Mini ' : '全量'}题库详解`} onClick={questions.reload} />
    </div>
    {questions.error && <ErrorNotice message={questions.error} retry={questions.reload} />}
    {questions.loading ? <Loading label={`正在整理${mini ? ' Mini ' : '全量'}题目详解…`} /> : questions.data && <>
      <div className="metrics-strip">
        <Metric label="总任务" value={questions.data.summary.total_tasks}
          note={`${questions.data.summary.qa_tasks} 道问答 · ${questions.data.summary.episode_tasks} 部叙事闭环`} />
        <Metric label="Hard 任务" value={questions.data.summary.hard_tasks}
          note={`${Math.round(questions.data.summary.hard_tasks / questions.data.summary.total_tasks * 100)}% 需要多证据或长程状态`} />
        <Metric label="覆盖能力" value={Object.keys(questions.data.summary.capability_counts).length}
          note="事实提取、更新、时间、跨会话与主体追踪" />
        <Metric label="含显式干扰" value={questions.data.summary.explicit_distractor_tasks}
          note="高相似噪声、Hard negative 或轨迹违规条件" />
      </div>
      <section className="section">
        <div className="section-title"><div><h2>逐题索引</h2><span className="muted">{filtered.length} / {tasks.length} 个任务</span></div>
          <Button icon={Filter} onClick={reset}>清除筛选</Button></div>
        <div className="table-toolbar question-toolbar">
          <div className="search-field"><Search size={16} aria-hidden />
            <input aria-label={mini ? '搜索 Mini 题目' : '搜索 全量题目'} placeholder="搜索题目、能力、类型或 ID" value={query} onChange={event => setQuery(event.target.value)} /></div>
          <select aria-label="按评测组筛选" value={group} onChange={event => setGroup(event.target.value)}>
            <option value="all">全部评测组</option>
            {groups.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
          <select aria-label="按难度筛选" value={difficulty} onChange={event => setDifficulty(event.target.value)}>
            <option value="all">全部难度</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
          </select>
          <select aria-label="按能力筛选" value={capability} onChange={event => setCapability(event.target.value)}>
            <option value="all">全部能力</option>
            {capabilities.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
        </div>
        {!filtered.length ? <Empty title="没有匹配的题目"><Button onClick={reset}>清除筛选</Button></Empty>
          : <div className="table-scroll"><table className="suite-table question-table" aria-label={`${mini ? 'Mini' : '全量'} 题目列表`}>
            <thead><tr><th>题目</th><th>评测组 / 类型</th><th>记忆能力</th><th>难度</th><th>测评价值</th><th><span className="sr-only">详解</span></th></tr></thead>
            <tbody>{visible.map(task => <tr key={`${task.dataset_id}-${task.id}`}>
              <td><button type="button" className="text-link question-link" onClick={() => setSelected(task)}>{task.question}</button>
                <span className="cell-secondary">{task.id}{task.kind === 'episode' ? ' · 叙事闭环' : ''}</span></td>
              <td>{task.group_name}<span className="cell-secondary">{task.task_type}</span></td>
              <td><div className="case-meta">{task.capabilities.slice(0, 3).map(item => <span className="tag" key={item.id}>{item.label}</span>)}</div>
                {task.capabilities.length > 3 && <span className="cell-secondary">另 {task.capabilities.length - 3} 项</span>}</td>
              <td><Difficulty task={task} /></td>
              <td><span className="value-preview">{task.why_hard}</span></td>
              <td><IconButton icon={Eye} label={`查看题目 ${task.id}`} onClick={() => setSelected(task)} /></td>
            </tr>)}</tbody></table></div>}
        {filtered.length > PAGE_SIZE && <div className="question-pagination">
          <span>{page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, filtered.length)} / {filtered.length}</span>
          <div><Button icon={ChevronLeft} disabled={page === 0} onClick={() => setPage(value => Math.max(0, value - 1))}>上一页</Button>
            <span>{page + 1} / {pageCount}</span>
            <Button icon={ChevronRight} disabled={page + 1 >= pageCount} onClick={() => setPage(value => Math.min(pageCount - 1, value + 1))}>下一页</Button></div>
        </div>}
      </section>
    </>}
    {selected && <Modal title={`${selected.id} 题目详解`} drawer onClose={() => setSelected(null)}>
      <QuestionDetail task={selected} />
    </Modal>}
  </>;
}

function Difficulty({ task }: { task: MiniQuestionTask }) {
  return <span className={`difficulty-badge ${task.difficulty}`}>{difficultyLabels[task.difficulty]}</span>;
}

function QuestionDetail({ task }: { task: MiniQuestionTask }) {
  return <div className="question-detail">
    <div className="question-detail-meta">
      <span className="tag">{task.group_name}</span>
      <span className="tag">{task.task_type}</span>
      <Difficulty task={task} />
      {task.kind === 'episode' && <span className="tag">闭环任务</span>}
    </div>
    <h3 className="question-statement">{task.question}</h3>
    <div className="question-value-band"><Target size={20} aria-hidden /><div>
      <h3>为什么有测评价值</h3><p>{task.evaluation_value}</p><p className="value-support">{task.why_hard}</p>
    </div></div>
    <section className="question-detail-section">
      <div className="detail-section-heading"><h3>考查的记忆能力</h3><span>{task.capabilities.length} 项</span></div>
      <div className="capability-detail-list">{task.capabilities.map(item => <div className="capability-detail" key={item.id}>
        <strong>{item.label}</strong><p>{item.description}</p><span>典型失败：{item.failure_mode}</span>
      </div>)}</div>
      {!!task.risks.length && <div className="detail-subsection"><h4>高风险错误</h4>
        <div className="case-meta">{task.risks.map(item => <span className="tag" key={item.id}>{item.label}</span>)}</div>
        <div className="risk-detail-list">{task.risks.map(item => <p key={item.id}><strong>{item.label}：</strong>{item.description}</p>)}</div>
      </div>}
    </section>
    <section className="question-detail-section">
      <div className="detail-section-heading"><h3>关键信息在哪里</h3><span>{task.evidence.length} 条来源</span></div>
      <div className="detail-list">{task.evidence.map((item, index) => <div className="detail-item" key={`${item.id}-${index}`}>
        <div className="detail-item-meta"><code>{item.id}</code><span>{item.location}</span>{item.role && <span>{item.role}</span>}</div>
        <p>{item.content}</p>
        {item.condition && <p className="support-line"><strong>必须满足：</strong>{item.condition}</p>}
        {item.violation && <p className="support-line danger-line"><strong>违规条件：</strong>{item.violation}</p>}
      </div>)}</div>
      {!!task.required_points.length && <div className="detail-subsection"><h4>必须答出的关键点</h4>
        <ol className="required-point-list">{task.required_points.map(item => <li key={item.id}>{item.text}</li>)}</ol></div>}
    </section>
    <section className="question-detail-section">
      <div className="detail-section-heading"><h3>误导信息在哪里</h3><span>{task.misleading.length} 条</span></div>
      {task.misleading.length ? <div className="detail-list">{task.misleading.map((item, index) => <div className="detail-item misleading-item" key={`${item.id}-${index}`}>
        <div className="detail-item-meta"><ShieldAlert size={14} aria-hidden /><span>{item.label}</span><code>{item.id}</code><span>{item.location}</span></div>
        <p>{item.content}</p>
      </div>)}</div> : <p className="muted">未标注显式干扰项。</p>}
    </section>
    <section className="question-detail-section">
      <div className="detail-section-heading"><h3>标准答案与难度依据</h3><Status value="neutral" label={sourceLabels[task.difficulty_source]} /></div>
      <p className="difficulty-reason">{task.difficulty_reason}</p>
      {task.reference_answer && <div className="reference-answer"><h4>标准答案</h4><p>{task.reference_answer}</p></div>}
    </section>
  </div>;
}
