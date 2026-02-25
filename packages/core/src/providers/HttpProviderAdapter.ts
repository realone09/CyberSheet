// HttpProviderAdapter.ts
// Production‑grade HTTP helper for data type providers. Implements timeout, retries,
// exponential backoff with jitter, error classification, and is deterministic
// enough to unit test.

import { ProviderError } from './ProviderResolution';

export interface HttpProviderOptions {
  timeoutMs?: number;
  retries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
}

export interface HttpRequestConfig {
  url: string;
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  body?: string;
}

export interface HttpResponse<T = any> {
  data?: T;
  error?: ProviderError;
  status?: number;
}

export class HttpProviderAdapter {
  constructor(
    private fetchFn: typeof fetch,
    private sleepFn: (ms: number) => Promise<void>,
    private opts: HttpProviderOptions = {},
    private randomFn: () => number = Math.random
  ) {
    // apply defaults
    this.opts = {
      timeoutMs: 5000,
      retries: 3,
      baseDelayMs: 100,
      maxDelayMs: 1000,
      ...opts,
    };
  }

  private classifyError(err: any, status?: number): ProviderError {
    if (err?.name === 'AbortError' || status === 0) {
      return { kind: 'TIMEOUT', retryable: true, message: 'Request timed out' };
    }

    if (status) {
      if (status === 401 || status === 403) {
        return { kind: 'AUTH', retryable: false, message: 'Unauthorized' };
      }
      if (status === 429) {
        return { kind: 'RATE_LIMIT', retryable: true, message: 'Rate limit exceeded' };
      }
      if (status >= 500 && status <= 599) {
        return { kind: 'SERVER', retryable: true, message: `Server error ${status}` };
      }
    }

    if (err instanceof SyntaxError) {
      return { kind: 'PARSE', retryable: false, message: 'Invalid JSON' };
    }

    if (err?.code === 'ENOTFOUND' || err?.code === 'ECONNREFUSED' || err?.code === 'ECONNRESET') {
      return { kind: 'NETWORK', retryable: true, message: 'Network failure' };
    }

    return { kind: 'UNKNOWN', retryable: false, message: err?.message || String(err) };
  }

  private async attempt<T>(config: HttpRequestConfig): Promise<HttpResponse<T>> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.opts.timeoutMs);

    try {
      const res = await this.fetchFn(config.url, {
        method: config.method || 'GET',
        headers: config.headers,
        body: config.body,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const status = res.status;
      let payload: any;
      try {
        payload = await res.json();
      } catch (jsErr) {
        return { error: this.classifyError(jsErr, status), status };
      }

      if (!res.ok) {
        // map non-2xx to ProviderError; include retry-after if present
        const error = this.classifyError(null, status);
        if (status === 429) {
          const ra = res.headers.get('retry-after');
          if (ra) {
            error.retryAfter = ra;
          }
        }
        return { error, status };
      }

      return { data: payload, status };
    } catch (err: any) {
      clearTimeout(timeout);
      return { error: this.classifyError(err), status: err?.status }; // status may be undefined
    }
  }

  private backoffDelay(attempt: number): number {
    const { baseDelayMs = 100, maxDelayMs = 1000 } = this.opts;
    const delay = Math.min(baseDelayMs * 2 ** attempt, maxDelayMs);
    const jitter = Math.floor(this.randomFn() * 100);
    return delay + jitter;
  }

  public async request<T>(config: HttpRequestConfig): Promise<HttpResponse<T>> {
    const { retries = 3 } = this.opts;
    let attempt = 0;

    while (true) {
      const resp = await this.attempt<T>(config);
      if (!resp.error) {
        return resp; // success
      }

      const err = resp.error;
      if (attempt >= retries || !err.retryable) {
        return resp; // give up
      }

      // if rate limit and Retry-After header available, respect it
      let delay = this.backoffDelay(attempt);
      if (err.kind === 'RATE_LIMIT' && resp.status === 429 && resp.error?.retryAfter) {
        const ra = parseInt(resp.error.retryAfter, 10);
        if (!isNaN(ra)) {
          delay = Math.max(delay, ra * 1000); // seconds -> ms
        }
      }

      await this.sleepFn(delay);
      attempt += 1;
    }
  }
}
