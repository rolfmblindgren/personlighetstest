import { useEffect, useState } from "react"
import Button from "@/components/Button"
import { API } from "@/lib/apiBase";
import { authFetch } from "@/lib/apiFetch";

import { t } from "@/i18n"

export default function ImportMyLegacyWidget() {
  const [loading, setLoading] = useState(true)
  const [hasLegacy, setHasLegacy] = useState(false)
  const [count, setCount] = useState(0)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState(null)

  // 1) SJEKK VED OPPSTART
  useEffect(() => {
    async function check() {
      try {
        const resp = await authFetch(`${API}/check-legacy-tests`, {
	  method: "GET",
	  headers: {
	    "Content-Type": "application/json",
	  }
        })
	const data = await resp.json()
        console.log("🔍 Legacy-sjekk resultat:", data)

        setHasLegacy(data.hasLegacy)
        setCount(data.count)
      } catch (err) {
        console.error("⚠️ Feil i check-legacy-tests:", err)
      } finally {
        setLoading(false)
      }
    }
    check()
  }, [])

  // 2) KNAPP: IMPORTER TESTER
  async function doImport() {
    setImporting(true)
    try {
      const resp = await authFetch (`${API}/import-legacy-tests`, {
	method: "POST",             // ← riktig plassering
	headers: {
	  "Content-Type": "application/json",
	}
      })
      const data = await resp.json()
      console.log("📥 Import-resultat:", data)

      console.log("DATA:", data)
      setResult(`${data.imported} tester importert`)
      setHasLegacy(false) // de er nå importert
    } catch (err) {
      console.error("⚠️ Feil under import:", err)
      setResult(t("importError"))
    } finally {
      setImporting(false)
    }
  }

  // 3) SKJUL HELE KOMPONENTEN HVIS DET IKKE FINNES NOE Å HENTE
  if (loading) return null
  if (!hasLegacy) return null

  // 4) VIS BOKS MED KNAPP
  return (
    <div className="space-y-2 bg-yellow-50 p-4 rounded border border-yellow-300">
      <p>
        {t("foundLegacyTests")} {count}.
      </p>
      <Button
        onClick={doImport}
        disabled={importing}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        {importing ? t("importing") + "…" : t("importMyLegacyTests")}
      </Button>

      {result && <p className="text-green-700 text-sm">{result}</p>}
    </div>
  )
}
