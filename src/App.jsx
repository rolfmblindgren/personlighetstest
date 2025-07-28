import { useState } from 'react'
import { Helmet } from 'react-helmet'
import logo from './assets/Grendel-G.png' // hvis du har denne

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
      {/* resten av komponenten */}

      <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ padding: '1rem 2rem', backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {logo && <img src={logo} alt="Grendel logo" style={{ height: '40px', marginRight: '1rem' }} />}
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Grendel Personlighetstest</h1>
        </div>
      </header>

      {/* To-kolonne layout */}
      <main style={{ display: 'flex', flex: 1, padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        {/* Venstre kolonne */}
        <div style={{ flex: 2, paddingRight: '2rem' }}>
          <h2>Hva er dette?</h2>
          <p>
            Dette er en evidensbasert personlighetstest som måler de fem store faktorene (Big Five).
            Testen tar under ett minutt å registrere seg for, og du får en detaljert tilbakemelding umiddelbart etter fullføring.
          </p>
          <p>
            Systemet er utviklet av psykologer med erfaring fra forskning, praksis og teknologi.
          </p>
        </div>

        {/* Høyre kolonne */}
        <div style={{ flex: 1, border: '1px solid #ccc', borderRadius: '8px', padding: '1.5rem', backgroundColor: '#fafafa' }}>
          <h3>Registrer deg</h3>
          <form onSubmit={handleSubmit}>
            <label style={{ display: 'block', marginTop: '1rem' }}>
              E-post:
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
              />
            </label>

            <label style={{ display: 'block', marginTop: '1rem' }}>
              Passord:
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
              />
            </label>

            <button
              type="submit"
              style={{
                width: '100%',
                marginTop: '1.5rem',
                padding: '0.75rem',
                backgroundColor: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Registrer
            </button>
          </form>

          {message && (
            <div style={{ marginTop: '1rem', backgroundColor: '#e6f7ff', borderLeft: '4px solid #1890ff', padding: '0.75rem' }}>
              {message}
            </div>
          )}
        </div>
      </main>
    </div>
    </>	
  )
}

export default App
