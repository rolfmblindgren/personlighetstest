// src/hooks/useHasLegacy.tsx
import { useState, useEffect } from "react";
import { authFetch } from "@/lib/apiFetch";
import { API } from "@/lib/apiBase";

export function useHasLegacy() {
  const [hasLegacy, setHasLegacy] = useState<boolean | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const r = await authFetch(`${API}/check-legacy-tests`);
        const data = await r.json();
        setHasLegacy(data.hasLegacy);
      } catch {
        setHasLegacy(false);
      }
    }
    load();
  }, []);

  return hasLegacy; // null = loading, true/false = klart
}
