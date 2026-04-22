// src/pages/ScoresPage.tsx
import { Fragment, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { API } from "../lib/apiBase";
import { authFetch } from "../lib/apiFetch";
import { translate } from "@/i18n";
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
    const s = tr(key);
    return typeof s === "string" && s !== key ? s : "";
  };

  const facetDesc = (domain: string, facetNo: number) => {
    const key = `desc_${domain}${facetNo}` as any; // f.eks. "desc_N4"
    const s = tr(key);
    return typeof s === "string" && s !== key ? s : "";
  };

  const [loading, setLoading] = useState(true);

  const { testId } = useParams<{ testId: string }>();
  const [data, setData] = useState<{
    test_lang?: string;
    subject_name?: string;
    subject_email?: string;
    is_invited_test?: boolean;
    norm_sex?: string | null;
    stored_norm_sex?: string | null;
    norm_is_override?: boolean;
    norm_age?: number | null;
    total?: { mean_score: number; n_items: number };
    domains?: DomainRow[];
    facets?: FacetRow[];
    narrative?: NarrativeRow[];
  }>({});
  const [err, setErr] = useState("");
  const [isDownloadingReport, setIsDownloadingReport] = useState(false);
  const [isEmailingReport, setIsEmailingReport] = useState(false);
  const [reportErr, setReportErr] = useState("");
  const [reportMsg, setReportMsg] = useState("");
  const [selectedNormSex, setSelectedNormSex] = useState("");
  const pageLang = data.test_lang || lang || "nb";
  const reportLang = pageLang;

  const tr = (
    key: string,
    fallback?: string,
    options?: { lower?: boolean; upper?: boolean }
  ) => {
    const text = translate(pageLang, key, options);
    return typeof text === "string" && !text.startsWith("⚠️")
      ? text
      : (fallback ?? text);
  };

  const fmt = (v: unknown) => (v == null ? "–" : Number(v).toFixed(0));
  const normLabel = (value?: string | null) => {
    if (value === "mann") return tr("normMan", "Mannsnorm");
    if (value === "kvinne") return tr("normWoman", "Kvinnenorm");
    return tr("normCommon", "Felles norm");
  };
  const effectiveNormSex = selectedNormSex || data.norm_sex || "unspecified";
  const normQuery = () => {
    const params = new URLSearchParams();
    params.set("norm_sex", effectiveNormSex);
    return params.toString();
  };

  // rekkefølge E A C N O
  const factorOrder: Array<'E'|'A'|'C'|'N'|'O'> = ['E','A','C','N','O'];
  const orderIdx = (d: string) => {
    const i = factorOrder.indexOf(d as any);
    return i === -1 ? 999 : i;
  };

  // navn pr. render (følger testens språk)
  const domainNames: Record<string,string> = {
    A: tr('B5A', 'Medmenneskelighet'),
    E: tr('B5E', 'Ekstroversjon'),
    C: tr('B5C', 'Planmessighet'),
    N: tr('B5N', 'Nevrotisisme'),
    O: tr('B5O', 'Åpenhet for erfaringer'),
  };

  const { profile } = useGetProfile();

  const facetLabel = (domain: string, facetNo: number) => {
    const key = `${domain}${facetNo}` as any; // f.eks. "N4"
    const label = tr(key);
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
	        const params = new URLSearchParams();
	        if (selectedNormSex) params.set("norm_sex", selectedNormSex);
	        const suffix = params.toString() ? `?${params.toString()}` : "";
		const r = await authFetch(`${API}/tests/${testId}/scores${suffix}`);
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
  }, [testId, selectedNormSex]);

  const downloadReport = async () => {
    if (!testId || isDownloadingReport) return;

    setIsDownloadingReport(true);
    setReportErr("");
    setReportMsg("");

    try {
	      const r = await authFetch(`${API}/tests/${testId}/${reportLang}/report.pdf?${normQuery()}`);
      if (!r.ok) {
        let message = tr('couldNotDownloadReport', 'Kunne ikke laste ned rapport');
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
      setReportErr(e?.message || tr('couldNotDownloadReport', 'Kunne ikke laste ned rapport'));
    } finally {
      setIsDownloadingReport(false);
    }
  };

  const emailReport = async () => {
    if (!testId || isEmailingReport) return;

    setIsEmailingReport(true);
    setReportErr("");
    setReportMsg("");

    try {
	      const r = await authFetch(`${API}/tests/${testId}/${reportLang}/report-email?${normQuery()}`, {
        method: 'POST',
      });
      let payload: any = null;
      try {
        payload = await r.json();
      } catch {
        payload = null;
      }

      if (!r.ok) {
        const message = payload?.error || tr('couldNotEmailReport', 'Kunne ikke sende rapporten på e-post');
        throw new Error(message);
      }

      const email = payload?.email;
      setReportMsg(
        email
          ? `${tr('reportEmailSentTo', 'Rapporten ble sendt til')} ${email}`
          : tr('reportEmailSent', 'Rapporten ble sendt på e-post.')
      );
    } catch (e: any) {
      setReportErr(e?.message || tr('couldNotEmailReport', 'Kunne ikke sende rapporten på e-post'));
    } finally {
      setIsEmailingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] grid place-items-center">
        <Spinner text={tr('loadingScores', 'Laster skårer …')} />
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
            ? tr('isPreparingReport', 'Lager rapport …')
            : tr('downloadReportPdf', 'Last ned rapport (PDF)')}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={emailReport}
          disabled={isEmailingReport || !testId}
        >
          {isEmailingReport
            ? tr('isEmailingReport', 'Sender rapport …')
            : tr('emailReportPdf', 'Mail rapport')}
        </Button>
      </div>

      <H1 className="text-2xl font-semibold mb-4">
        {tr('scoresTitle', tr('scores', 'Resultater'))}
			{' '}
			{data.subject_name || profile?.navn || data.subject_email || ""}
      </H1>

      <div className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
        <label className="mb-1 block text-sm font-medium text-slate-700">
          {tr("normBasis", "Normgrunnlag")}
        </label>
        <select
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
          value={effectiveNormSex}
          onChange={(event) => {
            setReportErr("");
            setReportMsg("");
            setSelectedNormSex(event.target.value);
          }}
        >
          <option value="unspecified">{tr("normCommon", "Felles norm")}</option>
          <option value="mann">{tr("normMan", "Mannsnorm")}</option>
          <option value="kvinne">{tr("normWoman", "Kvinnenorm")}</option>
        </select>
        <p className="mt-2 text-xs text-slate-500">
          {tr("normBasisHelp", "Velg hvilket normgrunnlag skårene skal sammenlignes med.")}
        </p>
      </div>

      <div className="mb-4 text-sm text-slate-500">
        {tr("normBasis", "Normgrunnlag")}: {normLabel(data.norm_sex)}
        {data.norm_age != null ? ` · ${tr("age", "Alder")}: ${data.norm_age}` : ""}
      </div>

      {err && <div className="text-red-600 mb-4">{err}</div>}
      {reportErr && <div className="text-red-600 mb-4">{reportErr}</div>}
      {reportMsg && <div className="text-green-700 mb-4">{reportMsg}</div>}


      {data.total && false && (
        <div className="mb-6 text-sm text-gray-600">
          {tr('totalAnswered', 'Totalt besvart')}: {data.total.n_items} · {tr('tScore', 'T-skår')} {fmt(data.total.mean_score)}
        </div>
      )}

      <H2 className="text-xl font-medium mt-4 mb-2">
        {tr('domainsHeading', 'Domener')}
      </H2>
      <table className="w-full text-sm mb-8 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-2 text-left">{tr('domain', 'Faktor')}</th>
            <th className="p-2 text-right">{tr('tScore', 'T-skår')}</th>
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
        {tr('facetsHeading', 'Fasetter')}
      </H2>

      {groupedFacets.map(({ domain, items }) => (
        <div key={domain} className="mb-6">
          <H3 className="text-lg font-semibold mb-2">
            {domainNames[domain] ?? domain}
          </H3>

          <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-2 text-left">{tr('facet', 'Fasett')}</th>
                <th className="p-2 text-right">{tr('tScore', 'T-skår')}</th>
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
	    {tr('generatesNarrative', 'Lager tekstlig tolkning …')}
	  </p>
	</div>
      )}

    </div>
  );
}
