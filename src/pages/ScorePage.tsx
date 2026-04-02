// src/pages/ScoresPage.tsx
import { Fragment, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { API } from "../lib/apiBase";
import { authFetch } from "../lib/apiFetch";
import { t } from "@/i18n";
import Spinner from "@/components/Spinner";
import { H1, H2, H3 } from '@/components/Heading';
import Narrative  from '@/components/Narrative';
import { useGetProfile }  from '@/hooks/useGetProfile';
import { useLang } from '@/i18n/hooks';
import PrintButton from '@/components/PrintButton.tsx';
import Button from '@/components/Button';
import cap from '@/lib/cap';

type DomainRow = { domain: string; mean_score: number | string | null; n_items: number };

type FacetRow  = { domain: string; facet: number; mean_score: number | string | null; n_items: number };
type NarrativeRow = { text_md: string };

type OpenKind = "domain" | "facet";
type OpenKey = `${OpenKind}:${string}`;


export default function ScoresPage() {
  const lang = useLang();

  const [open, setOpen] = useState<Set<OpenKey>>(() => new Set());
  const toggle = (k: OpenKey) => {
    setOpen(prev => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  };

  const domainDesc = (domain: string) => {
    const key = `desc_${domain}` as any; // f.eks. "desc_E"
    const s = t(key);
    return typeof s === "string" && s !== key ? s : "";
  };

  const facetDesc = (domain: string, facetNo: number) => {
    const key = `desc_${domain}${facetNo}` as any; // f.eks. "desc_N4"
    const s = t(key);
    return typeof s === "string" && s !== key ? s : "";
  };

  const [loading, setLoading] = useState(true);

  const { testId } = useParams<{ testId: string }>();
  const [data, setData] = useState<{
    total?: { mean_score: number; n_items: number };
    domains?: DomainRow[];
    facets?: FacetRow[];
    narrative?: NarrativeRow[];
  }>({});
  const [err, setErr] = useState("");
  const [isDownloadingReport, setIsDownloadingReport] = useState(false);
  const [reportErr, setReportErr] = useState("");

  const fmt = (v: unknown) => (v == null ? "–" : Number(v).toFixed(0));

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

  const { profile } = useGetProfile();

  const facetLabel = (domain: string, facetNo: number) => {
    const key = `${domain}${facetNo}` as any; // f.eks. "N4"
    const label = t(key);
    return typeof label === 'string' && label !== key ? label : key;
  };

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
      setErr("");

      try {
	const r = await authFetch(`${API}/tests/${testId}/scores`);
	if (!r.ok) throw new Error("Kunne ikke hente skårer");

	const j = await r.json();
	if (!abort) setData(j);

      } catch (e: any) {
	if (!abort) setErr(e.message || "Feil");
      } finally {
	if (!abort) setLoading(false);
      }
    })();

    return () => { abort = true };
  }, [testId]);

  const downloadReport = async () => {
    if (!testId || isDownloadingReport) return;

    setIsDownloadingReport(true);
    setReportErr("");

    try {
      const r = await authFetch(`${API}/tests/${testId}/${lang}/report.pdf`);
      if (!r.ok) {
        let message = t('couldNotDownloadReport') || 'Kunne ikke laste ned rapport';
        try {
          const payload = await r.json();
          if (payload?.error) message = payload.error;
        } catch {
          // behold standardmeldingen hvis responsen ikke er JSON
        }
        throw new Error(message);
      }

      const blob = await r.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `rapport-${testId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch (e: any) {
      setReportErr(e?.message || (t('couldNotDownloadReport') || 'Kunne ikke laste ned rapport'));
    } finally {
      setIsDownloadingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] grid place-items-center">
        <Spinner text="Laster skårer …" />
      </div>
    );
  }


  return (

    <div className="max-w-3xl mx-auto p-4">

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <PrintButton />
        <Button
          variant="secondary"
          size="sm"
          onClick={downloadReport}
          disabled={isDownloadingReport || !testId}
        >
          {isDownloadingReport
            ? (t('isPreparingReport') || 'Lager rapport …')
            : (t('downloadReportPdf') || 'Last ned rapport (PDF)')}
        </Button>
      </div>

      <H1 className="text-2xl font-semibold mb-4">
        {t('scoresTitle') || t('scores')}
	{' '}
	{profile?.navn ?? ""}
      </H1>

      {err && <div className="text-red-600 mb-4">{err}</div>}
      {reportErr && <div className="text-red-600 mb-4">{reportErr}</div>}


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
	  {domainsSorted.map(d => {
	    const desc = domainDesc(d.domain);
	    const k: OpenKey = `domain:${d.domain}`;
	    const isOpen = open.has(k);

	    return (
	      <Fragment key={d.domain}>
		<tr className="border-t">
		  <td className="p-2">
		    <button
		      type="button"
		      onClick={() => desc && toggle(k)}
		      className={`w-full text-left flex items-center justify-between gap-2 ${
			desc ? "cursor-pointer" : "cursor-default"
		      }`}
		      aria-expanded={desc ? isOpen : undefined}
		      aria-controls={desc ? `desc-${k}` : undefined}
		    >
		      <span>{domainNames[d.domain] ?? d.domain}</span>
		      {desc && (
			<span className="text-gray-400 select-none">
			  {isOpen ? "⌃" : "⌄"}
			</span>
		      )}
		    </button>
		  </td>
		  <td className="p-2 text-right">{fmt(cap(d.mean_score))}</td>
		</tr>

		{desc && isOpen && (
		  <tr className="border-t bg-gray-50/50">
		    <td colSpan={2} className="p-3">
		      <div id={`desc-${k}`} className="text-sm text-gray-700 leading-relaxed">
			{desc}
		      </div>
		    </td>
		  </tr>
		)}
	      </Fragment>
	    );
	  })}
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
	      {items.map(f => {
		const desc = facetDesc(f.domain, f.facet);
		const rowId = `${f.domain}-${f.facet}`;
		const k: OpenKey = `facet:${rowId}`;
		const isOpen = open.has(k);

		return (
		  <Fragment key={rowId}>
		    <tr className="border-t">
		      <td className="p-2">
			<button
			  type="button"
			  onClick={() => desc && toggle(k)}
			  className={`w-full text-left flex items-center justify-between gap-2 ${
			    desc ? "cursor-pointer" : "cursor-default"
			  }`}
			  aria-expanded={desc ? isOpen : undefined}
			  aria-controls={desc ? `desc-${k}` : undefined}
			>
			  <span>{facetLabel(f.domain, f.facet)}</span>
			  {desc && (
			    <span className="text-gray-400 select-none">
			      {isOpen ? "⌃" : "⌄"}
			    </span>
			  )}
			</button>
		      </td>
		      <td className="p-2 text-right">{fmt(cap(f.mean_score))}</td>
		    </tr>

		    {desc && isOpen && (
		      <tr className="border-t bg-gray-50/50">
			<td colSpan={2} className="p-3">
			  <div id={`desc-${k}`} className="text-sm text-gray-700 leading-relaxed">
			    {desc}
			  </div>
			</td>
		      </tr>
		    )}
		  </Fragment>
		);
	      })}
	    </tbody>

	  </table>
	  <div>
	  </div>
        </div>
      ))}

      {data.narrative?.[0]?.text_md ? (
	<div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-turkis-100">
	  <Narrative
	    className="prose prose-sm prose-h1:text-turkis-600 dark:prose-invert max-w-none"
	    text={data.narrative[0].text_md}
	  />
	</div>
      ) : (
	<div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-turkis-100 opacity-60">
	  <p className="italic">
	    {t('generatesNarrative')}
	  </p>
	</div>
      )}

    </div>
  );
}
