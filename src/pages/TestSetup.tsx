import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authFetch } from "@/lib/apiFetch";
import { API } from "@/lib/apiBase";
import { t as tr } from "@/i18n";
import { languages, type LanguageCode } from "@/i18n/languages";
import { getPreferredLanguage } from "@/i18n/getPreferredLanguage";

type Profile = {
  navn: string | null;
  kjonn: string | null;
  tittel: string | null;
  telefon: string | null;
  adresse: string | null;
  navn_paa_katt: string | null;
  foedselsdato: string | null;
  language: LanguageCode | null;
};

const emptyProfile: Profile = {
  navn: "",
  kjonn: "",
  tittel: "",
  telefon: "",
  adresse: "",
  navn_paa_katt: "",
  foedselsdato: "",
  language: null,
};

function isProfileComplete(profile: Profile) {
  return !!(
    profile.navn?.trim() &&
      profile.foedselsdato &&
      profile.language
  );
}

function normalizeDate(value: string | null): string {
  if (!value) return "";

  const d = new Date(value);
  if (!isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10);
  }

  return "";
}

export default function TestSetup() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const res = await authFetch(`${API}/user/profile`);

        if (!res.ok) {
          throw new Error("Kunne ikke hente profil");
        }

        const data: Profile = await res.json();

	const merged: Profile = {
	  ...emptyProfile,
	  ...data,
	  foedselsdato: normalizeDate(data.foedselsdato),
	  language: getPreferredLanguage(data.language),
	};

	if (cancelled) return;

	setProfile(merged);

	if (isProfileComplete(merged)) {
	  const resolvedLanguage = merged.language || getPreferredLanguage(null);

	  localStorage.setItem("testLanguage", resolvedLanguage);
	  document.dispatchEvent(
	    new CustomEvent("testlanguageChanged", {
	      detail: resolvedLanguage,
	    })
	  );

	  if (!testId) {
	    setError("Mangler test-ID.");
	    return;
	  }

	  navigate(`/testrunner/${testId}`, { replace: true });
	}
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Ukjent feil");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [navigate, testId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const navn = profile.navn?.trim() || "";
    const foedselsdato = profile.foedselsdato || "";
    const language = profile.language || getPreferredLanguage(null);

    if (!navn || !foedselsdato || !language) {
      setError("Fyll ut navn, fødselsdato og språk.");
      return;
    }

    if (!testId) {
      setError("Mangler test-ID.");
      return;
    }

    try {
      setSaving(true);

      const res = await authFetch(`${API}/user/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          navn,
          foedselsdato,
          language,
        }),
      });

      if (!res.ok) {
        throw new Error("Kunne ikke lagre profil");
      }

      localStorage.setItem("testLanguage", language);
      document.dispatchEvent(
        new CustomEvent("testlanguageChanged", {
          detail: language,
        })
      );

      navigate(`/testrunner/${testId}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ukjent feil");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="max-w-2xl mx-auto p-6">{tr("isLoadingProfile")}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">{tr("priorToStarting")}</h1>
      <p className="mb-6 text-gray-600">
        {tr("needSomeInformation")}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">{tr("name")}</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={profile.navn || ""}
            onChange={(e) =>
              setProfile({ ...profile, navn: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">{tr("dob")}</label>
          <input
            type="date"
            className="w-full border rounded px-3 py-2"
            value={profile.foedselsdato || ""}
            onChange={(e) =>
              setProfile({ ...profile, foedselsdato: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">{tr("language")}</label>
	  <select
	    className="w-full border rounded px-3 py-2"
	    value={profile.language || getPreferredLanguage(null)}
	    onChange={(e) =>
	      setProfile({
		...profile,
		language: e.target.value as LanguageCode,
	      })
	    }
	  >

	    {Object.entries(languages).map(([code, label]) => (
              <option key={code} value={code}>
                {tr(label)}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="text-red-700 bg-red-50 border border-red-200 rounded p-3">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-3 rounded bg-teal-500 text-white font-semibold"
        >
          {saving ? tr("isSaving") : tr("saveAndStart")}
        </button>
      </form>
    </div>
  );
}
