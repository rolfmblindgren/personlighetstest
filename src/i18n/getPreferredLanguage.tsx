import { languages, type LanguageCode } from "@/i18n/languages";

export function getBrowserLanguage(): LanguageCode {
  const candidates = [
    navigator.language,
    ...(navigator.languages || []),
  ]
    .filter(Boolean)
    .map((s) => s.toLowerCase());

  for (const lang of candidates) {
    const base = lang.split("-")[0];

    if (base in languages) {
      return base as LanguageCode;
    }

    if (base === "no") return "nb";
    if (base === "kv") return "fkv";
  }

  return "nb";
}

export function getStoredLanguage(): LanguageCode | null {
  const stored =
    localStorage.getItem("testLanguage") ||
    localStorage.getItem("locale");

  if (stored && stored in languages) {
    return stored as LanguageCode;
  }

  return null;
}

export function getPreferredLanguage(profileLanguage?: string | null): LanguageCode {
  if (profileLanguage && profileLanguage in languages) {
    return profileLanguage as LanguageCode;
  }

  const stored = getStoredLanguage();
  if (stored) {
    return stored;
  }

  return getBrowserLanguage();
}
