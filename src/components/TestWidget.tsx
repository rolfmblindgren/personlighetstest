// src/components/TestsWidget.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { API } from "@/lib/apiBase";
import { authFetch } from "@/lib/apiFetch";

type TestRow = {
  id: number;
  template: string;
  created_at: string;
  last_activity_at: string;
  has_scores: boolean;
  progress: { answered: number; total: number; percent: number };
};

type Props = {
  /** Når true: vis bare tallet (for "Aktive tester"-kortet) */
  countOnly?: boolean;
  /** Maks antall rader i listen */
  limit?: number;
};

export default function TestsWidget({ countOnly = false, limit = 5 }: Props) {
  const [rows, setRows] = useState<TestRow[]>([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setErr("");
        setLoading(true);
        const r = await authFetch(`${API}/tests`);
        if (!r.ok) throw new Error("Kunne ikke hente tester");
	const j = await r.json();
	if (alive) {
	  const list = Array.isArray(j) ? j : j.tests;
	  setRows(list || []);
	}


      } catch (e: any) {
        if (alive) setErr(e.message || "Feil");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const count = rows.length;
  const recent = useMemo(() => rows.slice(0, limit), [rows, limit]);

  if (countOnly) {
    return (
      <p className="text-3xl font-bold">
        {loading ? "…" : count}
      </p>
    );
  }

  return (
    <div>
      {err && <div className="text-red-600 mb-3">{err}</div>}
      {loading ? (
        <div className="text-sm text-gray-500">Laster tester …</div>
      ) : rows.length === 0 ? (
        <EmptyState/>
      ) : (
        <div className="space-y-2">
          {recent.map(t => (
            <div key={t.id} className="border rounded p-3 flex items-center justify-between">
              <div className="min-w-0">
                <div className="font-medium truncate">{t.template}</div>
                <div className="text-xs text-gray-500">
                  Sist aktivitet: {new Date(t.last_activity_at).toLocaleString()}
                </div>
                <ProgressBar percent={t.progress.percent} label={`${t.progress.answered}/${t.progress.total}`} />
              </div>
              <div className="ml-3 shrink-0">
                {t.progress.answered < t.progress.total ? (
                  <Link to={`/tests/${t.id}`} className="text-blue-600 hover:underline">Fortsett</Link>
                ) : t.has_scores ? (
                  <Link to={`/tests/${t.id}/scores`} className="text-blue-600 hover:underline">Se skårer</Link>
                ) : (
                  <span className="text-gray-500 text-sm">Ingen skårer</span>
                )}
              </div>
            </div>
          ))}
          {rows.length > limit && (
            <div className="text-right">
              <Link to="/tests" className="text-sm text-blue-600 hover:underline">Vis alle</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProgressBar({ percent, label }: { percent: number; label?: string }) {
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="h-2 w-28 bg-gray-200 rounded">
        <div className="h-2 bg-emerald-500 rounded" style={{ width: `${percent}%` }} />
      </div>
      <span className="text-xs text-gray-600">{label}</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border rounded p-6 text-center text-gray-600">
      <p>Du har ingen tester ennå.</p>
      <div className="mt-3">
        <Link to="/tests" className="text-blue-600 hover:underline">
          Start en ny test
        </Link>
      </div>
    </div>
  );
}
