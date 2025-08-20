import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'
import { API } from "./lib/apiBase";
import Button from "./components/Button";
import { isTokenValid } from "./components/ProtectedRoute";

export default function LoginForm() {

  const navigate = useNavigate();  // nødvendig for redirect

  useEffect(() => {
    if (isTokenValid()) {
      // gyldig token: gå til dashbord
      navigate('/dashboard')
    } else {
      // tom eller utløpt token: fjern den
      localStorage.removeItem('token')
    }
  }, [navigate])

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const ct = res.headers.get('content-type') || '';
      let data = null;
      if (ct.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        // skjul tracebacks for bruker, men logg i konsollen
        if (text && text.includes('Traceback')) console.error(text);
        data = { error: 'Noe gikk galt på serveren.' };
      }

      // 3) håndter status
      if (res.ok) {
        if (!data?.token) {
          setLoginError('Innlogging mislyktes: mangler token.');
        } else {
          localStorage.setItem('token', data.token);
          navigate('/dashboard');
        }
        return;
      }

      // vanlige statuser fra backend
      if (res.status === 401) {
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
        <input
          type="password"
          id="loginPassword"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          required
          className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2
                 text-base outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
          autoComplete="current-password"
          placeholder="••••••••"
        />

        {loginError && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {loginError}
          </div>
        )}

        <Button type="submit"
                className="w-full"
                disabled={isSubmitting}>Logg inn</Button>
      </form>
    </>
  );
};
