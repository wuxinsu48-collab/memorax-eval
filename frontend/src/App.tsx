import { Component, useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowUpRight, BookOpenCheck, BrainCircuit, ChevronRight, Database, FlaskConical, Gauge, History as HistoryIcon, LayoutDashboard, ListChecks, Menu, Radio, Settings2, Trophy, X } from 'lucide-react';
import { useHashRoute, useResource } from './hooks';
import { IconButton } from './ui';
import Overview, { History } from './pages/Overview';
import { CredentialsProvider } from './credentials';
import NewRun from './pages/NewRun';
import DatasetInspector from './pages/DatasetInspector';
import RunView from './pages/RunView';
import Smoke from './pages/Smoke';
import CustomRun from './pages/CustomRun';
import QuestionLibrary from './pages/QuestionLibrary';
import Leaderboard from './pages/Leaderboard';

class PageBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? <div className="empty-state" role="alert">
      <h2>页面加载异常</h2><p>请刷新页面，或检查本地服务返回的数据。</p>
      <button className="button secondary" onClick={() => window.location.reload()}>刷新页面</button>
    </div> : this.props.children;
  }
}

export default function App() {
  const { route, navigate } = useHashRoute();
  const standaloneLeaderboard = import.meta.env.VITE_STANDALONE_LEADERBOARD === 'true';
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobile, setMobile] = useState(() => window.matchMedia?.('(max-width: 760px)').matches ?? false);
  const health = useResource<{ status: string; version: string }>(standaloneLeaderboard ? null : '/health');
  const menuButton = useRef<HTMLButtonElement>(null);
  const menuPanel = useRef<HTMLElement>(null);
  const section = standaloneLeaderboard ? 'leaderboard' : route.startsWith('/runs/') ? 'detail' : route === '/custom' ? 'custom' : route === '/mini/questions' ? 'miniQuestions' : route === '/questions' ? 'questions' : route === '/mini' ? 'mini' : route === '/smoke' ? 'smoke' : route === '/new' ? 'new' : route === '/settings' ? 'settings' : route === '/history' ? 'history' : route === '/datasets' ? 'datasets' : route === '/leaderboard' ? 'leaderboard' : 'overview';
  const label = section === 'custom' ? '自定义评测' : section === 'miniQuestions' ? 'Mini 题库' : section === 'questions' ? '测试集题库' : section === 'mini' ? 'MiniBench' : section === 'smoke' ? '快速自检' : section === 'settings' ? '评测设置' : section === 'history' ? '运行记录' : section === 'new' ? '新建评测' : section === 'datasets' ? '数据集' : section === 'leaderboard' ? 'YAML 榜单' : section === 'detail' ? '运行详情' : '必测评测集';
  const go = (path: string) => {
    if (mobile && document.activeElement instanceof HTMLElement) document.activeElement.blur();
    navigate(path); setMenuOpen(false);
  };
  useEffect(() => {
    const media = window.matchMedia?.('(max-width: 760px)');
    if (!media) return;
    const update = () => { setMobile(media.matches); if (!media.matches) setMenuOpen(false); };
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    menuPanel.current?.querySelector<HTMLButtonElement>('nav button')?.focus();
    const escape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setMenuOpen(false); menuButton.current?.focus(); }
      if (e.key === 'Tab') {
        const elements = menuPanel.current?.querySelectorAll<HTMLButtonElement>('button');
        if (!elements?.length) return;
        const first = elements[0], last = elements[elements.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('keydown', escape); document.body.style.overflow = previousOverflow; };
  }, [menuOpen]);

  return <CredentialsProvider><div className="app-shell">
    {menuOpen && <div className="nav-backdrop" onClick={() => setMenuOpen(false)} />}
    <aside ref={menuPanel} className={`sidebar ${menuOpen ? 'open' : ''}`} aria-label="主导航" inert={mobile && !menuOpen}>
      <div className="brand"><span className="brand-mark"><BrainCircuit size={24} strokeWidth={1.6} /></span>
        <div><strong>MemoraX</strong><span>评测工作台</span></div>
        <IconButton icon={X} label="关闭导航" className="icon-button mobile-nav-close" onClick={() => setMenuOpen(false)} />
      </div>
      <div className="nav-label">工作区</div>
      <nav>
        {(standaloneLeaderboard ? [
          { key: 'leaderboard', path: '/leaderboard', name: 'YAML 榜单', icon: Trophy },
        ] : [
          { key: 'overview', path: '/', name: '必测评测集', icon: LayoutDashboard },
          { key: 'leaderboard', path: '/leaderboard', name: 'YAML 榜单', icon: Trophy },
          { key: 'mini', path: '/mini', name: 'MiniBench', icon: Gauge },
          { key: 'miniQuestions', path: '/mini/questions', name: 'Mini 题库', icon: BookOpenCheck },
          { key: 'questions', path: '/questions', name: '测试集题库', icon: BookOpenCheck },
          { key: 'custom', path: '/custom', name: '自定义评测', icon: ListChecks },
          { key: 'smoke', path: '/smoke', name: '快速自检', icon: FlaskConical },
          { key: 'settings', path: '/settings', name: '评测设置', icon: Settings2 },
          { key: 'history', path: '/history', name: '运行记录', icon: HistoryIcon },
          { key: 'datasets', path: '/datasets', name: '数据集', icon: Database },
        ]).map(({ key, path, name, icon: Icon }) => <button key={key} type="button" title={name}
          className={`nav-item ${(key === section || key === 'overview' && section === 'detail') ? 'selected' : ''}`}
          aria-current={key === section ? 'page' : undefined} onClick={() => go(path)}>
          <Icon size={18} strokeWidth={1.7} aria-hidden /><span>{name}</span>
        </button>)}
      </nav>
      <div className="sidebar-footer"><span className="workspace-icon"><FlaskConical size={17} aria-hidden /></span>
        <div><strong>本地工作区</strong><span>Local evaluation</span></div><ArrowUpRight size={14} aria-hidden />
      </div>
    </aside>
    <div className="main-shell" inert={mobile && menuOpen}>
      <header className="topbar">
        <button ref={menuButton} className="icon-button mobile-menu" title="打开导航" aria-label="打开导航"
          aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)}><Menu size={20} aria-hidden /></button>
        <div className="breadcrumb"><span>工作区</span><ChevronRight size={14} aria-hidden /><span>{label}</span></div>
        {!standaloneLeaderboard && <div className={`service-state ${health.data?.status === 'ok' ? 'connected' : ''}`} role="status">
          <Radio size={14} aria-hidden /><span>{health.loading ? '正在连接' : health.data?.status === 'ok' ? '本地服务已连接' : '服务未连接'}</span>
          {health.data?.version && <span className="version">v{health.data.version}</span>}
        </div>}
      </header>
      <main className="page" id="main-content">
        <PageBoundary key={route}>
          {standaloneLeaderboard ? <Leaderboard navigate={go} standalone />
            : section === 'new' ? <NewRun onCreated={(id) => go(`/runs/${encodeURIComponent(id)}`)} />
            : section === 'custom' ? <CustomRun navigate={go} />
            : section === 'settings' ? <NewRun settingsOnly onCreated={(id) => go(`/runs/${id}`)} onSaved={() => go('/')} />
            : section === 'miniQuestions' ? <QuestionLibrary scope="mini" />
            : section === 'questions' ? <QuestionLibrary scope="full" />
            : section === 'mini' ? <Overview navigate={go} mode="mini" />
            : section === 'smoke' ? <Smoke navigate={go} />
            : section === 'history' ? <History navigate={go} />
            : section === 'datasets' ? <DatasetInspector />
            : section === 'leaderboard' ? <Leaderboard navigate={go} />
            : section === 'detail' ? <RunView key={route} id={decodeURIComponent(route.slice('/runs/'.length))}
              onBack={() => go('/')} onOpenRun={(runId) => go(`/runs/${encodeURIComponent(runId)}`)} />
            : <Overview navigate={go} mode="full" />}
        </PageBoundary>
        <footer className="page-footer"><span>MEMORAX / EVALUATION WORKBENCH</span><span>本地评测 · 可追溯记录</span></footer>
      </main>
    </div>
  </div></CredentialsProvider>;
}
