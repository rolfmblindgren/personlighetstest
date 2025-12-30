import { API } from "@/lib/apiBase";
import { authFetch } from "@/lib/apiFetch";
import { useParams, useNavigate } from "react-router-dom";
import { t as tr } from "@/i18n";


import Button from "@/components/Button";



export default function DonationPage() {


  const { testId } = useParams();
  const navigate = useNavigate();



  const kittyIndex = (testId % 4) + 1
  const base = `/bilder/cutekitty${kittyIndex}`


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
      <h1 className="text-2xl font-semibold">{tr('thankyou')}</h1>
      <p className="text-gray-700 leading-relaxed">
        {tr('donateplea')}
      </p>



      <picture className="block my-8 p-4 bg-gray-50 rounded-xl">
	<source
	  srcSet={`${base}-480.webp 480w, ${base}-1280.webp 1280w`}
	  type="image/webp"
	/>
	<source
	  srcSet={`${base}-480.png 480w, ${base}-1280.png 1280w`}
	  type="image/png"
	/>
	<img
	  src={`${base}-1280.png`}
	  alt="Kan du sei nei til desse auga?"
	  className="w-full h-auto rounded-lg"
	/>
      </picture>



      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={() => handleDonate(75)}>{tr('donate75')}</Button>
        <Button variant="secondary" onClick={() => navigate(`/test/${testId}/results`)}>
          {tr('skinflint')}
        </Button>
      </div>
    </div>
  );
}
