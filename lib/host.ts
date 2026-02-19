export type HostRole = "reporter" | "admin" | "superadmin" | null

export function roleFromHost(host?: string): HostRole {
  const h = (host || "").toLowerCase()
  if (h.startsWith("reporter.")) return "reporter"
  if (h.startsWith("admin.")) return "admin"
  if (h.startsWith("superadmin.")) return "superadmin"
  return null
}

export function brandFromHost(host?: string): string | null {
  const role = roleFromHost(host)
  if (!role) return null
  if (role === "reporter") return "Reporter"
  if (role === "admin") return "Admin"
  if (role === "superadmin") return "SuperAdmin"
  return null
}
