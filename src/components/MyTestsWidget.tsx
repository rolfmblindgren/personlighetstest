// src/components/MyTestsWidget.tsx
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { apiFetch } from "@/lib/apiFetch"
import { API } from "@/lib/apiBase"
import { t } from "@/i18n";
type Row = {
  test_id: number; template_name: string;
  answered: number; total_items: number;
  progress: number; status: "not_started"|"in_progress"|"complete";
  links: { continue: string; scores: string };
}

export default function MyTestsWidget(){
  const [rows, setRows] = useState<Row[]|null>(null)
  const [err, setErr] = useState("")
  const nav = useNavigate()

  useEffect(() => { (async ()=>{
    try{
      setErr("");
      const r = await apiFetch(`${API}/my/tests`);
      if(!r.ok) throw new Error("Kunne ikke hente testene dine");
      const j = await r.json(); setRows(j.tests||[]);
    }catch(e:any){ setErr(e.message||"Feil"); }
  })(); }, []);

  if(err) return <div className="text-red-600">{err}</div>
  if(rows===null) return <div className="text-sm text-gray-500">Laster…</div>

  if(!rows.length) return (
    <div className="text-center p-6">
      <div className="text-gray-700 mb-2">Du har ingen tester ennå.</div>
      <button onClick={()=>nav("/tests")}
              className="px-4 py-2 rounded bg-emerald-500 text-white hover:bg-emerald-600">
        Start en ny test
      </button>
    </div>
  )

  const Badge = ({s}:{s:Row["status"]})=>{
    const m:any = {
      not_started: "bg-gray-100 text-gray-700",
      in_progress: "bg-yellow-100 text-yellow-800",
      complete:    "bg-green-100 text-green-800",
    }
    const res = s==="not_started"?"ikke startet":s==="in_progress"?"pågår":"complete"
    return <span className={`px-2 py-1 rounded text-xs font-medium ${m[s]}`}>{t(res)}</span>
  }

  return (
    <div className="space-y-3">
      {rows.map(tt=>(
        <div key={tt.test_id} className="border rounded p-3 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="font-medium truncate">{tt.template_name}</div>
            <div className="text-xs text-gray-500">{tt.answered}/{tt.total_items} {t('answered',{ lower: true })}</div>
            <div className="mt-2 h-2 bg-gray-100 rounded">
              <div className="h-2 bg-emerald-500 rounded" style={{width:`${Math.round(tt.progress*100)}%`}}/>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Badge s={tt.status}/>
            {tt.status==="complete" ? (
              <button onClick={()=>nav(tt.links.scores)}
                      className="px-3 py-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-800">
                {t('displayScores')}
              </button>
            ) : (
              <button onClick={()=>nav(tt.links.continue)}
                      className="px-3 py-2 rounded bg-emerald-500 text-white hover:bg-emerald-600">
                {t('continue')}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
