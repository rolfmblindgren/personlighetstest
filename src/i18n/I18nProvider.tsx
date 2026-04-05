import { createContext, useContext, useEffect, useState } from "react";
import { getLocale, normalizeLocale, setLocale } from "./index";

export const I18nContext = createContext({
  lang: "nb",
  setLang: (lang: string) => {},
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState("nb");

  useEffect(() => {
    const { base, full } = normalizeLocale(getLocale());
    setLangState(base);
    document.documentElement.setAttribute("lang", full);
  }, []);

  function setLang(lang: string) {
    setLangState(lang);
    setLocale(lang);
    document.documentElement.setAttribute("lang", lang);
  }

  return (
    <I18nContext.Provider value={{ lang, setLang }}>
      {children}
    </I18nContext.Provider>
  );
}

// valgfritt: lettvint tilgang uten å importere useContext hver gang
export function useI18n() {
  return useContext(I18nContext);
}
