// lib/apiFetch.tsx

import { useAuth } from "@/context/AuthContext";  // 👈 ny
import { API } from "@/lib/apiBase";
import { authContext } from "@/context/AuthContext";

// apiFetch er en vanlig funksjon som fungerer både i komponenter og utenfor React.
// Den får tilgang til AuthContext via authContext (ikke via useAuth-hooken).

export async function apiFetch(input: string, init: RequestInit = {}) {
  // Les context-verdi direkte fra det opprettede context-objektet
  const ctx = authContext._currentValue;

  const token = ctx?.getToken?.() || localStorage.getItem("token");
  const headers = new Headers(init.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(input, { ...init, headers });

  // Rolling renewal: backend sender nytt access-token i responsheader
  const fresh = res.headers.get("X-Access-Token");
  if (fresh) ctx?.setToken?.(fresh);

  // Ferdig hvis ikke 401
  if (res.status !== 401) return res;

  // Prøv refresh én gang
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) {
    ctx?.logout?.();
    return res;
  }

  const rr = await fetch(`${API}/auth/refresh`, {
    method: "POST",
    headers: { Authorization: `Bearer ${refresh}` },
  });
  if (!rr.ok) {
    ctx?.logout?.();
    return res;
  }

  const data = await rr.json();
  if (!data?.token) {
    ctx?.logout?.();
    return res;
  }

  // Lagre nytt token og retry original request
  ctx?.setToken?.(data.token);
  const retryHeaders = new Headers(init.headers || {});
  retryHeaders.set("Authorization", `Bearer ${data.token}`);
  return fetch(input, { ...init, headers: retryHeaders });
}


export async function authFetch(url: string, init: RequestInit = {}) {
  const ctx = authContext._currentValue;
  const token = ctx?.getToken?.() || localStorage.getItem("token");

  const headers = new Headers(init.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(url, { ...init, headers });
  console.log(url)
  console.log(headers)

  // 2) plukk opp rullende token fra responsheader
  const fresh = res.headers.get("X-Access-Token");
  if (fresh) ctx?.setToken?.(fresh);

  // 3) ferdig hvis ikke 401
  if (res.status !== 401) return res;

  // 4) prøv refresh én gang
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) {
    ctx?.logout?.();
    return res;
  }

  const rr = await fetch(`${API}/auth/refresh`, {
    method: "POST",
    headers: { Authorization: `Bearer ${refresh}` },
  });
  if (!rr.ok) {
    ctx?.logout?.();
    return res;
  }

  const data = await rr.json();
  if (!data?.token) {
    ctx?.logout?.();
    return res;
  }

  // lagre nytt access-token og retry originalkallet
  ctx?.setToken?.(data.token);

  const retryHeaders = new Headers(init.headers || {});
  retryHeaders.set("Authorization", `Bearer ${data.token}`);

  return fetch(url, { ...init, headers: retryHeaders });
}
