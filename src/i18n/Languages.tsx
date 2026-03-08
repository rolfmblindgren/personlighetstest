// src/i18n/languages.ts
export const languages = {
  nb: "bokmål",
  nn: "nynorsk",
  se: "nordsamisk",
  fkv: "kvensk",
} as const

export type LanguageCode = keyof typeof languages
