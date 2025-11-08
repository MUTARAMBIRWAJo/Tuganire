export function formatDateUTC(iso: string, locale: string = "en-GB"): string {
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ""
    const fmt = new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "UTC",
    })
    return fmt.format(d)
  } catch {
    return ""
  }
}

export function formatISODate(iso: string): string {
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ""
    const y = d.getUTCFullYear()
    const m = String(d.getUTCMonth() + 1).padStart(2, "0")
    const da = String(d.getUTCDate()).padStart(2, "0")
    return `${y}-${m}-${da}`
  } catch {
    return ""
  }
}
