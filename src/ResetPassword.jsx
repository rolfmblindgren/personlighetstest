import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
const API = import.meta.env.VITE_API_BASE_URL

export default function ResetPassword() {
  const [sp] = useSearchParams()
  const token = sp.get('token') || ''
  const [pw, setPw] = useState('')
  const [msg, setMsg] = useState('')
  const nav = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setMsg('')
    const r = await fetch(`${API}/password/reset`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ token, password: pw })
    })
    const data = await r.json().catch(()=>({}))
    if (r.ok) {
      setMsg('Passordet er oppdatert. Du kan nå logge inn.')
      setTimeout(()=>nav('/'), 1500)
    } else {
      setMsg(data.error || 'Lenken er ugyldig eller utløpt.')
    }
  }

  return (
    <form onSubmit={submit}>
      <input type="password" value={pw} onChange={e=>setPw(e.target.value)} required />
      <button type="submit">Oppdater passord</button>
      {msg && <p>{msg}</p>}
    </form>
  )
}
