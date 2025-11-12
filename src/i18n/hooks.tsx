import { useContext } from "react";
import { I18nContext } from "@/i18n/I18nProvider";

// Enkel hook som returnerer aktivt språk, f.eks. "nb" | "nn" | "en"
export function useLang(): string {
  const ctx = useContext(I18nContext);
  return ctx?.lang || "nb";
}
