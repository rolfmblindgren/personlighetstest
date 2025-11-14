import ConfirmDialog from "@/components/ConfirmDialog";
import { useEffect, useState, useMemo } from "react";
import { authFetch } from "@/lib/apiFetch";
import { API } from "@/lib/apiBase";
import { useNavigate } from 'react-router-dom';
import { t as tr} from "@/i18n";
import Button  from "@/components/Button";

export default function TestsOverview() {
  const [tests, setTests] = useState<{ items: any[] }>({ items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<keyof any>("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [deleting, setDeleting] = useState(false);


  const [testStates, setTestStates] = useState<Record<number, string>>({});

  const navigate = useNavigate();

  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingDeleteIds, setPendingDeleteIds] = useState([]);

  const [toast, setToast] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(50);   // eller 100

  function handleBatchDelete() {
    const ids = Object.entries(testStates)
      .filter(([, state]) => state === "marked")
      .map(([id]) => Number(id));

    if (ids.length === 0) return;

    // Vis modal
    setPendingDeleteIds(ids);
    setShowConfirm(true);
  }

  async function confirmDelete() {
    const ids = pendingDeleteIds;
    setShowConfirm(false);
    setDeleting(true);

    try {
      const response = await authFetch(`${API}/tests/delete_batch`, {
	method: "POST",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify({ ids }),
      });

      if (!response.ok) throw new Error("Sletting feilet");

      setTests(prev => ({
	...prev,
	items: prev.items.filter(t => !ids.includes(t.id)),
      }));

      setTestStates(prev => {
	const next = { ...prev };
	ids.forEach(id => delete next[id]);
	return next;
      });
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
      setToast(`${ids.length} test${ids.length === 1 ? "" : "er"} slettet`);
      setTimeout(() => setToast(null), 3000);
    }
  }


  function toggleMark(id) {
    setTestStates(prev => {
      const current = prev[id] || "idle";
      const next =
	current === "idle" ? "marked" :
	  current === "marked" ? "idle" :
	    current;

      const newState = { ...prev, [id]: next };

      console.log(
	`%cToggled ${id}: ${current} → ${next}`,
	"color: orange; font-weight: bold;",
	newState
      );

      return newState;
    });
  }

  // 🔹 Hent data når komponenten lastes
  useEffect(() => {
    let abort = false;
    const loadTests = async () => {
      try {
        const res = await authFetch(`${API}/tests?status=all&page=${page}&limit=${limit}`);
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

  const markedCount = Object.values(testStates).filter(state => state === "marked").length;

  const totalPages = Math.ceil((tests.total || 0) / limit);
  const showPagination = totalPages > 1;

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
	    <th className="border p-2">{tr("delete")}</th>
          </tr>
        </thead>

	<tbody>
	  {sorted.map((tst) => (
	    <tr key={tst.id}
	      className={`fade-out ${testStates[tst.id] === "marked" ? "removing" : ""}`}>
	      <td className="border p-2">{tst.user_email || "–"}</td>
	      <td className="border p-2 text-right">{tst.id}</td>
	      <td className="border p-2">
		{tst.started_at ? new Date(tst.started_at).toLocaleString("no-NO") : "—"}
	      </td>
	      <td className="border p-2">
		{tst.completed_at ? (
		  <span className="text-green-700 font-medium">{tr('complete')}</span>
		) : (
		  <span className="text-yellow-700 font-medium">{tr('inProgress')}</span>
		)}
	      </td>

	      {/* 🔹 handlinger */}
	      <td className="border p-2 text-center">
		{tst.completed_at ? (
		  <button
		    onClick={() => navigate(`/tests/${tst.id}/scores`)}
		    className="bg-sky-100 hover:bg-sky-200 text-sky-800 px-3 py-1 rounded-md text-sm"
		  >
		    {tr('displayScores')}
		  </button>
		) : (
		  <button
		    onClick={() => navigate(`/testrunner/${tst.id}`)}
		    className="bg-teal-100 hover:bg-teal-200 text-teal-800 px-3 py-1 rounded-md text-sm"
		  >
		    {tr('continue')}
		  </button>
		)}
	      </td>


	      <td className="text-center">
		{testStates[tst.id] === "deleting" ? (
		  <i className="bi bi-arrow-repeat text-secondary spin" title="Sletter..."></i>
		) : testStates[tst.id] === "marked" ? (
		  <i
		    className="bi bi-trash-fill text-danger preserve-opacity"
		    title="Markert for sletting – klikk for å angre"
		    style={{ cursor: "pointer" }}
		    onClick={() => toggleMark(tst.id)}
		  ></i>
		) : (
		  <i
		    className="bi bi-trash text-secondary preserve-opacity"
		    title="Slett"
		    style={{ cursor: "pointer" }}
		    onClick={() => toggleMark(tst.id)}
		  ></i>
		)}
	      </td>
	    </tr>
	  ))}
	</tbody>

      </table>

      {showPagination && (
	<div className="flex gap-2 mt-4">
	  {page > 1 && (
	    <Button onClick={() => setPage(p => p - 1)}>
              {tr('forrige')}
	    </Button>
	  )}

	  {(page * limit) < tests.total && (
	    <Button onClick={() => setPage(p => p + 1)}>
              {tr('neste')}
	    </Button>
	  )}
	</div>
      )}

      { markedCount > 0 && (
      <Button
	className="btn btn-danger mt-3"
	disabled={deleting}
	onClick={handleBatchDelete}
      >
	{deleting ? (
	  <>
	    <i className="bi bi-arrow-repeat me-2 spin"></i>
							      Sletter...
	  </>
	) : (
	  <>
	    <i className="bi bi-trash me-2"></i>
						  Slett valgte ({markedCount})
	  </>
	)}
      </Button>
      )}

      {toast && (
	<div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in">
	  {toast}
	</div>
      )}

      <ConfirmDialog
	open={showConfirm}
	count={pendingDeleteIds.length}
	onConfirm={confirmDelete}
	onCancel={() => setShowConfirm(false)}
      />

    </div>
  );
}
