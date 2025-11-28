// src/hooks/useIsAdmin.tsx
import { useState, useEffect } from "react";
import { authFetch } from "@/lib/apiFetch";
import { API } from "@/lib/apiBase";

export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await authFetch(`${API}/check-admin-status`);
	const data = await res.json();
	console.log("adminresp", data);
        setIsAdmin(data.is_admin);
      } catch {
        setIsAdmin(false);
      }
    }
    load();
  }, []);


  return isAdmin;
}
