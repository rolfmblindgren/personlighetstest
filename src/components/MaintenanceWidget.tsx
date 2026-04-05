import { useEffect, useState } from "react";

import Button from "@/components/Button";
import { authFetch } from "@/lib/apiFetch";
import { API } from "@/lib/apiBase";
import { t } from "@/i18n";

type MaintenanceState = {
  active: boolean;
  env_active: boolean;
  runtime_active: boolean | null;
  title?: string;
  message?: string;
};

export default function MaintenanceWidget() {
  const [state, setState] = useState<MaintenanceState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    try {
      const res = await authFetch(`${API}/admin/maintenance`);
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(payload?.error || "Kunne ikke hente vedlikeholdsstatus");
      }
      setState(payload);
    } catch (error: any) {
      setErr(error?.message || "Kunne ikke hente vedlikeholdsstatus");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggle = async () => {
    if (!state || saving) return;

    setSaving(true);
    setErr("");
    try {
      const res = await authFetch(`${API}/admin/maintenance`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !state.active }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(payload?.error || "Kunne ikke oppdatere vedlikeholdsmodus");
      }
      setState(payload);
    } catch (error: any) {
      setErr(error?.message || "Kunne ikke oppdatere vedlikeholdsmodus");
    } finally {
      setSaving(false);
    }
  };

  const isActive = Boolean(state?.active);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            {t("maintenanceModeLabel")}
          </div>
          <div className={`mt-2 text-lg font-semibold ${isActive ? "text-amber-700" : "text-emerald-700"}`}>
            {isActive ? t("maintenanceOnState") : t("maintenanceOffState")}
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {isActive
              ? (state?.message || t("maintenanceModeOnHelp"))
              : t("maintenanceModeOffHelp")}
          </p>
        </div>

        <div className={`mt-1 h-3.5 w-3.5 rounded-full ${isActive ? "bg-amber-500" : "bg-emerald-500"}`} />
      </div>

      {state?.env_active && (
        <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm leading-6 text-sky-900">
          {t("maintenanceEnvNotice")}
        </div>
      )}

      {err && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      )}

      <Button
        onClick={toggle}
        disabled={loading || saving || !state}
        variant={isActive ? "secondary" : "primary"}
        size="md"
        className={isActive ? "w-full border-amber-200 text-amber-800 hover:bg-amber-50" : "w-full"}
      >
        {saving
          ? t("maintenanceModeSaving")
          : isActive
            ? t("maintenanceTurnOff")
            : t("maintenanceTurnOn")}
      </Button>
    </div>
  );
}
