// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from "react";
import { isTokenValid } from "@/auth";

type AuthContextType = {
  loggedIn: boolean;
  login: (token: string) => void;
  logout: () => void;
  getToken: () => string | null;
  setToken: (token: string) => void;
};

// NB: behold navnet "authContext" hvis apiFetch importerer det navnet
export const authContext = createContext<AuthContextType>({
  loggedIn: false,
  login: () => {},
  logout: () => {},
  getToken: () => null,
  setToken: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Gate første render til vi har bestemt status
  const [loggedIn, setLoggedIn] = useState<boolean | null>(() => isTokenValid());

  // --- impl av funksjoner som brukes både av UI og apiFetch ---
  const getToken = () => localStorage.getItem("token");

  const setToken = (token: string) => {
    localStorage.setItem("token", token);
    setLoggedIn(true);
  };

  const login = (token: string) => {
    setToken(token); // samme som over
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    setLoggedIn(false);
  };
  // -------------------------------------------------------------

  useEffect(() => {
    const check = () => setLoggedIn(isTokenValid());
    check(); // viktig på initial mount
    window.addEventListener("storage", check);
    return () => window.removeEventListener("storage", check);
  }, []);

  console.log("AuthProvider render → loggedIn =", loggedIn);

  if (loggedIn === null) {
    // vis en kort loader til auth-status er kjent
    return <div className="p-8 text-center text-gray-500">Laster …</div>;
  }

  // Her er loggedIn garantert boolean (narrowet av returnen over)
  return (
    <authContext.Provider value={{ loggedIn, login, logout, getToken, setToken }}>
      {children}
    </authContext.Provider>
  );
}

export function useAuth() {
  return useContext(authContext);
}
