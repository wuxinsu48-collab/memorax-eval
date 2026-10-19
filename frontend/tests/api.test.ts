import { afterEach, expect, it, vi } from 'vitest';
import { ApiError, exportRun, request } from '../src/api';

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

it('retains Chinese server detail and conflict status', async () => {
  vi.stubGlobal('fetch', async () => Response.json({ detail: 'Add 投递状态未知' }, { status: 409 }));
  await expect(request('/runs/test/resume', { method: 'POST', body: {} })).rejects.toEqual(
    new ApiError('Add 投递状态未知', 409),
  );
});

it('rejects a non-JSON success response instead of silently rendering empty data', async () => {
  vi.stubGlobal('fetch', async () => new Response('<html>wrong server</html>'));
  await expect(request('/runs')).rejects.toThrow('本地服务返回了无效 JSON');
});

it('displays JSON export errors rather than downloading the error response', async () => {
  vi.stubGlobal('fetch', async () => Response.json({ detail: '运行不存在' }, { status: 404 }));
  await expect(exportRun('missing', 'json')).rejects.toThrow('运行不存在');
});

it('downloads the requested format and releases the temporary blob URL', async () => {
  vi.useFakeTimers();
  const paths: string[] = [];
  vi.stubGlobal('fetch', async (path: string) => {
    paths.push(path);
    return new Response('用例 ID,结果\nA01,通过\n', { headers: { 'Content-Type': 'text/csv' } });
  });
  const create = vi.fn(() => 'blob:test-export');
  const revoke = vi.fn();
  Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: create });
  Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revoke });
  let filename = '';
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
    filename = this.download;
  });
  await exportRun('run-test', 'csv');
  expect(paths).toEqual(['/api/runs/run-test/export?format=csv']);
  expect(filename).toBe('run-test.csv');
  expect(document.querySelector('a[download]')).toBeNull();
  await vi.advanceTimersByTimeAsync(1000);
  expect(revoke).toHaveBeenCalledWith('blob:test-export');
});
