import { useEffect, useState } from "react";
import { API } from "@/lib/apiBase";

export default function UsersWidget() {
  const [count, setCount] = useState(null);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    try {
      const r = await fetch(`${API}/stats`, { credentials: "omit" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      setCount(data.users);
    } catch (e) {
      setErr("Kunne ikke hente antall brukere.");
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 15000); // oppdater hvert 15. sekund (valgfritt)
    return () => clearInterval(id);
  }, []);

  return (
    <div className="rounded-xl border-0 p-0">

      <div className="text-3xl font-semibold">
        {count === null ? "…" : count}
      </div>
      {err && <div className="mt-1 text-xs text-red-600">{err}</div>}
    </div>
  );
}
