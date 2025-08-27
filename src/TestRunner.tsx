import { useEffect, useMemo, useState } from "react";
import Button from "./components/Button";
import { API } from "./lib/apiBase";

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

export default function TestRunner({ testId }) {
  const pageSize = usePageSize();
  const [offset, setOffset] = useState(0);
  const [items, setItems] = useState([]);     // [{position,item_id,text,reverse_scored}]
  const [total, setTotal] = useState(null);   // valgfritt om API returnerer total
  const [answers, setAnswers] = useState({}); // { position: 0..6 }
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // last side
  useEffect(() => {
    let abort = false;
    (async () => {
      setLoading(true); setError("");
      try {
	const testId = 1;
        const params = new URLSearchParams({ offset, limit: pageSize });
        const r = await fetch(`${API}/tests/${testId}/items?` + params.toString(), {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        if (!r.ok) throw new Error("Kunne ikke hente spørsmål");
        const data = await r.json(); // forventer { items: [...], total?: number }
        if (!abort) {
          setItems(data.items || []);
          if (data.total != null) setTotal(data.total);
        }
      } catch (e) {
        if (!abort) setError(e.message || "Feil ved henting.");
      } finally {
        if (!abort) setLoading(false);
      }
    })();
    return () => { abort = true; };
  }, [testId, offset, pageSize]);

  const pageAnswered = useMemo(() => {
    // alle posisjoner på siden har valgt score?
    const need = items.map(it => it.position);
    return need.length > 0 && need.every(p => answers[p] != null);
  }, [items, answers]);

  async function savePage() {
    setSending(true); setError("");
    try {
      const payload = items.map(it => ({
        position: it.position,
        item_id: it.item_id,
        score: answers[it.position], // 0..6 vi lagrer direkte
      }));
      await fetch(`${API}/tests/${testId}/responses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      }).then(r => { if (!r.ok) throw new Error("Klarte ikke å lagre svar"); });
    } catch (e) {
      setError(e.message || "Feil ved lagring.");
      throw e;
    } finally {
      setSending(false);
    }
  }

  async function next() {
    await savePage();
    setOffset(offset + pageSize);
  }
  async function prev() {
    await savePage();
    setOffset(Math.max(0, offset - pageSize));
  }
  async function finish() {
    await savePage();
    await fetch(`${API}/tests/${testId}/complete`, {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    // naviger til “takk”-side eller dashboard
    window.location.assign("/dashboard");
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-3">IPIP-NEO</h1>

      {error && <div className="mb-3 text-sm text-red-700">{error}</div>}
      {loading ? <p>Laster…</p> : (
        <>
          <ul className="space-y-6">
            {items.map((it) => (
              <li key={it.position} className="rounded-lg border p-4">
                <div className="mb-3 font-medium">
                  {it.position}. {it.text}
                </div>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 7 }, (_, v) => (
                    <button
                      key={v}
                      type="button"
                      className={
                        "px-3 py-1 rounded border " +
                        (answers[it.position] === v ? "bg-sky-600 text-white" : "bg-white")
                      }
                      onClick={() => setAnswers(a => ({ ...a, [it.position]: v }))}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                <div className="mt-1 text-xs text-gray-500">0 = helt uenig · 6 = helt enig</div>
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

            {offset + pageSize >= (total ?? Infinity)
              ? <Button type="button" disabled={sending || !pageAnswered} onClick={finish}>Fullfør</Button>
              : <Button type="button" disabled={sending || !pageAnswered} onClick={next}>Neste</Button>}
          </div>
        </>
      )}
    </div>
  );
}
