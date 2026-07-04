/**
 * API base URL — build va runtime uchun xavfsiz normalizatsiya.
 */

export function normalizeApiBaseUrl(raw?: string): string {
  let u = (raw || "").trim().replace(/\\/g, "/");

  const fullUrl = u.match(/https?:\/\/[^\s"'<>]+/i);
  if (fullUrl) {
    u = fullUrl[0];
  } else {
    const brokenUrl = u.match(/https?:\/[^\s"'<>]+/i);
    if (brokenUrl) {
      u = brokenUrl[0].replace(/^(https?:)\/(?!\/)/i, "$1//");
    }
  }

  u = u.replace(/^(https?:)\/(?!\/)/i, "$1//");
  u = u.replace(/\/+$/, "");

  if (!/^https?:\/\//i.test(u)) {
    return "http://localhost:5000/api";
  }
  return u;
}

export const API_BASE_URL = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL);
