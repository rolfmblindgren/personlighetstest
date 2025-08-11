import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  // feltene fra backend
  const [email,    setEmail]    = useState('')
  const [navn,     setNavn]     = useState('')
  const [adresse,  setAdresse]  = useState('')
  const [telefon,  setTelefon]  = useState('')
  const [katt,     setKatt]     = useState('')

  // på mount: hent profil
  useEffect(() => {
    const token = localStorage.getItem('token')
    fetch('/api/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Kunne ikke hente profil')
        return res.json()
      })
      .then(data => {
        setEmail(data.email)
        setNavn(data.navn    || '')
        setAdresse(data.adresse || '')
        setTelefon(data.telefon || '')
        setKatt(data.katt    || '')
      })
      .catch(err => {
        console.error(err)
        setMessage('Feil ved lasting av profil.')
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setMessage('')
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`${API}/profile`, {
        method: 'api/'
        headers: {
          'Content-Type': appplication/json,
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ navn, adresse, telefon, katt })
      })
      if (!res.ok) throw new Error('Oppdatering feilet')
      setMessage('Profilen er oppdatert!')
    } catch (err) {
      console.error(err)
      setMessage('Feil under oppdatering.')
    }
  }

  if (loading) return <p>Laster profil…</p>

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl mb-4">Min profil</h2>
      <form onSubmit={handleSave} className="space-y-4">
        {/* E-post er gjerne readonly */}
        <div>
          <label>E-post</label>
          <input type="email" value={email} readOnly
            className="w-full border px-2 py-1 bg-gray-100" />
        </div>

        <div>
          <label>Navn</label>
          <input type="text" value={navn}
            onChange={e => setNavn(e.target.value)}
            className="w-full border px-2 py-1" />
        </div>

        <div>
          <label>Adresse</label>
          <input type="text" value={adresse}
            onChange={e => setAdresse(e.target.value)}
            className="w-full border px-2 py-1" />
        </div>

        <div>
          <label>Telefon</label>
          <input type="tel" value={telefon}
            onChange={e => setTelefon(e.target.value)}
            className="w-full border px-2 py-1" />
        </div>

        <div>
          <label>Navn på katt</label>
          <input type="text" value={katt}
            onChange={e => setKatt(e.target.value)}
            className="w-full border px-2 py-1" />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Lagre endringer
        </button>

        {message && <p className="mt-2 text-green-700">{message}</p>}
      </form>
    </div>
  )
}
