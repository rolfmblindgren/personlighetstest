import { useState } from "react";
import { API } from "./lib/apiBase";
import Button from "./components/Button";


async function resendVerification(email) {
  try {
    const resp = await fetch(`${API}/resend-verification`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ email }),
    });
    const data = await resp.json().catch(() => ({}));
    return { ok: resp.ok, status: resp.status, data };
  } catch (e) {
    return { ok: false, status: 0, data: { error: 'Nettverksfeil' } };
  }
}

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false)

  const [message, setMessage] = useState(null)

  const [password, setPassword] = useState("");
  const [regPending, setRegPending] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [last, setLast] = useState({ status: null, raw: "", data: null });
  const [regMsg, setRegMsg] = useState('');
  const [regErr, setRegErr] = useState('');

  const [exists, setExists] = useState(false);
  const [existsVerified, setExistsVerified] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (regPending) return;

    setRegPending(true);
    setRegMsg('');
    setRegErr('');

    const emailTrimmed = email.trim().toLowerCase();

    // enkel klientvalidering
    const errors = [];
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) errors.push('E-postadressen er ikke gyldig.');
    if (password.length < 8) errors.push('Passordet må være minst 8 tegn.');
    if (!/[A-ZÆØÅ]/.test(password)) errors.push('Mangler stor bokstav.');
    if (!/[a-zæøå]/.test(password)) errors.push('Mangler liten bokstav.');
    if (!/[0-9]/.test(password)) errors.push('Mangler tall.');
    if (!/[^A-Za-z0-9æøåÆØÅ]/.test(password)) errors.push('Mangler spesialtegn.');
    if (errors.length) { setRegErr(errors.join(' ')); setRegPending(false); return; }

    try {
      const resp = await fetch(`${API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailTrimmed, password }),
      });

      // prøv json, men tåler tom body
      const raw = await resp.text();
      let data = {};
      try {
        if (raw) data = JSON.parse(raw);
      } catch {}

      if (resp.status === 201) {
        // ny bruker opprettet
        setRegMsg(data.message?.trim() || 'Bruker registrert. Sjekk e-posten for bekreftelse.');
        setRegErr('');
      } else if (resp.status === 409) {
        setExists(true);
        setExistsVerified(!!data.verified);
        setRegMsg('');
        setRegErr(''); // ikke rød feilmelding her
      } else if (resp.status === 400) {
        setRegErr(data.error?.trim() || 'E-post og passord er påkrevd.');
        setRegMsg('');
      } else if (resp.ok) {
        // andre 2xx – vis nøytral melding
        setRegMsg(data.message?.trim() || 'Hvis adressen er gyldig, har vi sendt deg en bekreftelses-e-post.');
        setRegErr('');
      } else {
        setRegErr(data.error?.trim() || `Noe gikk galt (status ${resp.status}).`);
        setRegMsg('');
      }
    } catch (err) {
      console.error(err);
      setRegErr('Feil ved tilkobling til server.');
      setRegMsg('');
    } finally {
      setRegPending(false);
    }
  };

  return (
    <>
      <h3 className="text-2xl font-semibold mb-3">Registrér deg</h3>

      <form onSubmit={handleSubmit} autoComplete="on" className="space-y-4">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          E-post
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2
                 text-base outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
          placeholder="navn@domene.no"
        />

        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Passord
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-20
                   text-base outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            placeholder="minst 8 tegn"
          />
          <Button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 my-1 mr-1 rounded-md px-3 text-sm text-gray-600 hover:bg-gray-100"
            aria-label={showPassword ? 'skjul passord' : 'Vis passord'}
          >
            {showPassword ? 'skjul' : 'vis'}
          </Button>
        </div>

        <Button type="submit" className="w-full" disabled={regPending}>
          {regPending ? 'Sender…' : 'Registrer'}
        </Button>

        {exists && (
          <div className="mt-4 space-y-3">
            <div className="text-sm">
              {existsVerified ? (
                <span className="text-gray-800">
                  E-posten er allerede registrert. Logg inn for å fortsette.
                </span>
              ) : (
                <span className="text-gray-800">
                  E-posten er allerede registrert, men ikke bekreftet.
                </span>
              )}
            </div>

            {!existsVerified && (
              <Button
                type="button"
                onClick={async () => {
                  const r = await resendVerification(email.trim().toLowerCase());
                  if (r.ok) setRegMsg('Vi har sendt deg en ny bekreftelses-lenke.');
                  else setRegErr(r.data?.error || 'Klarte ikke å sende verifiserings-epost.');
                }}
              >
                Send ny bekreftelses-lenke
              </Button>
            )}

            <Button
              type="button"
              className="text-sm underline text-sky-700"
              onClick={() => {
                // bytt til login-visning om du har tabs,
                // eller naviger til /login i SPA-en
                window.dispatchEvent(new CustomEvent('switch-to-login'));
              }}
            >
              Gå til innlogging
            </Button>
          </div>
        )}

      </form>

      {message && <div className="mt-4 text-sm text-gray-700">{message}</div>}
    </>
  );
}
