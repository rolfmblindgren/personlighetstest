import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from './lib/apiBase';

export default function Profile() {
  const navigate = useNavigate();

  const [loading, setLoading]   = useState(true);
  const [message, setMessage]   = useState('');
  const [email, setEmail]       = useState('');
  const [navn, setNavn]         = useState('');
  const [adresse, setAdresse]   = useState('');
  const [telefon, setTelefon]   = useState('');
  const [katt, setKatt]         = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/'); return; }

    (async () => {
      try {
        const res = await fetch(`${API}/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.status === 401 || res.status === 403) {
          // ikke innlogget / ikke gyldig token
          localStorage.removeItem('token');
          navigate('/');
          return;
        }
        if (!res.ok) throw new Error('Kunne ikke hente profil');

        const data = await res.json();
        setEmail(data.email || '');
        setNavn(data.navn || '');
        setAdresse(data.adresse || '');
        setTelefon(data.telefon || '');
        setKatt(data.katt || '');
      } catch (err) {
        console.error(err);
        setMessage('Feil ved lasting av profil.');
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage('');
    const token = localStorage.getItem('token');
    if (!token) { navigate('/'); return; }

    try {
      const res = await fetch(`${API}/profile`, {
        method: 'PUT',                            // <— viktig
        headers: {
          'Content-Type': 'application/json',     // <— med anførselstegn
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ navn, adresse, telefon, katt }),
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('token');
        navigate('/');
        return;
      }
      if (!res.ok) throw new Error('Oppdatering feilet');
      setMessage('Profilen er oppdatert!');
    } catch (err) {
      console.error(err);
      setMessage('Feil under oppdatering.');
    }
  };

  if (loading) return <p>Laster profil…</p>;

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Min profil</h2>

      {message && (
        <div className="mb-4 text-sm text-gray-800">{message}</div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">E-post</label>
          <input
            type="email"
            value={email}
            readOnly
            className="w-full rounded border px-3 py-2 bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Navn</label>
          <input
            type="text"
            value={navn}
            onChange={e => setNavn(e.target.value)}
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Adresse</label>
          <input
            type="text"
            value={adresse}
            onChange={e => setAdresse(e.target.value)}
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Telefon</label>
          <input
            type="tel"
            value={telefon}
            onChange={e => setTelefon(e.target.value)}
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Navn på katt</label>
          <input
            type="text"
            value={katt}
            onChange={e => setKatt(e.target.value)}
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700"
        >
          Lagre endringer
        </button>
      </form>
    </div>
  );
}
