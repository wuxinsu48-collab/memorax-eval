export class ApiError extends Error {
  constructor(message: string, public status = 0) {
    super(message);
    this.name = 'ApiError';
  }
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '请求失败，请重试。';
}

export function isAbort(error: unknown) {
  return error instanceof Error && error.name === 'AbortError';
}

async function responseError(response: Response): Promise<ApiError> {
  try {
    const body: { detail?: unknown } = await response.json();
    if (typeof body.detail === 'string') return new ApiError(body.detail, response.status);
    if (Array.isArray(body.detail)) {
      const messages = body.detail.map((item: { msg?: string }) => item.msg).filter(Boolean);
      if (messages.length) return new ApiError(messages.join('；'), response.status);
    }
  } catch { /* Non-JSON error responses retain their HTTP status. */ }
  return new ApiError(`本地服务返回错误（HTTP ${response.status}），请重试。`, response.status);
}

export async function request<T>(path: string, options: {
  method?: 'GET' | 'POST'; body?: unknown; signal?: AbortSignal;
} = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      method: options.method ?? 'GET',
      headers: options.body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
      cache: 'no-store',
    });
  } catch (error) {
    if (isAbort(error)) throw error;
    throw new ApiError('网络连接失败，请确认本地后端已启动后重试。');
  }
  if (!response.ok) throw await responseError(response);
  try {
    return await response.json() as T;
  } catch {
    throw new ApiError('本地服务返回了无效 JSON，请检查服务日志。', response.status);
  }
}

export async function exportRun(id: string, format: 'json' | 'csv' | 'metrics_csv', signal?: AbortSignal) {
  let response: Response;
  try {
    response = await fetch(`/api/runs/${encodeURIComponent(id)}/export?format=${format}`, { signal, cache: 'no-store' });
  } catch (error) {
    if (isAbort(error)) throw error;
    throw new ApiError('导出失败，无法连接本地服务。');
  }
  if (!response.ok) throw await responseError(response);
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = format === 'metrics_csv' ? `${id}-metrics.csv` : `${id}.${format}`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
