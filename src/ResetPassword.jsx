import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Button from '@/components/Button';
import InputPassword from './components/InputPassword';
import { H3 } from '@/components/Heading';

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
    <form onSubmit={submit} className="max-w-sm mx-auto p-6 bg-white rounded-xl shadow">
      <H3>Nytt passord</H3>

      <InputPassword
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        placeholder="Skriv nytt passord"
      />

      <Button type="submit" className="mt-4 w-full">Lagre</Button>

      {msg && <p className="mt-3 text-sm text-gray-700 text-center">{msg}</p>}
    </form>
  )
}
