"use client"

import { useEffect, useState } from "react"

export function SimpleToast({ message }: { message?: string }) {
  const [open, setOpen] = useState<boolean>(!!message)
  useEffect(() => {
    if (message) {
      setOpen(true)
      const t = setTimeout(() => setOpen(false), 2500)
      return () => clearTimeout(t)
    }
  }, [message])
  if (!open || !message) return null
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="rounded-md bg-slate-900 text-white px-4 py-2 shadow-lg">
        <span className="text-sm">{message}</span>
      </div>
    </div>
  )
}
