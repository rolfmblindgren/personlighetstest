import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import logo from './assets/Grendel-G.png'

function LandingPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState(null)
  const [showPassword, setShowPassword] = useState(false)

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
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailTrimmed, password }),
      })

      const data = await response.json()
      setMessage(response.ok ? data.message : data.error || 'Noe gikk galt.')
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

      <div className="page-container">
        <header>
          <div className="header-inner">
            {logo && <img src={logo} alt="Grendel logo" />}
            <h1>Grendel Personlighetstest</h1>
          </div>
        </header>

        <main>
          <div className="main-content" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div className="info-box" style={{ flex: '1 1 300px', minWidth: '300px' }}>
              <h2>Hva er dette?</h2>
              <p>
                Dette er en evidensbasert personlighetstest som måler de fem store faktorene (Big Five).
                Testen tar under ett minutt å registrere seg for, og du får en detaljert tilbakemelding umiddelbart etter fullføring.
              </p>
              <p>
                Systemet er utviklet av psykologer med erfaring fra forskning, praksis og teknologi.
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

            <div className="register-box" style={{ flex: '0 1 300px', minWidth: '300px' }}>
              <h3>Registrer deg</h3>
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

                <button type="submit" style={{ marginTop: '1rem' }}>Registrer</button>
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
