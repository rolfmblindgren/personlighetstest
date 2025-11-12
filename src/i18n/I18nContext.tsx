// src/i18n/I18nContext.tsx
import { createContext, useState, useEffect, ReactNode } from "react";
import { getLocale, normalizeLocale, setLocale } from "./index";

export const I18nContext = createContext({
  lang: "nb",
  setLang: (lang: string) => {},
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState("nb");

  useEffect(() => {
    const { base } = normalizeLocale(getLocale());
    setLangState(base);
  }, []);

  function setLang(lang) {
    setLangState(lang);
    setLocale(lang);
  }

  return (
    <I18nContext.Provider value={{ lang, setLang }}>
      {children}
    </I18nContext.Provider>
  );
}
