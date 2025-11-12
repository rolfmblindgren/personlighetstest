import { createContext, useState, useContext } from "react";

export const I18nContext = createContext({
  lang: "nb",
  setLang: (lang: string) => {},
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState("nb");
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
