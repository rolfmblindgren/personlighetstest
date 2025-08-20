// src/pages/VerifyEmailPage.tsx
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { API } from "./lib/apiBase";
import Button from "./components/Button";

export default function VerifyEmailPage() {
  const [sp] = useSearchParams();
  const token = sp.get("token") || "";
  const [status, setStatus] = useState<"idle"|"ok"|"expired"|"invalid"|"error">("idle");
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    let aborted = false;

    async function run() {
      if (!token) {
        setStatus("invalid");
        setMsg("Mangler token i lenken.");
        return;
      }
      try {
	const url = `${API}/verify-email?token=${encodeURIComponent(token)}`;
	const res = await fetch(url, { method: "GET" }); // ingen body, ingen headers

        const ct = res.headers.get("content-type") || "";
        let data: any = {};
        try {
          if (ct.includes("application/json")) data = await res.json();
          else data = { error: await res.text() };
        } catch {}

        if (res.ok) {
          setStatus("ok");
          setMsg(data.message || "E-posten er bekreftet. Du kan logge inn.");
        } else if (res.status === 410) {
          setStatus("expired");
          setMsg(data.error || "Lenken er utløpt.");
        } else if (res.status === 400) {
          setStatus("invalid");
          setMsg(data.error || "Ugyldig lenke.");
        } else {
          setStatus("error");
          setMsg(data.error || `Uventet feil (status ${res.status}).`);
        }
      } catch (e) {
        if (!aborted) {
          setStatus("error");
          setMsg("Fikk ikke kontakt med serveren.");
        }
      }
    }

    run();
    return () => { aborted = true; };
  }, [token]);

  // (Valgfritt) "send ny e-post" knapp hvis utløpt
  const [resendBusy, setResendBusy] = useState(false);
  const [resendMsg, setResendMsg] = useState("");
  async function resend() {
    setResendBusy(true);
    setResendMsg("");
    try {
      // Backend må ha /api/resend-verification som tar token eller e-post
      const res = await fetch(`${API}/resend-verification`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      setResendMsg(data.message || (res.ok ? "Ny e-post er sendt." : "Kunne ikke sende på nytt."));
    } catch {
      setResendMsg("Kunne ikke sende på nytt.");
    } finally {
      setResendBusy(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="rounded-2xl shadow-sm bg-white p-6">
        {status === "idle" && <p>Verifiserer…</p>}
        {status === "ok" && (
          <>
            <p className="text-green-700">{msg}</p>
            <div className="mt-4"><Link to="/"><Button>Gå til innlogging</Button></Link></div>
          </>
        )}
        {status === "expired" && (
          <>
            <p className="text-amber-700">{msg}</p>
            <div className="mt-4 flex gap-3">
              <Button onClick={resend} disabled={resendBusy}>
                {resendBusy ? "Sender…" : "Send ny bekreftelses-e-post"}
              </Button>
              <Link to="/"><Button variant="secondary">Til forsiden</Button></Link>
            </div>
            {resendMsg && <p className="mt-3 text-sm">{resendMsg}</p>}
          </>
        )}
        {status === "invalid" && (
          <>
            <p className="text-red-700">{msg || "Ugyldig lenke."}</p>
            <div className="mt-4"><Link to="/"><Button variant="secondary">Til forsiden</Button></Link></div>
          </>
        )}
        {status === "error" && (
          <>
            <p className="text-red-700">{msg || "Noe gikk galt."}</p>
            <div className="mt-4"><Link to="/"><Button variant="secondary">Prøv igjen</Button></Link></div>
          </>
        )}
      </div>
    </div>
  );
}
