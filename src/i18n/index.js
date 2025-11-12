// src/i18n/index.js
import nb from "./nb";
import nn from "./nn";
import se from "./se";
import fkv from "./fkv";

import { I18nContext } from "./I18nContext";


// ev. import fkv from "./fkv" (kvensk) senere

// Registrer bare grunnkoder her
const strings = { nb, nn, se, fkv };

const DEFAULT_LOCALE = "nb";

// normaliser «nb», «nb_NO», «nb-NO»
export function normalizeLocale(tag) {
  if (!tag) return DEFAULT_LOCALE;
  const clean = String(tag).replace("_", "-").toLowerCase();  // nb-no
  const [base] = clean.split("-");                             // nb
  return { full: clean, base };
}

export function getLocale() {
  // 1) lagret valg  2) nettleser  3) default
  const stored = localStorage.getItem("locale");
  const browser = navigator.language || navigator.userLanguage; // f.eks. "nb-NO"
  return stored || browser || DEFAULT_LOCALE;
}

export function setLocale(tag) {
  localStorage.setItem("locale", tag);
}

export function t(key, { lower = false, upper = false } = {}) {
  const lang = localStorage.getItem("locale") || "nb";
  let text = strings[lang]?.[key] ?? `⚠️ ${key}`;

  if (lower) {
    text = text.charAt(0).toLowerCase() + text.slice(1);
  }
  if (upper) {
    text = text.toUpperCase();
  }

  return text;
}

export function useT() {
  const lang = localStorage.getItem("locale") || "nb";

  return (key, { lower = false, upper = false } = {}) => {
    const text = strings[lang]?.[key] ?? `⚠️ ${key}`;
    let result = text;
    if (lower) result = result.charAt(0).toLowerCase() + result.slice(1);
    if (upper) result = result.toUpperCase();
    return result;
  };
}
