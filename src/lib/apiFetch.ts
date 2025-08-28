// lib/apiFetch.ts
export async function apiFetch(input: string, init: RequestInit = {}) {
  const token = localStorage.getItem("token");
  const headers = new Headers(init.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(input, { ...init, headers });

  // Sømløs rolling renewal
  const fresh = res.headers.get("X-Access-Token");
  if (fresh) localStorage.setItem("token", fresh);

  if (res.status !== 401) return res;

  // 401? Prøv refresh en gang
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) return res;

  const r = await fetch(`${API}/auth/refresh`, {
    method: "POST",
    headers: { Authorization: `Bearer ${refresh}` },
  });
  if (!r.ok) return res;

  const data = await r.json();
  if (data.token) {
    localStorage.setItem("token", data.token);
    // retry original request
    const retryHeaders = new Headers(init.headers || {});
    retryHeaders.set("Authorization", `Bearer ${data.token}`);
    return fetch(input, { ...init, headers: retryHeaders });
  }
  return res;
}

export async function authFetch(url: string, init: RequestInit = {}) {
  // 1) send dagens access-token
  const headers = new Headers(init.headers || {});
  const token = localStorage.getItem("token");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(url, { ...init, headers });

  // 2) plukk opp rullende token fra responsheader (se backend-koden jeg ga)
  const fresh = res.headers.get("X-Access-Token");
  if (fresh) localStorage.setItem("token", fresh);

  // 3) ferdig hvis ikke 401
  if (res.status !== 401) return res;

  // 4) prøv refresh en gang
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) return res; // ingen refresh -> la 401 boble

  const rr = await fetch(`${API}/auth/refresh`, {
    method: "POST",
    headers: { Authorization: `Bearer ${refresh}` },
  });
  if (!rr.ok) return res;

  const data = await rr.json();
  if (!data?.token) return res;

  // lagre nytt access-token og retry originalkallet
  localStorage.setItem("token", data.token);
  const retryHeaders = new Headers(init.headers || {});
  retryHeaders.set("Authorization", `Bearer ${data.token}`);
  return fetch(url, { ...init, headers: retryHeaders });
}
