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

      <div className="page-container">
        <header>
          <div className="header-inner">
            {logo && <img src={logo} alt="Grendel logo" />}
            <h1>Grendel Personlighetstest</h1>
          </div>
        </header>

        <main>
	  <div className="main-content">
            <div className="info-box">
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
		  srcSet="
      /bilder/zahlenzauberer-480.webp?v=1 480w,
      /bilder/zahlenzauberer-640.webp?v=1 640w,
      /bilder/zahlenzauberer-800.webp?v=1 800w,
      /bilder/zahlenzauberer-1280.webp?v=1 1280w,
      /bilder/zahlenzauberer-1920.webp?v=1 1920w
    "
		  type="image/webp"
		  sizes="(max-width: 600px) 100vw, (max-width: 1200px) 80vw, 60vw"
		/>
		<source 
		  srcSet="
      /bilder/zahlenzauberer-480.png?v=1 480w,
      /bilder/zahlenzauberer-640.png?v=1 640w,
      /bilder/zahlenzauberer-800.png?v=1 800w,
      /bilder/zahlenzauberer-1280.png?v=1 1280w,
      /bilder/zahlenzauberer-1920.png?v=1 1920w
    "
		  type="image/png"
		  sizes="(max-width: 600px) 100vw, (max-width: 1200px) 80vw, 60vw"
		/>
		<img 
		  src="/bilder/zahlenzauberer-1280.png"
		  alt="Personer i forskjellige aktiviteter"
		  style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
		/>
	      </picture>
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
	  </div>
        </main>
      </div>
      <script>
  document.querySelector("form").addEventListener("submit", function(e) {
    const emailField = document.getElementById("email");
    const email = emailField.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      e.preventDefault(); // Stopper innsending
      alert("Vennligst oppgi en gyldig e-postadresse.");
      emailField.focus();
    }
  });
</script>

    </>
  )



}

export default App
