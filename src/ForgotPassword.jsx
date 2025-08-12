import { useState } from 'react'
const API = import.meta.env.VITE_API_BASE_URL

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    await fetch(`${API}/password/forgot`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ email })
    })
    setDone(true)
  }
  return done ? (
    <p>Hvis adressen finnes, har vi sendt en e-post med lenke for å tilbakestille passordet.</p>
  ) : (
    <form onSubmit={submit}>
      <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
      <button type="submit">Send lenke</button>
    </form>
  )
}
