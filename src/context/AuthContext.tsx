import React, { createContext, useState, useEffect, useContext } from "react";
import { isTokenValid } from "@/auth";

type AuthContextType = {
  loggedIn: boolean;
  login: (token: string) => void;
  logout: () => void;
  getToken: () => string | null;
  setToken: (token: string) => void;
};

export const authContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  const getToken = () => localStorage.getItem("token");

  const setToken = (token: string) => {
    localStorage.setItem("token", token);
    setLoggedIn(true);
  };

  const login = (token: string) => setToken(token);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    setLoggedIn(false);
  };

  useEffect(() => {
    const check = () => {
      const t = getToken();

      const ok = isTokenValid();
      setLoggedIn(ok);
    };

    check();
    window.addEventListener("storage", check);
    return () => window.removeEventListener("storage", check);
  }, []);

  if (loggedIn === null) {
    return <div>Laster …</div>;
  }

  return (
    <authContext.Provider value={{ loggedIn, login, logout, getToken, setToken }}>
      {children}
    </authContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(authContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
