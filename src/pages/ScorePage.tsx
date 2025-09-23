// src/pages/ScoresPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { API } from "../lib/apiBase";
import { apiFetch } from "../lib/apiFetch";
import { t } from "@/i18n";

type DomainRow = { domain: string; mean_score: number | string | null; n_items: number };
type FacetRow  = { domain: string; facet: number; mean_score: number | string | null; n_items: number };

export default function ScoresPage() {
  const { testId } = useParams<{ testId: string }>();
  const [data, setData] = useState<{
    total?: { mean_score: number; n_items: number };
    domains?: DomainRow[];
    facets?: FacetRow[];
  }>({});
  const [err, setErr] = useState("");

  const fmt = (v: unknown) => (v == null ? "–" : Number(v).toFixed(2));

  // Oversettelser hentes ved render (respekterer gjeldende locale)
  const getDomainName = (code: string) => {
    switch (code) {
      case "A": return t("B5A");
      case "E": return t("B5E");
      case "C": return t("B5C");
      case "N": return t("B5N");
      case "O": return t("B5O");
      default:  return code;
    }
  };
  const getFacetName = (domain: string, n: number) => {
    const key = `${domain}${n}`;           // f.eks. "N1"
    const label = t(key as any);
    return (typeof label === "string" && label !== key) ? label : key; // fallback
  };

  // Din foretrukne rekkefølge: E, A, C, N, O
  const order = ["E", "A", "C", "N", "O"];
  const idx   = (d: string) => { const i = order.indexOf(d); return i === -1 ? 999 : i; };

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

  const domainsSorted = useMemo(
    () => (data.domains ?? []).slice().sort((a,b) => idx(a.domain) - idx(b.domain)),
    [data.domains]
  );
  const facetsSorted = useMemo(
    () => (data.facets ?? []).slice().sort((a,b) =>
      idx(a.domain) - idx(b.domain) || a.facet - b.facet
    ),
    [data.facets]
  );

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">{t("scoresTitle") ?? "Skårer"}</h1>
      {err && <div className="text-red-600 mb-4">{err}</div>}

      {data.total && (
        <div className="mb-6 text-sm text-gray-600">
          {(t("totalAnswered") ?? "Totalt besvart")}: {data.total.n_items} · T-skår: {fmt(data.total.mean_score)}
        </div>
      )}

      <h2 className="text-xl font-medium mt-4 mb-2">
        {t("domainsHeading") ?? "Domener (N, E, O, A, C)"}
      </h2>
      <table className="w-full border text-sm mb-8">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-2 text-left">{t("domain") ?? "Domene"}</th>
            <th className="p-2 text-right">{t("tscore") ?? "T-skår"}</th>
          </tr>
        </thead>
        <tbody>
          {domainsSorted.map((d) => (
            <tr key={d.domain} className="border-t">
              <td className="p-2">{getDomainName(d.domain)}</td>
              <td className="p-2 text-right">{fmt(d.mean_score)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-xl font-medium mt-4 mb-2">
        {t("facetsHeading") ?? "Fasetter (1–6 pr domene)"}
      </h2>
      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-2 text-left">{t("domain") ?? "Domene"}</th>
            <th className="p-2 text-left">{t("facet") ?? "Fasett"}</th>
            <th className="p-2 text-right">{t("meanTscore") ?? "Gj.snitt T-skår"}</th>
          </tr>
        </thead>
        <tbody>
          {facetsSorted.map((f) => (
            <tr key={`${f.domain}-${f.facet}`} className="border-t">
              <td className="p-2">{getDomainName(f.domain)}</td>
              <td className="p-2">{getFacetName(f.domain, f.facet)}</td>
              <td className="p-2 text-right">{fmt(f.mean_score)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
