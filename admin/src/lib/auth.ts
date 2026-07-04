// Token va foydalanuvchini brauzer localStorage'da saqlash

import type { User } from "./types";

const TOKEN_KEY = "ignite_token";
const REFRESH_KEY = "ignite_refresh";
const USER_KEY = "ignite_user";

export function saveAuth(token: string, user: User, refreshToken?: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as User) : null;
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isLoggedIn(): boolean {
  return Boolean(getToken());
}

export function isAdminRole(role?: string): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

export function isSuperAdmin(role?: string): boolean {
  return role === "SUPER_ADMIN";
}
