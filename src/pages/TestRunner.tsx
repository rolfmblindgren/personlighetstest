import { useEffect, useMemo, useState } from "react";
import Button from "@/components/Button";
import { API } from "@/lib/apiBase";
import LikertRowText from "@/components/LikertRow";
import { authFetch } from "@/lib/apiFetch";
import { useNavigate, useParams } from "react-router-dom";

// Hook: velg side-størrelse etter bredde
function usePageSize() {
  const calc = () => (window.matchMedia("(min-width: 640px)").matches ? 10 : 1);
  const [size, setSize] = useState(calc);
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 640px)");
    const onChange = () => setSize(calc());
    mql.addEventListener("change", onChange);
    window.addEventListener("orientationchange", onChange);
    return () => {
      mql.removeEventListener("change", onChange);
      window.removeEventListener("orientationchange", onChange);
    };
  }, []);
  return size;
}

function handleAnswer(position: number, itemId: number, score: number) {
  setAnswers(a => {
    const newAnswers = { ...a, [position]: score };

    // lokal lagring
    localStorage.setItem(`test:${testId}:answers`, JSON.stringify(newAnswers));

    return newAnswers;
  });
  // sende til server
  saveOne(position, itemId, score);
}

export default function TestRunner({  }) {
  const pageSize = usePageSize();
  const [offset, setOffset]   = useState(0);
  const [items, setItems]     = useState<Array<{position:number; item_id:number; text:string; score:number|null}>>([]);
  const [total, setTotal]     = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError]     = useState("");

  const { testId: testIdParam } = useParams();

  const navigate = useNavigate();

  const testId = Number(testIdParam); // -> 2 i /testrunner/2

  if (!Number.isFinite(testId)) {
    return <div>Ingen rute matchet</div>;
  }

  async function saveOne(position: number, itemId: number, score: number) {
    await authFetch(`${API}/tests/${testId}/responses`, {
      method: "POST",
      headers: {
	"Content-Type": "application/json",
      },
      body: JSON.stringify([{ position, item_id: itemId, score }]) // server kan upserte batchet
    });
  }

  // last side
  useEffect(() => {
    let abort = false;
    (async () => {
      setLoading(true); setError("");
      try {
        const params = new URLSearchParams({ offset: String(offset), limit: String(pageSize) });
        const r = await authFetch(`${API}/tests/${testId}/items?` + params.toString(), {
        });
        if (!r.ok) throw new Error("Kunne ikke hente spørsmål");
        const data = await r.json();
        if (abort) return;

        setItems((data.items || []).map((x:any)=>({ ...x, score: x.score ?? null })));
        if (data.total != null) setTotal(data.total);

        // prefill answers for denne siden
        const pageAns: Record<number, number|null> = {};
        for (const it of data.items || []) pageAns[it.position] = it.score ?? null;
        setAnswers(prev => ({ ...prev, ...pageAns }));
      } catch (e:any) {
        if (!abort) setError(e.message || "Feil ved henting.");
      } finally {
        if (!abort) setLoading(false);
      }
    })();
    return () => { abort = true; };
  }, [testId, offset, pageSize]);


  const pageAnswered = useMemo(() => {
    const need = items.map(it => it.position);
    return need.length > 0 && need.every(p => answers[p] != null);
  }, [items, answers]);


  async function savePage() {
    setSending(true);
    setError("");
    try {
      // Only send items that are on this page and that actually have an answer
      const payload = items
	.map(it => {
        const score = answers[it.position];
        if (score == null) return null;
        return { position: it.position, item_id: it.item_id, score };
      })
	.filter(Boolean);

      // If nothing changed on this page, skip saving
      if (payload.length === 0) {
	return;
      }

      const r = await authFetch(`${API}/tests/${testId}/responses`, {
	method: "POST",
	headers: {
          "Content-Type": "application/json",
	},
	body: JSON.stringify(payload),
      });

      // Read body *even on error* so we can show the backend message
      const respText = await r.text().catch(() => "");
      if (!r.ok) {
	throw new Error(
          `Lagre feilet (${r.status} ${r.statusText})${respText ? `: ${respText}` : ""}`
	);
      }
      // Optionally: console.log payload + server reply
      // console.debug("Saved:", payload, respText);

    } catch (e: any) {
      setError(e?.message || "Feil ved lagring.");
      throw e;
    } finally {
      setSending(false);
    }
  }

  async function next()   { await savePage(); setOffset(offset + pageSize); }
  async function prev()   { await savePage(); setOffset(Math.max(0, offset - pageSize)); }

  async function finish() {
    await savePage();
    setSending(true);
    setError("");

    try {
      const r = await authFetch (`${API}/tests/${testId}/complete`, {
	method: "POST",
      });

      if (!r.ok) {
	const d = await r.json().catch(() => ({}));
	throw new Error(d.error || "Kunne ikke fullføre testen");
      }

      // test fullført OK → gå videre til donasjonsside
      navigate(`/test/${testId}/donate`);
    } catch (e: any) {
      setError(e.message || "Feil ved fullføring");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-3">IPIP-NEO</h1>

      {error && <div className="mb-3 text-sm text-red-700">{error}</div>}
      {loading ? <p>Laster…</p> : (
        <>
          <ul className="space-y-6">
            {items.map((it) => (
              <li key={it.position}>
                <div className="mb-3 font-medium">
                  {it.text}
                </div>

                {/* Likert-rad med labels uten tall */}
                <LikertRowText
                  question=""
                  value={answers[it.position] ?? null}
                  onChange={(v) => setAnswers(a => ({ ...a, [it.position]: v }))}
                />
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center justify-between">
            <Button type="button" disabled={sending || offset === 0} onClick={prev}>
										      Forrige
            </Button>

            <div className="text-sm text-gray-600">
              {total
                ? `${Math.min(offset + items.length, total)} / ${total}`
                : `Spørsmål ${items[0]?.position ?? "?"}–${items[items.length-1]?.position ?? "?"}`}
            </div>

            {total && offset + pageSize >= total
              ? <Button type="button" disabled={sending || !pageAnswered} onClick={finish}>Fullfør</Button>
              : <Button type="button" disabled={sending || !pageAnswered} onClick={next}>Neste</Button>}
          </div>
        </>
      )}
    </div>
  );
}
