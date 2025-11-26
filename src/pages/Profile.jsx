import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { authFetch } from "@/lib/apiFetch";
import { API, ENDPOINT } from "@/lib/apiBase";
import Button from "@/components/Button";
import { t } from "@/i18n";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  // Henter profil ved mount

  useEffect(() => {
    async function hentProfil() {
      try {
        const res = await authFetch(ENDPOINT.userProfile);
        if (!res.ok) throw new Error("Kunne ikke hente profil");
        const data = await res.json();
        setProfile(data);
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

        <H2>Min profil</H2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          <div>
            <label className="block text-sm font-medium mb-1">Navn</label>
            <input
              {...register("full_name")}
              className="w-full border rounded-lg p-2"
              type="text"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Kjønn</label>
            <select
              {...register("gender")}
              className="w-full border rounded-lg p-2"
            >
              <option value="M">Mann</option>
              <option value="F">Kvinne</option>
              <option value="O">Annet</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Fødselsdato</label>
            <input
              {...register("birthdate")}
              className="w-full border rounded-lg p-2"
              type="date"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Telefon</label>
            <input
              {...register("phone")}
              className="w-full border rounded-lg p-2"
              type="text"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Adresse</label>
            <input
              {...register("address")}
              className="w-full border rounded-lg p-2"
              type="text"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Navn på katt</label>
            <input
              {...register("cat_name")}
              className="w-full border rounded-lg p-2"
              type="text"
            />
          </div>

          <Button type="submit" variant="primary" className="w-full mt-4">
            Lagre profil
          </Button>

        </form>

      </div>
    </div>
  );
}
