import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/Button";
import { API } from "@/lib/apiBase";
import { authFetch } from "@/lib/apiFetch";
import { t as tr } from "@/i18n";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useAuth } from "@/context/AuthContext";  // 👈 ny

export default function TestPicker() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [openTests, setOpenTests] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {

        const [tplRes, myRes] = await Promise.all([
          authFetch (`${API}/test-templates`),
          authFetch (`${API}/tests?status=open`),
        ]);
        if (!tplRes.ok || !myRes.ok) throw new Error("Kunne ikke hente lister");
        setTemplates(await tplRes.json());
        const data = await myRes.json();
        setOpenTests(data.items || []);
      } catch (e) {
        setErr(e.message || "Nettverksfeil");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function startTest(template,lang) {
    try {
      const r = await authFetch(`${API}/tests`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
	  template_id: template.id,
	  language: lang,
	}),
      });
      if (!r.ok) throw new Error("Kunne ikke starte test");
      const { test_id } = await r.json();
      nav(`/testrunner/${test_id}`);
    } catch (e) {
      setErr(e.message || "Klarte ikke å starte test");
    }
  }

  const handleStart = (tpl) => {
    const lang = localStorage.getItem("testLanguage") || "nb"
    startTest(tpl, lang)
  }

  if (loading) return <p>Laster…</p>;
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-semibold">Velg test</h1>
      {err && <div className="text-red-700">{err}</div>}

      {openTests.length > 0 && (
        <section>
          <h2 className="text-xl font-medium mb-3">Fortsett test</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {openTests.map(t => (
              <div key={t.id} className="rounded-xl border p-4">
                <div className="font-medium">{t.template_title}</div>
                <div className="text-sm text-gray-600">
							 Startet {new Date(t.started_at).toLocaleString()} · {t.progress}% {tr('answered')}
                </div>
                <Button className="mt-3" onClick={() => nav(`/testrunner/${t.id}`)}>Fortsett</Button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-medium mb-3">{tr('startNewTest')}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {templates.map(tpl => (
            <div key={tpl.id} className="rounded-xl border p-4">
              <div className="font-medium">{tpl.title}</div>
              {tpl.desc &&
		<div className="text-sm text-gray-600">{tpl.desc}</div>}

	      <div className="flex flex-col items-start">
		<div className="flex items-center gap-3 mt-3">
		  <Button className="grid grid-cols-[auto_auto] items-center gap-3 mt-3" onClick={() => handleStart(tpl)}>Start</Button>
		  <LanguageSelector />
		</div>
	      </div>
	    </div>
          ))}
        </div>
      </section>
    </div>
  );
}
