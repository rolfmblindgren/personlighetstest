// src/hooks/useProfile.tsx
import { useState, useEffect } from "react";
import { authFetch } from "@/lib/apiFetch";
import { API } from "@/lib/apiBase";

export type UserProfile = {
  navn: string | null;
  kjonn: string | null;
  tittel: string | null;
  telefon: string | null;
  adresse: string | null;
  navn_paa_katt: string | null;
  foedselsdato: string | null;  // ISO "YYYY-MM-DD"
};

export function useGetProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await authFetch(`${API}/user/profile`);
        const data = await res.json();
        setProfile(data);
      } catch (e) {
        setError("Kunne ikke hente profil");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { profile, loading, error };
}
