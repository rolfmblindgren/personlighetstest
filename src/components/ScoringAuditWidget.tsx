import { useState } from "react";

import Button from "@/components/Button";
import { authFetch } from "@/lib/apiFetch";
import { API } from "@/lib/apiBase";
import { t } from "@/i18n";

export default function ScoringAuditWidget() {
  const [testId, setTestId] = useState("");
  const [report, setReport] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const runAudit = async () => {
    if (!testId.trim() || loading) return;

    setLoading(true);
    setErr("");
    setCopied(false);
    try {
      const res = await authFetch(`${API}/admin/scoring-audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test_id: Number(testId) }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(payload?.error || t("scoringAuditLoadError"));
      }
      setReport(payload?.report || "");
    } catch (error: any) {
      setReport("");
      setErr(error?.message || t("scoringAuditLoadError"));
    } finally {
      setLoading(false);
    }
  };

  const copyReport = async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setErr(t("scoringAuditCopyError"));
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm leading-6 text-slate-600">{t("scoringAuditHelp")}</p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="number"
          min="1"
          value={testId}
          onChange={(e) => setTestId(e.target.value)}
          placeholder={t("scoringAuditTestIdPlaceholder")}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
        />
        <Button onClick={runAudit} disabled={!testId.trim() || loading} className="sm:min-w-[13rem]">
          {loading ? t("scoringAuditRunning") : t("scoringAuditRun")}
        </Button>
      </div>

      {err && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      )}

      {report && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-medium text-slate-700">{t("scoringAuditResultTitle")}</div>
            <Button onClick={copyReport} variant="secondary" size="sm" className="border-slate-200 text-slate-700">
              {copied ? t("scoringAuditCopied") : t("scoringAuditCopy")}
            </Button>
          </div>
          <pre className="max-h-[34rem] overflow-auto rounded-2xl border border-slate-200 bg-slate-950 px-4 py-4 text-xs leading-6 text-slate-100 shadow-inner">
            {report}
          </pre>
        </div>
      )}
    </div>
  );
}
