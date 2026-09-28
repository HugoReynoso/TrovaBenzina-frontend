export const SUPPORTED_LOCALES = [
  { code: "it", label: "Italiano", shortLabel: "IT" },
  { code: "en", label: "English", shortLabel: "EN" },
  { code: "es", label: "Español", shortLabel: "ES" },
  { code: "fr", label: "Français", shortLabel: "FR" },
  { code: "de", label: "Deutsch", shortLabel: "DE" }
] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]["code"];

export const alternateLanguages = {
  it: "/",
  en: "/?lang=en",
  es: "/?lang=es",
  fr: "/?lang=fr",
  de: "/?lang=de"
};
