type Locale = "en" | "fr" | "rw"

const dictionaries: Record<Locale, Record<string, string>> = {
  en: {
    brand: "Tuganire News",
    home: "Home",
    articles: "Articles",
    categories: "Categories",
    careers: "Careers",
    subscribe: "Subscribe Now",
  },
  fr: {
    brand: "Tuganire Actualités",
    home: "Accueil",
    articles: "Articles",
    categories: "Catégories",
    careers: "Carrières",
    subscribe: "S'abonner",
  },
  rw: {
    brand: "Tuganire Amakuru",
    home: "Ahabanza",
    articles: "Inkuru",
    categories: "Ibyiciro",
    careers: "Akazi",
    subscribe: "Iyandikishe",
  },
}

export function getLocaleFromEnv(): Locale {
  if (typeof window !== "undefined") {
    const saved = (window.localStorage.getItem("locale") || "").toLowerCase()
    if (saved === "en" || saved === "fr" || saved === "rw") return saved as Locale
  }
  const env = (process.env.NEXT_PUBLIC_LOCALE || "en").toLowerCase()
  if (env === "fr" || env === "rw") return env as Locale
  return "en"
}

export function t(key: string, locale: Locale = getLocaleFromEnv()): string {
  return dictionaries[locale][key] || dictionaries.en[key] || key
}

export function availableLocales(): Locale[] {
  return ["en", "fr", "rw"]
}

export function setLocale(locale: Locale) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("locale", locale)
  }
}
