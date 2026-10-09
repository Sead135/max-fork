import type { Credentials } from './types';

const API_HOST = 'https://3100.api.green-api.com';
const RETRY_DELAYS_MS = [1500, 3000, 6000];

export function methodUrl(credentials: Credentials, method: string) {
  const id = encodeURIComponent(credentials.idInstance.trim());
  const token = encodeURIComponent(credentials.apiTokenInstance.trim());
  return `${API_HOST}/waInstance${id}/${method}/${token}`;
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function quotaError() {
  return Object.assign(new Error('Исчерпана квота плана GREEN-API'), {
    status: 466 as const
  });
}

export function isQuotaError(error: unknown): error is Error & { status: 466 } {
  return (
    error instanceof Error &&
    'status' in error &&
    (error as { status?: number }).status === 466
  );
}

export function quotaOrRateLimitError(status: number): Error | null {
  if (status === 466) {
    return quotaError();
  }

  if (status === 429) {
    return new Error('Слишком много запросов к GREEN-API, подождите немного');
  }

  return null;
}

export async function fetchWithRetry(
  input: string,
  init?: RequestInit
): Promise<Response> {
  let response = await fetch(input, init);

  for (const delay of RETRY_DELAYS_MS) {
    if (response.status !== 429) {
      return response;
    }

    await sleep(delay);
    response = await fetch(input, init);
  }

  return response;
}

export async function readJson<T>(
  response: Response,
  fallback: string
): Promise<T> {
  const limitError = quotaOrRateLimitError(response.status);
  if (limitError) {
    throw limitError;
  }

  if (!response.ok) {
    throw new Error(fallback);
  }

  return response.json() as Promise<T>;
}
