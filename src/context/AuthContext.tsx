import React, { createContext, useState, useEffect, useContext } from "react";
import { isTokenValid } from "@/auth";

type AuthContextType = {
  loggedIn: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export const authContext = createContext<AuthContextType>({
  loggedIn: false,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    setLoggedIn(isTokenValid());
    const check = () => setLoggedIn(isTokenValid());
    window.addEventListener("storage", check);
    return () => window.removeEventListener("storage", check);
  }, []);

  if (loggedIn === null) {
    // kort loader før auth-status er kjent
    return <div className="p-8 text-center text-gray-500">Laster …</div>;
  }

  return (
    <AuthContext.Provider value={{ loggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(authContext);
}
