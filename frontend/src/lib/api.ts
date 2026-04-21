// Centralized API client with JWT injection + refresh-on-401.


export const API_BASE = "http://127.0.0.1:8000/api";

const ACCESS_KEY = "farm.access";
const REFRESH_KEY = "farm.refresh";
const USER_KEY = "farm.user";

export type Role = "admin" | "agent";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export const tokenStore = {
  getAccess: () => (typeof window === "undefined" ? null : localStorage.getItem(ACCESS_KEY)),
  getRefresh: () => (typeof window === "undefined" ? null : localStorage.getItem(REFRESH_KEY)),
  getUser: (): AuthUser | null => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },
  set: (access: string, refresh: string, user: AuthUser) => {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(status: number, message: string, data: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function refreshAccess(): Promise<string | null> {
  const refresh = tokenStore.getRefresh();
  if (!refresh) return null;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { access?: string };
    if (!data.access) return null;
    const user = tokenStore.getUser();
    if (user) tokenStore.set(data.access, refresh, user);
    return data.access;
  } catch {
    return null;
  }
}

export interface ApiOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  auth?: boolean;
}

export async function api<T = unknown>(path: string, opts: ApiOptions = {}): Promise<T> {
  const { body, auth = true, headers, ...rest } = opts;

  const buildHeaders = (token: string | null): HeadersInit => {
    const h: Record<string, string> = {
      Accept: "application/json",
      ...(headers as Record<string, string> | undefined),
    };
    if (body !== undefined) h["Content-Type"] = "application/json";
    if (auth && token) h["Authorization"] = `Bearer ${token}`;
    return h;
  };

  const doFetch = (token: string | null) =>
    fetch(`${API_BASE}${path}`, {
      ...rest,
      headers: buildHeaders(token),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

  let token = tokenStore.getAccess();
  let res = await doFetch(token);

  if (res.status === 401 && auth) {
    const newToken = await refreshAccess();
    if (newToken) {
      token = newToken;
      res = await doFetch(token);
    } else {
      tokenStore.clear();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
  }

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    if (data && typeof data === "object") {
      if ("detail" in data) {
        msg = String((data as { detail: unknown }).detail);
      } else {
        // extract Django validation dictionary arrays
        const errs = Object.entries(data).map(([k, v]) => {
          const val = Array.isArray(v) ? v[0] : v;
          return k === "non_field_errors" ? String(val) : `${k}: ${val}`;
        });
        if (errs.length > 0) msg = errs.join(", ");
      }
    } else if (typeof data === "string") {
      msg = data;
    }
    throw new ApiError(res.status, msg, data);
  }

  return data as T;
}
