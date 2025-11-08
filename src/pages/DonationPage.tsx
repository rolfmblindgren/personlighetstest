import { API } from "@/lib/apiBase";
import { authFetch } from "@/lib/apiFetch";
import { useParams, useNavigate } from "react-router-dom";

import Button from "@/components/Button";

export default function DonationPage() {
  const { testId } = useParams();
  const navigate = useNavigate();

  async function handleDonate(amount = 75) {
    try {
      const res = await authFetch(`${API}/donate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "amount" : amount, "test_id": testId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else throw new Error(data.error || "Klarte ikke å starte donasjon");
    } catch (e: any) {
      alert(e.message);
    }
  }

  return (
    <div className="max-w-lg mx-auto mt-12 p-4 text-center space-y-6">
      <h1 className="text-2xl font-semibold">Takk for at du fullførte testen!</h1>
      <p className="text-gray-700 leading-relaxed">
        Prosjektet drives uten kommersiell støtte. Om du vil bidra til drift og videreutvikling,
        foreslår vi et frivillig bidrag på 75 kroner.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={() => handleDonate(75)}>Doner 75 kr</Button>
        <Button variant="secondary" onClick={() => navigate(`/test/${testId}/results`)}>
          Vis resultat uten å donere
        </Button>
      </div>
    </div>
  );
}
