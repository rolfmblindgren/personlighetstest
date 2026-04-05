import { API } from "@/lib/apiBase";

export const MAINTENANCE_EVENT = "portal:maintenance";

const BYPASS_STORAGE_KEY = "maintenanceBypassToken";
const BYPASS_QUERY_KEY = "maintenance_bypass";

export type MaintenanceState = {
  active: boolean;
  bypassed?: boolean;
  code?: string;
  title?: string;
  message?: string;
  until?: string | null;
  contact_email?: string | null;
  source?: "env" | "backend" | "runtime";
};

function parseBool(value: unknown): boolean {
  return ["1", "true", "yes", "y", "on"].includes(String(value || "").trim().toLowerCase());
}

function normalizeState(payload: any, source: MaintenanceState["source"]): MaintenanceState {
  return {
    active: Boolean(payload?.active),
    bypassed: Boolean(payload?.bypassed),
    code: payload?.code || (payload?.active ? "MAINTENANCE" : "OK"),
    title: payload?.title || "Vi er straks tilbake",
    message:
      payload?.message ||
      "Vi oppgraderer tjenesten akkurat nå. Det skal ikke vare lenge.",
    until: payload?.until || null,
    contact_email: payload?.contact_email || null,
    source,
  };
}

export function getStoredMaintenanceBypassToken(): string {
  if (typeof window === "undefined") return "";
  return (window.localStorage.getItem(BYPASS_STORAGE_KEY) || "").trim();
}

export function captureMaintenanceBypassFromUrl(): string {
  if (typeof window === "undefined") return "";

  const url = new URL(window.location.href);
  const token = (url.searchParams.get(BYPASS_QUERY_KEY) || "").trim();
  if (!token) return "";

  window.localStorage.setItem(BYPASS_STORAGE_KEY, token);
  url.searchParams.delete(BYPASS_QUERY_KEY);
  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  return token;
}

export function applyMaintenanceBypass(headers: Headers): Headers {
  const token = getStoredMaintenanceBypassToken();
  if (token) headers.set("X-Maintenance-Bypass", token);
  return headers;
}

export function getEnvMaintenanceState(): MaintenanceState | null {
  const active = parseBool(import.meta.env.VITE_MAINTENANCE_MODE);
  if (!active) return null;

  const expectedBypass = String(import.meta.env.VITE_MAINTENANCE_BYPASS_TOKEN || "").trim();
  const providedBypass = getStoredMaintenanceBypassToken();
  if (expectedBypass && providedBypass && expectedBypass === providedBypass) {
    return null;
  }

  return normalizeState(
    {
      active: true,
      code: "MAINTENANCE",
      title: import.meta.env.VITE_MAINTENANCE_TITLE,
      message: import.meta.env.VITE_MAINTENANCE_MESSAGE,
      until: import.meta.env.VITE_MAINTENANCE_UNTIL,
      contact_email: import.meta.env.VITE_MAINTENANCE_CONTACT_EMAIL,
    },
    "env"
  );
}

export function emitMaintenanceState(state: MaintenanceState): MaintenanceState {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(MAINTENANCE_EVENT, { detail: state }));
  }
  return state;
}

export async function notifyMaintenanceFromResponse(res: Response): Promise<void> {
  if (res.status !== 503) return;

  try {
    const payload = await res.json();
    if (payload?.code === "MAINTENANCE" || payload?.active) {
      emitMaintenanceState(normalizeState(payload, "runtime"));
    }
  } catch {
    // Ignorer vanlige 503-er uten maintenance-payload.
  }
}

export async function fetchMaintenanceState(): Promise<MaintenanceState> {
  const envState = getEnvMaintenanceState();
  if (envState) return emitMaintenanceState(envState);

  try {
    const headers = applyMaintenanceBypass(new Headers());
    const token = localStorage.getItem("token");
    if (token) headers.set("Authorization", `Bearer ${token}`);
    const res = await fetch(`${API}/maintenance-status`, { headers });
    const payload = await res.json().catch(() => null);
    const state = normalizeState(payload, "backend");
    return emitMaintenanceState(state);
  } catch {
    return emitMaintenanceState({ active: false, source: "backend" });
  }
}
