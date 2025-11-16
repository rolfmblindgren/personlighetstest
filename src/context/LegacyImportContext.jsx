import { createContext, useContext, useState } from "react";

const LegacyImportContext = createContext(null);

export function LegacyImportProvider({ children }) {
  const [isImporting, setIsImporting] = useState(false);

  return (
    <LegacyImportContext.Provider value={{ isImporting, setIsImporting }}>
      {children}
    </LegacyImportContext.Provider>
  );
}

export function useLegacyImport() {
  const ctx = useContext(LegacyImportContext);
  if (!ctx) throw new Error("useLegacyImport must be inside LegacyImportProvider");
  return ctx;
}
