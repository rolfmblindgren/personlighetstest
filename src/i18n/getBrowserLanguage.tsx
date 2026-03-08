import { languages, type LanguageCode } from "@/i18n/languages";

export function getBrowserLanguage(): LanguageCode {
  const browser = navigator.language.toLowerCase().split("-")[0];

  if (browser in languages) {
    return browser as LanguageCode;
  }

  if (browser === "no") return "nb";

  return "nb";
}
