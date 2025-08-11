import { useState } from 'react'

function RegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage(null)

    try {
      const response = await fetch(`${API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      setMessage(response.ok ? data.message || 'Registrering vellykket!' : data.error || 'Noe gikk galt.')
    } catch (error) {
      setMessage('Feil ved tilkobling til server.')
      console.error(error)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: 'auto' }}>
      <label>E-post</label><br />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={{ width: '100%', marginBottom: '1rem' }}
      /><br />

      <label>Passord</label><br />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        style={{ width: '100%', marginBottom: '1rem' }}
      /><br />

      <button type="submit">Registrer</button>

      {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
    </form>
  )
}

export default RegisterForm
