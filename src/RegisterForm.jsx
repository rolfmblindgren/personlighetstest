import { useState } from "react";
import { API } from "./lib/apiBase";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [last, setLast] = useState({ status: null, raw: "", data: null });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pending) return;

    setPending(true);
    setMsg("");
    setErr("");

    try {
      const resp = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const raw = await resp.text();
      let data = null;
      try { if (raw) data = JSON.parse(raw); } catch {}
      setLast({ status: resp.status, raw, data });

      if (resp.ok) {
        setMsg(
          (data?.message && String(data.message).trim()) ||
          "Sjekk e-posten for bekreftelse (om adressen finnes)."
        );
      } else if (resp.status === 409) {
        setErr(
          (data?.error && String(data.error).trim()) ||
          "Denne e-posten er allerede registrert. Prøv å logge inn."
        );
      } else if (resp.status === 400) {
        setErr(
          (data?.error && String(data.error).trim()) ||
          "E-post og passord er påkrevd."
        );
      } else {
        setErr(
          (data?.error && String(data.error).trim()) ||
          `Noe gikk galt (status ${resp.status}).`
        );
      }
      console.debug("register result", { status: resp.status, data, raw });
    } catch (e) {
      console.error(e);
      setErr("Feil ved tilkobling til server.");
      setLast({ status: "NETWORK_ERROR", raw: String(e), data: null });
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 480, margin: "auto" }}>
      <label htmlFor="reg-email">X-post</label>
      <input
        id="reg-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={{ width: "100%", marginBottom: "1rem" }}
        disabled={pending}
      />

      <label htmlFor="reg-pass">Passord</label>
      <input
        id="reg-pass"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        style={{ width: "100%", marginBottom: "1rem" }}
        disabled={pending}
      />

      <button type="submit" disabled={pending}>
        {pending ? "Sender…" : "Registrer"}
      </button>

      {/* Én, tydelig statuslinje */}
      <p style={{ marginTop: "1rem", color: err ? "#c00" : "#111" }} aria-live="polite">
        {err || msg}
      </p>

      {/* Midlertidig debug-panel – fjern når det funker */}
      <div style={{ marginTop: "1rem", fontFamily: "monospace", fontSize: 12, background: "#f6f8fa", padding: 8, borderRadius: 6 }}>
        <div><strong>status:</strong> {String(last.status)}</div>
        <div><strong>raw:</strong> {last.raw ? last.raw.slice(0, 300) : "(tom)"}{last.raw && last.raw.length > 300 ? "…" : ""}</div>
      </div>
    </form>
  );
}
