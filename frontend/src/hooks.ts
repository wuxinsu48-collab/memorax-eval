import { useCallback, useEffect, useRef, useState } from 'react';
import { errorMessage, isAbort, request } from './api';
import type { RunDetail, RunStatus } from './types';

export function useResource<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => setRevision((r) => r + 1), []);
  useEffect(() => {
    setData(null);
    setError(null);
    if (path === null) { setLoading(false); return; }
    const controller = new AbortController();
    setLoading(true);
    request<T>(path, { signal: controller.signal })
      .then((result) => { if (!controller.signal.aborted) setData(result); })
      .catch((err: unknown) => { if (!controller.signal.aborted && !isAbort(err)) setError(errorMessage(err)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [path, revision]);
  return { data, error, loading, reload };
}

export const isActive = (status: RunStatus) => ['pending', 'running', 'stopping'].includes(status);
export const canResume = (status: RunStatus) => ['stopped', 'interrupted', 'failed'].includes(status);

// One visible run owns one sequential poll loop; cleanup aborts both timer and I/O.
export function useRun(id: string, paused = false) {
  const [data, setData] = useState<RunDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const latest = useRef<RunDetail | null>(null);
  const replace = useCallback((next: RunDetail) => {
    latest.current = next;
    setData(next);
    setError(null);
    setLoading(false);
  }, []);
  const reload = useCallback(() => setRevision((r) => r + 1), []);
  useEffect(() => {
    latest.current = null;
    setData(null);
    setError(null);
    setLoading(true);
  }, [id]);
  useEffect(() => {
    if (paused) return;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const poll = async () => {
      try {
        const next = await request<RunDetail>(`/runs/${encodeURIComponent(id)}`, { signal: controller.signal });
        if (controller.signal.aborted) return;
        replace(next);
        if (isActive(next.status)) timer = setTimeout(poll, 1500);
      } catch (err) {
        if (controller.signal.aborted || isAbort(err)) return;
        setError(errorMessage(err));
        setLoading(false);
        if (latest.current && isActive(latest.current.status)) timer = setTimeout(poll, 2000);
      }
    };
    void poll();
    return () => { controller.abort(); clearTimeout(timer); };
  }, [id, paused, revision, replace]);
  return { data, error, loading, reload, replace };
}

export function useHashRoute() {
  const read = () => window.location.hash.replace(/^#/, '') || '/';
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const changed = () => setRoute(read());
    window.addEventListener('hashchange', changed);
    return () => window.removeEventListener('hashchange', changed);
  }, []);
  const navigate = useCallback((path: string) => {
    window.location.hash = path;
    setRoute(path);
    window.scrollTo?.({ top: 0 });
  }, []);
  return { route, navigate };
}
