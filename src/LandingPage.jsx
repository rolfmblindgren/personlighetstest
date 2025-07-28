export default function LandingPage() {
  return (
<div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
  <div className="bg-white shadow-lg rounded-lg p-8 max-w-4xl w-full">
    <header className="flex items-center mb-8">
      <img src={logo} alt="Logo" className="w-12 h-12 mr-4" />
      <h1 className="text-2xl font-bold">Grendel personlighetstest</h1>
    </header>

    <hr className="mb-8" />

    <div className="flex flex-col md:flex-row gap-8">
      <div className="md:w-2/3">
        <h2 className="text-xl font-semibold mb-2">Hva er dette?</h2>
        <p className="text-gray-700 mb-2">
          Dette er en forskningsbasert personlighetstest basert på femfaktormodellen.
          Den tar omtrent 10 minutter å fullføre.
        </p>
        <p className="text-gray-700">
          Du får en detaljert rapport etterpå, og kan velge å få den tilsendt.
        </p>
      </div>

      <div className="md:w-1/3 bg-gray-50 rounded-md p-4 border">
        <form onSubmit={handleSubmit}>
          <label className="block font-semibold mb-1">E-post</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full mb-4 px-3 py-2 border border-gray-300 rounded"
          />

          <label className="block font-semibold mb-1">Passord</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full mb-4 px-3 py-2 border border-gray-300 rounded"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 transition"
          >
            Registrer
          </button>
        </form>

        {message && (
          <p className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 text-blue-800">
            {message}
          </p>
        )}
      </div>
    </div>
  </div>
</div>
  );
}
