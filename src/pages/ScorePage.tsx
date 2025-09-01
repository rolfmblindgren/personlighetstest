// src/pages/ScoresPage.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API } from "../lib/apiBase";
import { apiFetch } from "../lib/apiFetch";

type DomainRow = {
  domain: string; mean_score: number | string | null;
  n_items: number };
type FacetRow  = {
  domain: string; facet: number; mean_score: number | string | null;
  n_items: number };


export default function ScoresPage() {
  const { testId } = useParams<{ testId: string }>();
  const [data, setData] = useState<{
    total?: { mean_score: number; n_items: number };
    domains?: DomainRow[];
    facets?: FacetRow[];
  }>({});
  const [err, setErr] = useState("");

  const fmt = (v: unknown) =>
    v == null ? "–" : Number(v).toFixed(2);
  const num = (v: unknown) => (v == null ? null : Number(v));


  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        setErr("");
        const r = await apiFetch(`${API}/tests/${testId}/scores`);
        if (!r.ok) throw new Error("Kunne ikke hente skårer");
        const j = await r.json();
        if (!abort) setData(j);
      } catch (e: any) {
        if (!abort) setErr(e.message || "Feil");
      }
    })();
    return () => { abort = true; };
  }, [testId]);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Skårer</h1>
      {err && <div className="text-red-600 mb-4">{err}</div>}

      {data.total && (
        <div className="mb-6 text-sm text-gray-600">
          Totalt besvart: {data.total.n_items} · Gjennomsnitt:{" "}
          {data.total.mean_score?.toFixed(2)}
        </div>
      )}

      <h2 className="text-xl font-medium mt-4 mb-2">Domener (N, E, O, A, C)</h2>
      <table className="w-full border text-sm mb-8">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-2 text-left">Domene</th>
            <th className="p-2 text-right">Gj.snitt</th>
            <th className="p-2 text-right">Antall</th>
          </tr>
        </thead>
        <tbody>
          {(data.domains || []).map((d) => (
            <tr key={d.domain} className="border-t">
              <td className="p-2">{d.domain}</td>
              <td className="p-2 text-right">{num(d.mean_score)?.toFixed(2) && "-"}</td>
              <td className="p-2 text-right">{d.n_items}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-xl font-medium mt-4 mb-2">Fasetter (1–6 pr domene)</h2>
      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-2 text-left">Domene</th>
            <th className="p-2 text-right">Fasett</th>
            <th className="p-2 text-right">Gj.snitt</th>
            <th className="p-2 text-right">Antall</th>
          </tr>
        </thead>
        <tbody>
          {(data.facets || []).map((f) => (
            <tr key={`${f.domain}-${f.facet}`} className="border-t">
              <td className="p-2">{f.domain}</td>
              <td className="p-2 text-right">{f.facet}</td>
              <td className="p-2 text-right">{num(f.mean_score)?.toFixed(2) && "-"}</td>
              <td className="p-2 text-right">{f.n_items}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
