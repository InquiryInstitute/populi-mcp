/**
 * Populi API client. Requires POPULI_BASE_URL and POPULI_API_KEY env vars.
 * Base URL format: https://yourschool.populiweb.com (no trailing slash)
 */
const BASE = process.env.POPULI_BASE_URL?.replace(/\/$/, "") || "";
const API_KEY = process.env.POPULI_API_KEY || "";

export function getConfig(): { baseUrl: string; apiKey: string } {
  return { baseUrl: BASE, apiKey: API_KEY };
}

export function ensureConfig(): void {
  if (!BASE || !API_KEY) {
    throw new Error(
      "Populi MCP requires POPULI_BASE_URL and POPULI_API_KEY environment variables. " +
        "Example: POPULI_BASE_URL=https://yourschool.populiweb.com POPULI_API_KEY=sk_xxx"
    );
  }
}

export async function populiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  ensureConfig();
  const url = `${BASE}/api2${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Populi API ${res.status}: ${body || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function populiGet<T>(path: string): Promise<T> {
  return populiFetch<T>(path, { method: "GET" });
}

export async function populiPost<T>(path: string, body?: unknown): Promise<T> {
  return populiFetch<T>(path, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}
