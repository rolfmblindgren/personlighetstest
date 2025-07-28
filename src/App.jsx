import { useState } from 'react'
import { Helmet } from 'react-helmet'
import logo from './assets/Grendel-G.png'
import './App.css'

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage(null)

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      if (response.ok) {
        setMessage(data.message || 'Registrering vellykket!')
      } else {
        setMessage(data.error || 'Noe gikk galt.')
      }
    } catch (error) {
      setMessage('Feil ved tilkobling til server.')
      console.error(error)
    }
  }

  return (
    <>
      <Helmet>
        <title>Grendel Personlighetstest</title>
        <meta name="description" content="Vitenskapelig testing av personlighet" />
      </Helmet>
      <div className="main-content">

	<div className="page-container">
          <header>
            <div className="header-inner">
              {logo && <img src={logo} alt="Grendel logo" />}
              <h1>Grendel Personlighetstest</h1>
            </div>
          </header>

          <main>
            <div className="info-box">
              <h2>Hva er dette?</h2>
              <p>
		Dette er en evidensbasert personlighetstest som måler de fem store faktorene (Big Five).
		Testen tar under ett minutt å registrere seg for, og du får en detaljert tilbakemelding umiddelbart etter fullføring.
              </p>
              <p>
		Systemet er utviklet av psykologer med erfaring fra forskning, praksis og teknologi.
              </p>
            </div>

            <div className="register-box">
              <h3>Registrer deg</h3>
              <form onSubmit={handleSubmit}>
		<label>
                  E-post:
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
		</label>

		<label>
                  Passord:
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
		</label>

		<button type="submit">Registrer</button>
              </form>

              {message && (
		<div className="message">{message}</div>
              )}
            </div>
          </main>
	</div>
      </div>
    </>
  )
}

export default App
