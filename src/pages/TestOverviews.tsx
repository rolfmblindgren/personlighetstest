import { useEffect, useState, useMemo } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { API } from "@/lib/apiBase";
import { useNavigate } from 'react-router-dom'
import { t as tr} from "@/i18n";

export default function TestsOverview() {
  const [tests, setTests] = useState<{ items: any[] }>({ items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<keyof any>("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const navigate = useNavigate();

  // 🔹 Hent data når komponenten lastes
  useEffect(() => {
    let abort = false;
    const loadTests = async () => {
      try {
        const res = await apiFetch(`${API}/tests?status=all`);
        if (!res.ok) throw new Error(`Feil fra API: ${res.status}`);
        const data = await res.json();
        console.log("Fetched data:", data);
        setTests(data);
      } catch (err) {
        console.error(err);
        setError("Klarte ikke hente tester");
      } finally {
        setLoading(false);
      }
    };
    loadTests();
  }, []);

  // 🔹 Lokal sortering
  const sorted = useMemo(() => {
    if (!tests.items) return [];
    return [...tests.items].sort((a, b) => {
      const x = a[sortBy];
      const y = b[sortBy];
      if (x == null) return 1;
      if (y == null) return -1;
      if (x < y) return sortDir === "asc" ? -1 : 1;
      if (x > y) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [tests, sortBy, sortDir]);

  const toggleSort = (field: keyof any) => {
    if (sortBy === field) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortBy(field);
      setSortDir("asc");
    }
  };

  // 🔹 UI
  if (loading) return <div className="p-8 text-center text-gray-500">Laster tester …</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!tests.items?.length) return <div className="p-8 text-center text-gray-500">Ingen tester funnet.</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Mine tester</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th onClick={() => toggleSort("user_email")} className="cursor-pointer border p-2">
              {tr("epost")} {sortBy === "user_email" && (sortDir === "asc" ? "▲" : "▼")}
            </th>
            <th onClick={() => toggleSort("id")} className="cursor-pointer border p-2">
              {tr("ID")} {sortBy === "id" && (sortDir === "asc" ? "▲" : "▼")}
            </th>
            <th onClick={() => toggleSort("started_at")} className="cursor-pointer border p-2">
              {tr("Startet")} {sortBy === "started_at" && (sortDir === "asc" ? "▲" : "▼")}
            </th>
            <th className="border p-2">{tr("status")}</th>
            <th className="border p-2">{tr("handling")}</th>
          </tr>
        </thead>

	<tbody>
  {sorted.map((tst) => (
    <tr key={tst.id}>
      <td className="border p-2">{tst.user_email || "–"}</td>
      <td className="border p-2 text-right">{tst.id}</td>
      <td className="border p-2">
        {tst.started_at ? new Date(tst.started_at).toLocaleString("no-NO") : "—"}
      </td>
      <td className="border p-2">
        {tst.completed_at ? (
          <span className="text-green-700 font-medium">Fullført</span>
        ) : (
          <span className="text-yellow-700 font-medium">Ikke fullført</span>
        )}
      </td>

      {/* 🔹 handlinger */}
      <td className="border p-2 text-center">
        {tst.completed_at ? (
          <button
            onClick={() => navigate(`/tests/${tst.id}/scores`)}
            className="bg-sky-100 hover:bg-sky-200 text-sky-800 px-3 py-1 rounded-md text-sm"
          >
            Se resultat
          </button>
        ) : (
          <button
            onClick={() => navigate(`/testrunner/${tst.id}`)}
            className="bg-teal-100 hover:bg-teal-200 text-teal-800 px-3 py-1 rounded-md text-sm"
          >
            Fortsett test
          </button>
        )}
      </td>
    </tr>
  ))}
</tbody>

      </table>
    </div>
  );
}
