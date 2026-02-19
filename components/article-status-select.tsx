"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"

interface ArticleStatusSelectProps {
  articleId: string
  currentStatus: string
  updateStatus: (formData: FormData) => Promise<void>
}

export function ArticleStatusSelect({ articleId, currentStatus, updateStatus }: ArticleStatusSelectProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value
    if (newStatus === currentStatus) return

    const formData = new FormData()
    formData.append("id", articleId)
    formData.append("status", newStatus)

    startTransition(async () => {
      await updateStatus(formData)
      router.refresh()
    })
  }

  return (
    <select
      value={currentStatus}
      onChange={handleChange}
      disabled={isPending}
      className="text-sm border rounded px-2 py-1 disabled:opacity-50"
    >
      <option value="draft">Draft</option>
      <option value="submitted">Submitted</option>
      <option value="published">Published</option>
    </select>
  )
}

