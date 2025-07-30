const answer = 42;

export default function Kontrollpanel() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidepanel */}
      <aside className="w-64 bg-white shadow-lg p-4">
        <h1 className="text-2xl font-bold mb-6">Grendel Admin</h1>
        <nav className="space-y-2">
          <a href="#" className="block text-gray-700 hover:text-blue-600">Dashboard</a>
          <a href="#" className="block text-gray-700 hover:text-blue-600">Brukere</a>
          <a href="#" className="block text-gray-700 hover:text-blue-600">Profiler</a>
          <a href="#" className="block text-gray-700 hover:text-blue-600">Tester</a>
          <a href="#" className="block text-gray-700 hover:text-blue-600">Innstillinger</a>
        </nav>
      </aside>

      {/* Hovedinnhold */}
      <main className="flex-1 p-8 overflow-y-auto">
        <h2 className="text-3xl font-semibold mb-4">Velkommen tilbake</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white shadow rounded">
            <h3 className="text-xl font-semibold">Antall brukere</h3>
            <p className="text-4xl mt-2">{ answer }</p>
          </div>
          <div className="p-4 bg-white shadow rounded">
            <h3 className="text-xl font-semibold">Aktive tester</h3>
            <p className="text-4xl mt-2">23</p>
          </div>
        </div>
      </main>
    </div>
  );
}
