// VerifyEmail.tsx
import { useEffect, useState } from "react";
import { API } from "./lib/apiBase";
import Button from "./components/Button";

export default function VerifyEmail() {
  const [state, setState] = useState<"pending"|"ok"|"expired"|"invalid"|"error">("pending");
  const [msg, setMsg] = useState("");
  const token = new URLSearchParams(location.search).get("token") || "";

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API}/verify_email?token=${encodeURIComponent(token)}`);
        const data = await r.json().catch(() => ({}));
        if (r.ok) { setState("ok"); setMsg(data.message || "E-post bekreftet!"); }
        else if (r.status === 410) { setState("expired"); setMsg(data.error || "Lenken er utløpt."); }
        else if (r.status === 400) { setState("invalid"); setMsg(data.error || "Ugyldig lenke."); }
        else { setState("error"); setMsg(data.error || "Noe gikk galt."); }
      } catch {
        setState("error"); setMsg("Fikk ikke kontakt med serveren.");
      }
    })();
  }, [token]);

  const resend = async () => {
    try {
      await fetch(`${API}/resend_verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      });
      setMsg("Hvis adressen er gyldig, er en ny e-post sendt.");
    } catch {
      setMsg("Klarte ikke sende på nytt akkurat nå.");
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl p-6 mt-10 shadow">
      {state === "pending" && <p>Laster…</p>}
      {state === "ok" && (
        <>
          <h1 className="text-2xl font-semibold mb-2">E-post bekreftet ✅</h1>
          <p className="mb-4">{msg}</p>
          <a href="/" className="underline">Gå til innlogging</a>
        </>
      )}
      {state === "expired" && (
        <>
          <h1 className="text-2xl font-semibold mb-2">Lenken er utløpt</h1>
          <p className="mb-4">{msg}</p>
          <Button onClick={resend}>Send ny bekreftelse</Button>
        </>
      )}
      {state === "invalid" && <p>{msg}</p>}
      {state === "error" && <p>{msg}</p>}
    </div>
  );
}
