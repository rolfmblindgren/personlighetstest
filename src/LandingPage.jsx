import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'  
import logo from './assets/Grendel-G.png'
import { isTokenValid } from './components/ProtectedRoute';
import Button from "./components/Button";
import { API } from './lib/apiBase'
import { H1, H2 } from './components/Heading.tsx'

function LandingPage() {
  const navigate = useNavigate();  // nødvendig for redirect
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    if (isTokenValid()) {
      // gyldig token: gå til dashbord
      navigate('/dashboard')
    } else {
      // tom eller utløpt token: fjern den
      localStorage.removeItem('token')
    }
  }, [navigate])


  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [regPending, setRegPending] = useState(false);
  const [regMsg, setRegMsg] = useState('');
  const [regErr, setRegErr] = useState('');


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
      try { if (raw) data = JSON.parse(raw); } catch {}

      if (resp.status === 201) {
        // ny bruker opprettet
        setRegMsg(data.message?.trim() || 'Bruker registrert. Sjekk e-posten for bekreftelse.');
        setRegErr('');
      } else if (resp.status === 409) {
        // allerede registrert
        setRegErr(data.error?.trim() || 'E-posten er allerede registrert. Prøv å logge inn.');
        setRegMsg('');
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
      <Helmet>
        <title>Grendel Personlighetstest</title>
        <meta name="description" content="Vitenskapelig testing av personlighet" />
      </Helmet>

      <div>
        <header className="bg-teal-200 p-4 rounded-lg">
          <div className="flex items-center space-x-4">
            {logo && <img src={logo} className="h-12 w-auto" alt="Grendel logo" />}
            <H1>Grendel Personlighetstest</H1>
          </div>
        </header>

        <main className="p-6">
          <div className="flex flex-col md:flex-row gap-6">


            <div className="md:basis-3/5 bg-slate-100 p-4 rounded-lg">
              <H2>Hva er dette?</H2>
              <p>
                Dette er en evidensbasert personlighetstest som måler de fem store faktorene (Big Five). Testen tar under ett minutt å registrere seg for, og du får en detaljert tilbakemelding umiddelbart etter fullføring. 
              </p>

              <picture>
                <source
                  srcSet="/bilder/zahlenzauberer-480.webp 480w, /bilder/zahlenzauberer-1280.webp 1280w"
                  type="image/webp"
                />
                <source
                  srcSet="/bilder/zahlenzauberer-480.png 480w, /bilder/zahlenzauberer-1280.png 1280w"
                  type="image/png"
                />
                <img
                  src="/bilder/zahlenzauberer-1280.png"
                  alt="Personer i forskjellige aktiviteter"
                  className = "w-full h-auto rounded-lg mt-4 max-w-full"
                />
              </picture>
            </div>

            <div className="md:basis-2/5 bg-slate-100 p-4 rounded-lg">
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

              <div className="my-6 h-px bg-gray-200" />

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
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 my-1 mr-1 rounded-md px-3 text-sm text-gray-600 hover:bg-gray-100"
                    aria-label={showPassword ? 'skjul passord' : 'vis passord'}
                  >
                    {showPassword ? 'skjul' : 'vis'}
                  </button>
                </div>

                <Button type="submit" className="w-full" disabled={regPending}>
                  {regPending ? 'Sender…' : 'Registrer'}
                </Button>

                {(regMsg || regErr) && (
                  <div className="mt-4 text-sm">
                    {regMsg && <div className="text-green-700">{regMsg}</div>}
                    {regErr && <div className="text-red-700">{regErr}</div>}
                  </div>
                )}

              </form>

              {message && <div className="mt-4 text-sm text-gray-700">{message}</div>}
            </div>


          </div>
        </main>
      </div>
    </>
  )
}

export default LandingPage
