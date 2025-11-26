import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { authFetch } from "@/lib/apiFetch";
import { API } from "@/lib/apiBase";
import Button from "@/components/Button";
import { t } from "@/i18n";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);

  const { register, handleSubmit, reset } = useForm();

  // Hent eksisterende profil
  useEffect(() => {
    authFetch(API.userProfile)
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        reset(data);
      });
  }, [reset]);

  const onSubmit = async (data) => {
    await authFetch(API.userProfile, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    alert("Profil oppdatert");
  };

  if (!profile) return <p>Laster …</p>;

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">{t("profile.title", "Min profil")}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        <div>
          <label className="block mb-1">Navn</label>
          <input className="input" {...register("navn")} />
        </div>

        <div>
          <label className="block mb-1">Kjønn</label>
          <select className="input" {...register("kjonn")}>
            <option value="">—</option>
            <option value="mann">Mann</option>
            <option value="kvinne">Kvinne</option>
            <option value="annet">Annet</option>
          </select>
        </div>

        <div>
          <label className="block mb-1">Fødselsdato</label>
          <input
            type="date"
            className="input"
            {...register("foedselsdato")}
          />
        </div>

        <div>
          <label className="block mb-1">Telefon</label>
          <input className="input" {...register("telefon")} />
        </div>

        <div>
          <label className="block mb-1">Adresse</label>
          <input className="input" {...register("adresse")} />
        </div>

        <div>
          <label className="block mb-1">Navn på katt</label>
          <input className="input" {...register("navn_paa_katt")} />
        </div>

        <Button type="submit">Lagre</Button>
      </form>
    </div>
  );
}
