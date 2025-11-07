"use client"

import { availableLocales, setLocale, getLocaleFromEnv } from "@/lib/i18n"

export function LocaleSwitcher() {
  const current = getLocaleFromEnv()
  const locales = availableLocales()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as ReturnType<typeof getLocaleFromEnv>
    // @ts-ignore safe cast to supported locale
    setLocale(next)
    if (typeof window !== "undefined") window.location.reload()
  }

  return (
    <select
      aria-label="Change language"
      onChange={handleChange}
      defaultValue={current}
      className="h-8 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-700 hover:bg-slate-50"
    >
      {locales.map((loc) => (
        <option key={loc} value={loc}>
          {loc.toUpperCase()}
        </option>
      ))}
    </select>
  )
}
