import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { authFetch } from "@/lib/apiFetch";
import { API, ENDPOINT } from "@/lib/apiBase";
import Button from "@/components/Button";
import { H1, H2, H3} from "@/components/Heading";
import { t as tr } from "@/i18n";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  // Henter profil ved mount

  useEffect(() => {
    async function hentProfil() {
      try {
        const res = await authFetch(ENDPOINT.userProfile);
        if (!res.ok) throw new Error(tr('fetchProfileError'));
        const data = await res.json();
        setProfile(data);

        if (data.foedselsdato) {
          const d = new Date(data.foedselsdato);
          if (!isNaN(d)) {
            data.foedselsdato = d.toISOString().slice(0, 10);
          } else {
            data.foedselsdato = ""; // fallback hvis noe helt uventet skjer
          }
        }
        reset(data);

        reset(data);
      } catch (err) {
        console.error("Feil ved henting av profil:", err);
      }
    }
    hentProfil();
  }, [reset]);

  const onSubmit = async (data) => {
    await authFetch(ENDPOINT.userProfile, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    alert("Profil oppdatert");
  };

  if (!profile) return <p>Laster …</p>;

 return (
    <div className="max-w-xl mx-auto mt-10">
      <div className="bg-white shadow-md rounded-xl p-8 space-y-6">

        <H2>{tr('myProfile')}</H2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          <div>
   <label className="block text-sm font-medium mb-1">{tr('name')}</label>
            <input
              {...register("navn")}
              className="w-full border rounded-lg p-2"
              type="text"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{tr('gender')}</label>
            <select
              {...register("kjonn")}
              className="w-full border rounded-lg p-2"
            >
              <option value="mann">{tr('man')}</option>
              <option value="kvinne">{tr('woman')}</option>
              <option value="annet">{tr('other')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{tr('dob')}</label>
            <input
              {...register("foedselsdato")}
              className="w-full border rounded-lg p-2"
              type="date"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{tr('phone')}</label>
            <input
              {...register("telefon")}
              className="w-full border rounded-lg p-2"
              type="text"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{tr('address')}</label>
            <input
              {...register("adresse")}
              className="w-full border rounded-lg p-2"
              type="text"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{tr('catsName')}</label>
            <input
              {...register("navn_paa_katt")}
              className="w-full border rounded-lg p-2"
              type="text"
            />
          </div>

          <Button type="submit" variant="primary" className="w-full mt-4">
            {tr('saveProfile')}
          </Button>

        </form>

      </div>
    </div>
  );
}
