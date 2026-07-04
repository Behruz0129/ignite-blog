"use client";

// Client-side auth: token saqlash, login/register/logout/refresh

import { PUBLIC_API_URL } from "./api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
  provider?: string;
}

const TOKEN_KEY = "ignite_token";
const REFRESH_KEY = "ignite_refresh";
const USER_KEY = "ignite_user";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}

export function saveAuth(token: string, user: AuthUser, refreshToken?: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

async function authFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ ok: boolean; data?: T; message?: string }> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };
  const token = getStoredToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${PUBLIC_API_URL}${path}`, { ...options, headers });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false, message: json?.message || "Xatolik" };
  }
  return { ok: true, data: json.data };
}

export async function login(email: string, password: string) {
  const res = await authFetch<{
    token: string;
    refreshToken: string;
    user: AuthUser;
  }>("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok || !res.data) throw new Error(res.message || "Kirish xatosi");
  saveAuth(res.data.token, res.data.user, res.data.refreshToken);
  return res.data.user;
}

export async function register(name: string, email: string, password: string) {
  const res = await authFetch<{
    token: string;
    refreshToken: string;
    user: AuthUser;
  }>("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok || !res.data) throw new Error(res.message || "Ro'yxatdan o'tish xatosi");
  saveAuth(res.data.token, res.data.user, res.data.refreshToken);
  return res.data.user;
}

export async function logout() {
  const refreshToken = getStoredRefreshToken();
  await authFetch("/auth/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  clearAuth();
}

export async function fetchMe(): Promise<AuthUser | null> {
  const res = await authFetch<AuthUser>("/auth/me");
  if (!res.ok || !res.data) return null;
  const token = getStoredToken();
  if (token) saveAuth(token, res.data, getStoredRefreshToken() || undefined);
  return res.data;
}

export function getOAuthUrl(provider: "google" | "discord"): string {
  return `${PUBLIC_API_URL}/auth/${provider}`;
}

export async function authPost<T>(path: string, body: unknown): Promise<T> {
  const res = await authFetch<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok || !res.data) throw new Error(res.message || "Xatolik");
  return res.data;
}
