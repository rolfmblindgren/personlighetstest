// src/ForgotPassword.jsx
import { useState } from "react";
import Button from "./components/Button";
const API = import.meta.env.VITE_API_BASE_URL;

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [msg, setMsg] = useState("");       // info/feil

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");

    const epost = (email || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(epost)) {
      setMsg("Skriv en gyldig e-postadresse.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(`${API}/password/forgot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: epost }),
      });

      // Prøv JSON, men tåler tekstsvar
      const ct = res.headers.get("content-type") || "";
      const data = ct.includes("application/json")
        ? await res.json().catch(() => ({}))
        : {};

      if (!res.ok) {
        setMsg(data.error || `Noe gikk galt (status ${res.status}).`);
        return;
      }

      // Alltid «suksess»-melding, uansett om adressen finnes (ikke avslør brukere)
      setDone(true);
    } catch (err) {
      console.error("Forgot error:", err);
      setMsg("Fikk ikke kontakt med serveren.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <p role="status" className="text-sm text-gray-700">
        Hvis adressen finnes, har vi sendt en e-post med lenke for å tilbakestille passordet.
        Sjekk også søppelpost.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3" noValidate>
      <label htmlFor="fpEmail" className="block text-sm font-medium">
        E-post
      </label>
      <input
        id="fpEmail"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        required
        className="w-full rounded border px-3 py-2"
        disabled={busy}
      />

      {msg && (
        <div role="alert" className="rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">
          {msg}
        </div>
      )}

      <Button
        type="submit"
        disabled={busy}
      >
        {busy ? "Sender…" : "Send lenke"}
      </Button>
    </form>
  );
}
