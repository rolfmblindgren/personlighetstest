// src/pages/ScoresPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { API } from "../lib/apiBase";
import { apiFetch } from "../lib/apiFetch";
import { t } from "@/i18n";
import Spinner from "@/components/Spinner";
import createDOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'
import { H1, H2, H3 } from '@/components/Heading.tsx';


type DomainRow = { domain: string; mean_score: number | string | null; n_items: number };
type FacetRow  = { domain: string; facet: number; mean_score: number | string | null; n_items: number };
type DescriptionRow = { text: string; };

export default function ScoresPage() {
  const [loading, setLoading] = useState(true);

  const { testId } = useParams<{ testId: string }>();
  const [data, setData] = useState<{
    total?: { mean_score: number; n_items: number };
    domains?: DomainRow[];
    facets?: FacetRow[];
    description?: DescriptionRow[];
  }>({});
  const [err, setErr] = useState("");

  const fmt = (v: unknown) => (v == null ? "–" : Number(v).toFixed(2));

  // rekkefølge E A C N O
  const factorOrder: Array<'E'|'A'|'C'|'N'|'O'> = ['E','A','C','N','O'];
  const orderIdx = (d: string) => {
    const i = factorOrder.indexOf(d as any);
    return i === -1 ? 999 : i;
  };

  // navn pr. render (respekterer locale)
  const domainNames: Record<string,string> = {
    A: t('B5A'),
    E: t('B5E'),
    C: t('B5C'),
    N: t('B5N'),
    O: t('B5O'),
  };

  const facetLabel = (domain: string, facetNo: number) => {
    const key = `${domain}${facetNo}` as any; // f.eks. "N4"
    const label = t(key);
    return typeof label === 'string' && label !== key ? label : key;
  };

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
    () => (data.domains ?? []).slice().sort((a,b) => orderIdx(a.domain) - orderIdx(b.domain)),
    [data.domains]
  );
  const facetsSorted = useMemo(
    () => (data.facets ?? []).slice().sort((a,b) =>
      orderIdx(a.domain) - orderIdx(b.domain) || a.facet - b.facet
    ),
    [data.facets]
  );

  const groupedFacets = factorOrder
    .map(dom => ({ domain: dom, items: facetsSorted.filter(f => f.domain === dom) }))
    .filter(g => g.items.length > 0);

  useEffect(() => {
    let abort = false;
    (async () => {
      setLoading(true);
      try {
        const r = await apiFetch(`${API}/tests/${testId}/scores`);
        const j = await r.json();
        if (!abort) setData(j);
      } catch (e) {
        console.error(e);
      } finally {
        if (!abort) setLoading(false);
      }
    })();
    return () => { abort = true };
  }, [testId]);

  if (loading) {
    return (
      <div className="min-h-[50vh] grid place-items-center">
        <Spinner text="Laster skårer …" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <H1 className="text-2xl font-semibold mb-4">
        {t('scoresTitle') || t('scores')}
      </H1>

      {err && <div className="text-red-600 mb-4">{err}</div>}


      {data.total && false && (
        <div className="mb-6 text-sm text-gray-600">
          {(t('totalAnswered') || 'Totalt besvart')}: {data.total.n_items} · {t('tScore') || 'T-skår'} {fmt(data.total.mean_score)}
        </div>
      )}

      <H2 className="text-xl font-medium mt-4 mb-2">
        {t('domainsHeading') || 'Domener'}
      </H2>
      <table className="w-full text-sm mb-8 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-2 text-left">{t('domain') || 'Faktor'}</th>
            <th className="p-2 text-right">{t('tScore') || 'T-skår'}</th>
          </tr>
        </thead>
        <tbody>
          {domainsSorted.map(d => (
            <tr key={d.domain} className="border-t">
              <td className="p-2">{domainNames[d.domain] ?? d.domain}</td>
              <td className="p-2 text-right">{fmt(d.mean_score)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <H2 className="text-xl font-medium mt-4 mb-2">
        {t('facetsHeading') || 'Fasetter'}
      </H2>

      {groupedFacets.map(({ domain, items }) => (
        <div key={domain} className="mb-6">
          <H3 className="text-lg font-semibold mb-2">
            {domainNames[domain] ?? domain}
          </H3>

          <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-2 text-left">{t('facet') || 'Fasett'}</th>
                <th className="p-2 text-right">{t('tScore') || 'T-skår'}</th>
              </tr>
            </thead>
            <tbody>
              {items.map(f => (
                <tr key={`${f.domain}-${f.facet}`} className="border-t">
                  <td className="p-2">{facetLabel(f.domain, f.facet)}</td>
                  <td className="p-2 text-right">{fmt(f.mean_score)}</td>
                </tr>
              ))}
            </tbody>
          </table>
	  <div>
	  </div>

        </div>
      ))}
      <div>

{data.description && data.description.length > 0 && (
  <div className="mb-6 text-base text-gray-800">
    {data.description.map((d, i) => (
      <div
        key={i}
        className="mb-2"
        dangerouslySetInnerHTML={{ __html: d.text }}
      />
    ))}
  </div>
)}
      </div>
    </div>
  );
}
