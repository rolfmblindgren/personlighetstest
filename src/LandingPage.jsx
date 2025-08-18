import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'  
import logo from './assets/Grendel-G.png'
import { isTokenValid } from './components/ProtectedRoute';
import Button from "./components/Button";
import { API } from './lib/apiBase'

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


  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError(''); // reset

    try {
      const response = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      // Prøv å parse JSON, men ikke kræs hvis backend sender noe annet ved 500
      let data = null;
      try { data = await response.json(); } catch (_) {}

      if (response.ok) {
        localStorage.setItem('token', data?.token);
        navigate('/dashboard');
        return;
      }

      // 401 = feil e-post/passord (fra Flask-koden din)
      if (response.status === 401) {
        setLoginError(data?.error || 'Ugyldig e-post eller passord');
      } else {
        setLoginError(data?.error || 'Noe gikk galt. Prøv igjen.');
      }
    } catch (err) {
      console.error('Feil ved innlogging:', err);
      setLoginError('Fikk ikke kontakt med serveren.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage(null)

    const emailTrimmed = email.trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailTrimmed)) {
      setMessage("E-postadressen er ikke gyldig.")
      return
    }

    const errors = []
    if (password.length < 8) errors.push('Passordet må være minst 8 tegn.')
    if (!/[A-ZÆØÅ]/.test(password)) errors.push('Mangler stor bokstav.')
    if (!/[a-zæøå]/.test(password)) errors.push('Mangler liten bokstav.')
    if (!/[0-9]/.test(password)) errors.push('Mangler tall.')
    if (!/[^A-Za-z0-9æøåÆØÅ]/.test(password)) errors.push('Mangler spesialtegn.')

    if (errors.length > 0) {
      setMessage(errors.join(' '))
      return
    }

    try {
      const response = await fetch(`${API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailTrimmed, password }),
      })

      

      const data = await response.json()

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        setMessage(err.error || `Server svarte ${response.status}`)
        return
      }

    } catch (err) {
      console.error(err)
      setMessage('Feil ved tilkobling til server.')
    }
  }

  return (
    <>
      <Helmet>
        <title>Grendel Personlighetstest</title>
        <meta name="description" content="Vitenskapelig testing av personlighet" />
      </Helmet>

      <div className="bg-mint-500">
        <header>
          <div className="header-inner">
            {logo && <img src={logo} alt="Grendel logo" />}
            <h1>Grendel Personlighetstest</h1>
          </div>
        </header>

        <main>
          <div className="bg-mint-500">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold underline">Hva er dette?</h2>
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
                  style={{ width: '100%', height: 'auto', borderRadius: '8px', marginTop: '1rem' }}
                />
              </picture>
            </div>

            <div
              className="w-full max-w-sm mx-auto p-6 bg-white rounded-xl shadow-md"
              style={{ maxWidth: '24rem' }}
            >
              <h3>Logg inn!</h3>

	      <form onSubmit={handleLogin}>
		<label htmlFor="loginEmail">E-post:</label>
		<input
		  type="email"
		  id="loginEmail"
		  value={loginEmail}
		  onChange={(e) => setLoginEmail(e.target.value)}
		  required
		/>
		<label htmlFor="loginPassword">Passord:</label>
		<input
		  type="password"
		  id="loginPassword"
		  value={loginPassword}
		  onChange={(e) => setLoginPassword(e.target.value)}
		  required
		/>

                {loginError && (
                  <div role="alert" style={{ marginTop: 8 }}>
                    {loginError}
                  </div>
                )}

		<Button  type="submit">Logg inn</Button>
	      </form>

	      <h3 style={{ marginTop: '2rem' }}>Eller registrer deg</h3>
	      
              <form onSubmit={handleSubmit} autoComplete="on">
                <label>
                  E-post:
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </label>

                <label>
                  Passord:
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </label>

                <label style={{ display: 'block', marginTop: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={() => setShowPassword(!showPassword)}
                  />
                  Vis passord
                </label>

                <Button  type="submit">Registrer</Button>
              </form>
              {message && <div className="message">{message}</div>}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

export default LandingPage
