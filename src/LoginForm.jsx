import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'
import { API } from "./lib/apiBase";
import Button from './components/Button';
import InputPassword from '@/components/Inputpassword';
import { isTokenValid } from "./components/ProtectedRoute";

async function parseJsonMaybe(res) {
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    try { return await res.json(); } catch { return {}; }
  }
  // fall back til tekst (for logging), men vis ikke i UI
  try { console.debug(await res.text()); } catch {}
  return {};
}

async function resendVerification(email) {
  try {
    const r = await fetch(`${API}/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await parseJsonMaybe(r);
    return { ok: r.ok, status: r.status, data };
  } catch {
    return { ok: false, status: 0, data: { error: 'Nettverksfeil' } };
  }
}


export default function LoginForm() {

  const navigate = useNavigate();  // nødvendig for redirect

  useEffect(() => {
    if (isTokenValid()) {
      // gyldig token: gå til dashbord
      navigate('/dashboard', {replace: true })
    } else {
      // tom eller utløpt token: fjern den
      localStorage.removeItem('token')
    }
  }, [navigate])

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [capsOn, setCapsOn] = useState(false);


  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmitting(true);

    // 1) enkel klient-validering
    const email = (loginEmail || '').trim().toLowerCase();
    const pwd   = (loginPassword || '').trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setLoginError('Skriv en gyldig e-postadresse.');
      setIsSubmitting(false);
      return;
    }
    if (!pwd) {
      setLoginError('Passord mangler.');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pwd }),
      });

      // 2) prøv JSON, men fall tilbake til tekst

      const data = await parseJsonMaybe(res);

      // 3) håndter status


      // 3) håndter status
      if (res.ok) {
        if (!data?.token) {
          setLoginError('Innlogging mislyktes: mangler token.');
        } else {
          localStorage.setItem('token', data.token);
          navigate('/dashboard', { replace: true });
        }
        return;
      }

      if (res.status === 403 && (data?.code === 'EMAIL_NOT_VERIFIED')) {
        // Tilby å sende på nytt
        setLoginError(
          <>
            E-posten er registrert, men ikke bekreftet.{' '}
            <button
              type="button"
              className="underline"
              onClick={async () => {
                const r = await resendVerification((loginEmail || '').trim().toLowerCase());
                setLoginError(
                  r.ok
                    ? 'Vi har sendt deg en ny bekreftelses-lenke.'
                    : (r.data?.error || 'Klarte ikke å sende verifiserings-epost.')
                );
              }}
            >
              Klikk her
            </button>{' '}
            for å få tilsendt ny bekreftelses-lenke.
          </>
        );
      } else if (res.status === 401) {
        setLoginError(data?.error || 'Ugyldig e-post eller passord.');
      } else if (res.status === 429) {
        setLoginError('For mange forsøk. Vent litt og prøv igjen.');
      } else {
        setLoginError(data?.error || 'Noe gikk galt. Prøv igjen.');
      }

    } catch (err) {
      console.error('Feil ved innlogging:', err);
      setLoginError('Fikk ikke kontakt med serveren.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <h3 className="text-2xl font-semibold mb-3">Logg inn</h3>

      <form onSubmit={handleLogin} className="space-y-4">
        <label htmlFor="loginEmail" className="block text-sm font-medium text-gray-700">
          E-post
        </label>
        <input
          type="email"
          id="loginEmail"
          autoCapitalize="off"
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
          required
          className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2
                 text-base outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
          autoComplete="email"
          placeholder="navn@domene.no"
        />

        <label htmlFor="loginPassword" className="block text-sm font-medium text-gray-700">
          Passord
        </label>
        <InputPassword
          id="loginPassword"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          onKeyDown={(e) => setCapsOn(e.getModifierState("CapsLock"))}
          onKeyUp={(e) => setCapsOn(e.getModifierState("CapsLock"))}
        />

        {loginError && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {loginError}{" "}<a href="/forgot" className="underline">
                               Klikk her
                             </a>{" "}
            for å tilbakestille passordet.
          </div>
        )}

        <Button type="submit"
                className="w-full"
                disabled={isSubmitting}>
          {isSubmitting ? 'Logger inn…' : 'Logg inn'}
        </Button>

        {capsOn && (
          <div className="mt-1 text-xs text-yellow-700">
            Caps Lock er på
          </div>
        )}

      </form>
    </>
  );
};
