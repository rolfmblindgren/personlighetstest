import { useEffect, useState } from "react";
import Button from "@/components/Button";
import { API } from "@/lib/apiBase";
import { authFetch } from "@/lib/apiFetch";
import { t } from "@/i18n";
import { useLegacyImport } from "@/context/LegacyImportContext";

export default function ImportMyLegacyWidget() {
  const [loading, setLoading] = useState(true);
  const [hasLegacy, setHasLegacy] = useState(false);
  const [count, setCount] = useState(0);
  const [result, setResult] = useState(null);

  const { isImporting, setIsImporting } = useLegacyImport();

  // 1) Sjekk ved side-last
  useEffect(() => {
    async function check() {
      try {


        const res = await authFetch(`${API}/check-legacy-tests`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

	const data = await res.json();

	console.log(data.hasLegacy)

        setHasLegacy(data.hasLegacy);
        setCount(data.count);



      } catch (err) {
        console.error("⚠️ Feil i check-legacy-tests:", err);
      } finally {
        setLoading(false);
      }
    }

    check();
  }, [isImporting]);
  // merk: dersom importen fullførte, vil denne hente friske data

  // 2) Import-funksjon
  async function doImport() {
    setIsImporting(true);

    try {
      const resp = await authFetch(`${API}/import-legacy-tests`, {
        method: "POST",
	headers: {
	  "Content-Type": "application/json",
        },
      });

      console.log("HTTP-status:", resp.status);

      const raw = await resp.text();
      console.log("Raw body:", raw);

      let data = {};
      try {
	data = JSON.parse(raw);
      } catch {
	console.warn("Klarte ikke parse JSON");
      }

       if (data.import_complete) {
	 setIsImporting(false);
	 setHasLegacy(false);
       }

      console.log("PARSED:", data);

      setResult(`${data.imported} tester importert`);
      setHasLegacy(false);
    } catch (err) {
      console.error("⚠️ Feil under import:", err);
      setResult(t("importError"));
    } finally {
      setIsImporting(false);
    }
  }

  // 3) Visningslogikk
  if (loading) return null;

  if (!hasLegacy && !isImporting) return (
    <p>Du har ingen gamle tester som du ikke har importert</p>
  )

  return (
    <div className="space-y-2 bg-yellow-50 p-4 rounded border border-yellow-300">


      {isImporting ? (
        <p>{t("importing")}…</p>
      ) : (
        <p>{t("foundLegacyTests")} {count}.</p>
      )}

      {!isImporting && (
        <Button
          onClick={doImport}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          {t("importMyLegacyTests")}
        </Button>
      )}



      {result && <p className="text-green-700 text-sm">{result}</p>}
    </div>
  );
}
