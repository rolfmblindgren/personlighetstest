import { useState, useEffect } from 'react';

const answer = 17;
const magick = 17;

export default function Kontrollpanel() {

  const [antallBrukere, setAntallBrukere] = useState(0);
  const [aktiveTester, setAktiveTester] = useState(0);

  useEffect(() => {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => {
	setAntallBrukere(data.antall_brukere);
      });
  }, []);

  
   return (
<div className="min-h-screen bg-gray-50 flex">
  {/* Sidepanel */}
  <aside className="w-64 bg-white shadow-lg p-6 space-y-4">
    <h1 className="text-2xl font-bold text-gray-800">Grendel Admin</h1>
    <nav className="flex flex-col space-y-2">
      <a href="#" className="text-gray-700 hover:text-blue-600">Dashboard</a>
      <a href="#" className="text-gray-700 hover:text-blue-600">Brukere</a>
      <a href="#" className="text-gray-700 hover:text-blue-600">Profiler</a>
      <a href="#" className="text-gray-700 hover:text-blue-600">Tester</a>
      <a href="#" className="text-gray-700 hover:text-blue-600">Innstillinger</a>
    </nav>
  </aside>

  {/* Hovedinnhold */}
  <main className="flex-1 p-8 overflow-y-auto">
    <h2 className="text-3xl font-semibold text-gray-800 mb-8">Velkommen tilbake</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="p-6 bg-white shadow-md rounded-xl">
        <h3 className="text-xl font-semibold text-gray-700">Antall brukere</h3>
        <p className="text-4xl mt-4 text-blue-700 font-bold">{antallBrukere}</p>
      </div>
      <div className="p-6 bg-white shadow-md rounded-xl">
        <h3 className="text-xl font-semibold text-gray-700">Aktive tester</h3>
        <p className="text-4xl mt-4 text-blue-700 font-bold">23</p>
      </div>
    </div>
  </main>
</div>
  );
}
